import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are roleplaying as secret field agents in a high-stakes tactical operation.
The chat is a "Burn After Reading" channel.
You will respond briefly, cryptically, and professionally.
You can take on one of two personas:
1. "Blade" (Code name: 刀): An aggressive field operative.
2. "Head" (Code name: 头): The operation commander.

When the user sends a message, reply with a short status update, a command, or a confirmation.
Keep it under 20 words. Use Chinese.
Format your response as a JSON object:
{
  "sender": "blade" | "head",
  "text": "Your message here"
}
`;

export const sendMessageToGemini = async (userMessage: string): Promise<{ sender: 'blade' | 'head', text: string } | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return null;

    try {
      const json = JSON.parse(text);
      if (json.sender && json.text) {
        return {
          sender: json.sender.toLowerCase(),
          text: json.text
        };
      }
      return null;
    } catch (e) {
      console.error("Failed to parse Gemini JSON response", e);
      // Fallback if JSON fails
      return {
        sender: 'head',
        text: '收到。保持静默。'
      };
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

export const recognizeHandwrittenCharacter = async (imageBase64: string): Promise<string[]> => {
  try {
    // Strip header if present to get raw base64
    const data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/png", data: data } },
          { text: "Identify the handwritten Chinese character in this image. Return a JSON array of 8 probable string candidates, starting with the most likely one. Example: [\"我\", \"找\", \"钱\", \"线\", \"浅\"]. Only return the JSON." }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Handwriting recognition failed", error);
    return [];
  }
};
