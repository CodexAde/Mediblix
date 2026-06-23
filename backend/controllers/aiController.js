const parseInvoice = async (req, res) => {
  const { fileData, mimeType } = req.body;

  if (!fileData || !mimeType) {
    return res.status(400).json({ message: "File data and mime type are required" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "Gemini API Key is not configured" });
    }

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
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: fileData,
                  },
                },
                {
                  text: "You are an expert invoice and purchase sheet parser. Extract all product items listed in this document. Output a JSON array of items, where each item contains exactly these fields: name (string), sku (string), category (string), quantity (number), price (number). Generate clean SKUs if they are missing or invalid (prefix with product type, e.g. ELEC-101). Categorize them logically (e.g., Electronics, Clothing, Home & Garden, Sports, Accessories). Only return the raw JSON array inside the text block. Do not include markdown code block characters like ```json.",
                },
              ],
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
      return res.status(500).json({ message: "No data could be extracted by AI" });
    }

    textResponse = textResponse.replace(/```json/gi, "").replace(/```/gi, "").trim();
    const items = JSON.parse(textResponse);

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { parseInvoice };
