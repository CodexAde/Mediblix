import Product from "../models/Product.js";
import {
  SYSTEM_PROMPT,
  INTENT_CLASSIFIER_PROMPT,
  SYMPTOM_ANALYSIS_PROMPT,
  ALTERNATIVE_PROMPT,
  APP_GUIDE_KNOWLEDGE,
  GENERAL_CHAT_PROMPT,
} from "../utils/medAgentPrompts.js";

// ─────────────────────────────────────────────────
// Helper: Call Gemini API
// ─────────────────────────────────────────────────
const callGemini = async (prompt, systemPrompt = "") => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is not configured");
  }

  const parts = [];
  if (systemPrompt) {
    parts.push({ text: systemPrompt });
  }
  parts.push({ text: prompt });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
      }),
    }
  );

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || "Gemini API error");
  }

  let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No response from AI");
  }

  return text;
};

// ─────────────────────────────────────────────────
// Helper: Parse JSON from Gemini response
// ─────────────────────────────────────────────────
const parseGeminiJSON = (text) => {
  // Try to extract JSON object or array from the response
  let cleaned = text.replace(/```json/gi, "").replace(/```/gi, "").trim();

  // Try object first
  const objStart = cleaned.indexOf("{");
  const objEnd = cleaned.lastIndexOf("}");
  const arrStart = cleaned.indexOf("[");
  const arrEnd = cleaned.lastIndexOf("]");

  // Determine which comes first — object or array
  if (objStart !== -1 && objEnd > objStart && (arrStart === -1 || objStart < arrStart)) {
    cleaned = cleaned.substring(objStart, objEnd + 1);
  } else if (arrStart !== -1 && arrEnd > arrStart) {
    cleaned = cleaned.substring(arrStart, arrEnd + 1);
  }

  return JSON.parse(cleaned);
};

// ─────────────────────────────────────────────────
// Helper: Cross-reference medicines with inventory
// ─────────────────────────────────────────────────
const crossReferenceInventory = async (medicines) => {
  const allProducts = await Product.find({});
  const now = new Date();

  return medicines.map((med) => {
    const searchTerms = [
      med.genericName?.toLowerCase(),
      ...(med.commonBrandNames || []).map((b) => b.toLowerCase()),
    ].filter(Boolean);

    // Find best matching product
    let bestMatch = null;
    let bestScore = 0;

    for (const product of allProducts) {
      const productName = product.name.toLowerCase();
      for (const term of searchTerms) {
        // Exact match
        if (productName === term) {
          bestMatch = product;
          bestScore = 100;
          break;
        }
        // Contains match
        if (productName.includes(term) || term.includes(productName)) {
          const score = Math.min(productName.length, term.length) / Math.max(productName.length, term.length) * 80;
          if (score > bestScore) {
            bestMatch = product;
            bestScore = score;
          }
        }
        // Word overlap match
        const productWords = productName.split(/\s+/);
        const termWords = term.split(/\s+/);
        const overlap = productWords.filter((w) => termWords.some((tw) => tw.includes(w) || w.includes(tw)));
        if (overlap.length > 0) {
          const score = (overlap.length / Math.max(productWords.length, termWords.length)) * 60;
          if (score > bestScore) {
            bestMatch = product;
            bestScore = score;
          }
        }
      }
      if (bestScore === 100) break;
    }

    // Only match if score is decent
    if (bestMatch && bestScore >= 30) {
      const isExpired = bestMatch.expiryDate && new Date(bestMatch.expiryDate) < now;
      return {
        ...med,
        inventory: {
          available: !isExpired && bestMatch.status !== "Out of Stock",
          matchedProduct: bestMatch.name,
          productId: bestMatch._id,
          currentStock: bestMatch.quantity,
          stockStatus: isExpired ? "Expired" : bestMatch.status,
          pricePerUnit: bestMatch.price,
          expiryDate: bestMatch.expiryDate,
        },
      };
    }

    return {
      ...med,
      inventory: {
        available: false,
        matchedProduct: null,
        productId: null,
        currentStock: 0,
        stockStatus: "Not in Inventory",
        pricePerUnit: null,
        expiryDate: null,
      },
    };
  });
};

