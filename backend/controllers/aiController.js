const parseInvoice = async (req, res) => {
  const { fileData, mimeType, files } = req.body;

  if ((!fileData || !mimeType) && (!files || !Array.isArray(files))) {
    return res.status(400).json({ message: "File data or files array is required" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "Gemini Api Key is not configured" });
    }

    const parts = [];
    if (files && Array.isArray(files) && files.length > 0) {
      for (const file of files) {
        if (file.fileData && file.mimeType) {
          const cleanMimeType = file.mimeType.split(';')[0].trim();
          parts.push({
            inlineData: {
              mimeType: cleanMimeType,
              data: file.fileData,
            }
          });
        }
      }
    } else {
      const cleanMimeType = mimeType.split(';')[0].trim();
      parts.push({
        inlineData: {
          mimeType: cleanMimeType,
          data: fileData,
        }
      });
    }

    parts.push({
      text: "You are an expert pharmaceutical invoice and purchase sheet parser. Extract all medicine product items listed in this document or mentioned in this audio recording. Output a JSON array of items, where each item contains exactly these fields: name (string), sku (string), category (string), quantity (number), price (number), expiryDate (string, YYYY-MM-DD or null), packaging (string), tabletsPerStrip (number). Generate clean SKUs if they are missing or invalid (prefix with PHR-, e.g. PHR-101). Categorize them logically (e.g., Analgesics, Antibiotics, Diabetes, Cardiology, Vitamins, Antacids, Antivirals). Only return a raw JSON array inside the text block. If no products can be found, return an empty JSON array: []. Do not include markdown code block characters or any explaining text.",
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts,
            },
          ],
        }),
      }
    );

    const data = await response.json();
    if (data.error) {
      return res.status(data.error.code || 500).json({ message: data.error.message });
    }

    let textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      return res.status(500).json({ message: "No data could be extracted by Ai" });
    }

    const startIdx = textResponse.indexOf('[');
    const endIdx = textResponse.lastIndexOf(']');
    
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      textResponse = textResponse.substring(startIdx, endIdx + 1);
    } else {
      textResponse = textResponse.replace(/```json/gi, "").replace(/```/gi, "").trim();
    }

    try {
      const items = JSON.parse(textResponse);
      res.json(items);
    } catch (parseError) {
      res.status(422).json({ message: "Ai response was not in a valid format. Please ensure the document contains a clear product list." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const parseBill = async (req, res) => {
  const { fileData, mimeType, files } = req.body;

  if ((!fileData || !mimeType) && (!files || !Array.isArray(files))) {
    return res.status(400).json({ message: "File data or files array is required" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "Gemini Api Key is not configured" });
    }

    const parts = [];

    if (files && Array.isArray(files)) {
      files.forEach((f) => {
        const cleanMime = f.mimeType.split(';')[0].trim();
        parts.push({
          inlineData: {
            mimeType: cleanMime,
            data: f.fileData,
          }
        });
      });
    } else {
      const cleanMimeType = mimeType.split(';')[0].trim();
      parts.push({
        inlineData: {
          mimeType: cleanMimeType,
          data: fileData,
        }
      });
    }

    parts.push({
      text: "You are an expert sales sales bill and customer invoice parser. Extract the customer information and the pharmaceutical product items listed in this document or mentioned in this audio recording. Output a JSON object containing exactly these keys: customerName (string or null), customerMobile (string containing 10-digit mobile number or null), items (array of objects where each object has: name (string), sku (string), quantity (number), price (number), unit (string, either 'Strip' or 'Tablet', default 'Strip')). Generate clean SKUs if they are missing or invalid. Only return a raw JSON object. Do not include markdown code block characters or any explaining text.",
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts,
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini API Response:", JSON.stringify(data, null, 2));
    if (data.error) {
      return res.status(data.error.code || 500).json({ message: data.error.message });
    }

    let textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      return res.status(500).json({ message: "No data could be extracted by Ai" });
    }

    const startIdx = textResponse.indexOf('{');
    const endIdx = textResponse.lastIndexOf('}');
    
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      textResponse = textResponse.substring(startIdx, endIdx + 1);
    } else {
      textResponse = textResponse.replace(/```json/gi, "").replace(/```/gi, "").trim();
    }

    try {
      const parsed = JSON.parse(textResponse);
      res.json(parsed);
    } catch (parseError) {
      res.status(422).json({ message: "Ai response was not in a valid format. Please ensure the document is readable or the audio is clear." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { parseInvoice, parseBill };