// ─────────────────────────────────────────────────
// POST /api/medagent/chat — Main chat endpoint
// ─────────────────────────────────────────────────
const handleChat = async (req, res) => {
  const { message, conversationHistory } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: "Message is required" });
  }

  try {
    // Step 1: Classify intent
    const intentPrompt = INTENT_CLASSIFIER_PROMPT.replace("{MESSAGE}", message);
    const intentRaw = await callGemini(intentPrompt);
    const intent = intentRaw.trim().toLowerCase().replace(/[^a-z_]/g, "");

    // Step 2: Route based on intent
    if (intent === "symptom_query") {
      // Get available categories
      const categories = await Product.distinct("category");
      const categoryList = categories.length > 0 ? categories.join(", ") : "General medicines";

      // Build symptom prompt
      const prompt = SYMPTOM_ANALYSIS_PROMPT
        .replace("{CATEGORIES}", categoryList)
        .replace("{SYMPTOMS}", message);

      const aiResponse = await callGemini(prompt, SYSTEM_PROMPT);
      const parsed = parseGeminiJSON(aiResponse);

      // Cross-reference with inventory
      let medicines = [];
      let alternatives = [];

      if (parsed.medicines && parsed.medicines.length > 0) {
        medicines = await crossReferenceInventory(parsed.medicines);

        // Auto-find alternatives for out-of-stock medicines
        const outOfStock = medicines.filter(
          (m) => !m.inventory.available && m.inventory.stockStatus !== "Expired"
        );

        if (outOfStock.length > 0) {
          for (const med of outOfStock) {
            const category = med.category;
            const alts = await Product.find({
              category: { $regex: new RegExp(category, "i") },
              status: { $ne: "Out of Stock" },
              $or: [
                { expiryDate: { $gt: new Date() } },
                { expiryDate: null },
              ],
            })
              .sort({ quantity: -1 })
              .limit(3)
              .lean();

            if (alts.length > 0) {
              alternatives.push({
                forMedicine: med.genericName,
                alternatives: alts.map((a) => ({
                  productId: a._id,
                  name: a.name,
                  category: a.category,
                  currentStock: a.quantity,
                  stockStatus: a.status,
                  price: a.price,
                  expiryDate: a.expiryDate,
                })),
              });
            }
          }
        }
      }

      return res.json({
        type: "medicine_suggestion",
        condition: parsed.condition || "General symptoms",
        severity: parsed.severity || "mild",
        doctorConsultRequired: parsed.doctorConsultRequired || false,
        message: parsed.doctorConsultRequired
          ? `⚠️ These symptoms may require immediate medical attention. Please advise the customer to consult a doctor.`
          : `Based on the symptoms, this may be associated with ${parsed.condition}. Here are the recommended medicines:`,
        medicines,
        alternatives,
        generalAdvice: parsed.generalAdvice || "",
      });
    }

    if (intent === "alternative_request") {
      // Extract medicine name from the message
      const prompt = `From the following user message, extract the medicine name they are asking an alternative for. Return ONLY the medicine name, nothing else.\n\nUser message: "${message}"`;
      const medicineName = (await callGemini(prompt)).trim();

      // Find the medicine's category
      const product = await Product.findOne({
        name: { $regex: new RegExp(medicineName, "i") },
      });

      const category = product?.category || "General";

      // Find alternatives
      const alts = await Product.find({
        category: { $regex: new RegExp(category, "i") },
        status: { $ne: "Out of Stock" },
        name: { $not: new RegExp(medicineName, "i") },
        $or: [
          { expiryDate: { $gt: new Date() } },
          { expiryDate: null },
        ],
      })
        .sort({ quantity: -1 })
        .limit(5)
        .lean();

      if (alts.length > 0) {
        // Let AI rank them
        const altNames = alts.map((a) => `${a.name} (${a.category}, Stock: ${a.quantity}, Price: ₹${a.price})`).join("\n");
        const rankPrompt = ALTERNATIVE_PROMPT
          .replace("{MEDICINE_NAME}", medicineName)
          .replace("{AVAILABLE_MEDICINES}", altNames);

        let rankedAlts = alts; // Default to unranked
        try {
          const rankResponse = await callGemini(rankPrompt, SYSTEM_PROMPT);
          const ranking = parseGeminiJSON(rankResponse);

          if (Array.isArray(ranking) && ranking.length > 0) {
            // Re-order alts based on AI ranking
            rankedAlts = ranking
              .map((r) => {
                const match = alts.find(
                  (a) => a.name.toLowerCase() === r.name?.toLowerCase()
                );
                if (match) {
                  return { ...match, suitabilityNote: r.suitabilityNote || "" };
                }
                return null;
              })
              .filter(Boolean);

            // Add any alts not in ranking at the end
            const rankedNames = rankedAlts.map((r) => r.name.toLowerCase());
            const unranked = alts.filter(
              (a) => !rankedNames.includes(a.name.toLowerCase())
            );
            rankedAlts = [...rankedAlts, ...unranked];
          }
        } catch {
          // If AI ranking fails, use default order
        }

        return res.json({
          type: "alternative",
          originalMedicine: medicineName,
          message: `Here are available alternatives for "${medicineName}":`,
          alternatives: rankedAlts.map((a) => ({
            productId: a._id,
            name: a.name,
            category: a.category,
            currentStock: a.quantity,
            stockStatus: a.status,
            price: a.price,
            expiryDate: a.expiryDate,
            suitabilityNote: a.suitabilityNote || "",
          })),
        });
      }

      return res.json({
        type: "alternative",
        originalMedicine: medicineName,
        message: `No alternatives found for "${medicineName}" in your current inventory. You may want to create a purchase order to restock.`,
        alternatives: [],
      });
    }

    if (intent === "app_guidance") {
      const prompt = APP_GUIDE_KNOWLEDGE.replace("{QUESTION}", message);
      const aiResponse = await callGemini(prompt);
      const parsed = parseGeminiJSON(aiResponse);

      return res.json({
        type: "app_guidance",
        message: parsed.message || "I can help you navigate the Mediblix app!",
        steps: parsed.steps || null,
        navigateTo: parsed.navigateTo || null,
        pageTitle: parsed.pageTitle || null,
      });
    }

    // General chat
    const prompt = GENERAL_CHAT_PROMPT.replace("{MESSAGE}", message);
    const aiResponse = await callGemini(prompt);
    const parsed = parseGeminiJSON(aiResponse);

    return res.json({
      type: "general",
      message: parsed.message || "Hi! I'm MedAgent, your AI pharmacy assistant. I can help you find medicines for symptoms, suggest alternatives, or guide you through the Mediblix app. What would you like help with?",
    });
  } catch (error) {
    console.error("MedAgent Error:", error.message);
    res.status(500).json({
      type: "error",
      message:
        "I'm having trouble processing that right now. Please try again in a moment, or browse the Inventory page directly to find medicines.",
    });
  }
};

// ─────────────────────────────────────────────────
// POST /api/medagent/alternatives — Direct alternatives lookup
// ─────────────────────────────────────────────────
const getAlternatives = async (req, res) => {
  const { medicineName, category } = req.body;

  if (!medicineName) {
    return res.status(400).json({ message: "Medicine name is required" });
  }

  try {
    const searchCategory = category || "General";

    const alts = await Product.find({
      category: { $regex: new RegExp(searchCategory, "i") },
      status: { $ne: "Out of Stock" },
      name: { $not: new RegExp(medicineName, "i") },
      $or: [
        { expiryDate: { $gt: new Date() } },
        { expiryDate: null },
      ],
    })
      .sort({ quantity: -1 })
      .limit(5)
      .lean();

    return res.json({
      originalMedicine: medicineName,
      alternatives: alts.map((a) => ({
        productId: a._id,
        name: a.name,
        category: a.category,
        currentStock: a.quantity,
        stockStatus: a.status,
        price: a.price,
        expiryDate: a.expiryDate,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────
// GET /api/medagent/categories — List inventory categories
// ─────────────────────────────────────────────────
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { handleChat, getAlternatives, getCategories };
