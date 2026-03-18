
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeHabit = async (category: string, description: string, photoBase64?: string) => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Analyze this eco-friendly habit:
    Category: ${category}
    Description: ${description}
    
    Calculate the estimated CO2 savings in kg (kilograms) for this single action. 
    Return a JSON object with:
    1. co2Saved (number, kg)
    2. encouragement (string, short message)
    3. fact (string, one interesting environmental fact related to this action)
  `;

  const parts: any[] = [{ text: prompt }];
  if (photoBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: photoBase64.split(',')[1] || photoBase64
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            co2Saved: { type: Type.NUMBER },
            encouragement: { type: Type.STRING },
            fact: { type: Type.STRING }
          },
          required: ["co2Saved", "encouragement", "fact"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return { co2Saved: 0.5, encouragement: "Great job keeping it green!", fact: "Every small action counts." };
  }
};

export const getEcoTip = async (location: { lat: number, lng: number } | null) => {
  const model = 'gemini-3-flash-preview';
  const locationContext = location ? `User is at latitude ${location.lat}, longitude ${location.lng}. Give a tip relevant to their local climate or geography.` : "Give a general seasonal eco tip.";
  
  const prompt = `
    ${locationContext}
    Provide a daily eco-friendly tip.
    Return a JSON object with:
    1. title (string)
    2. content (string)
    3. category (string)
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            category: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return { 
      title: "Conserve Energy", 
      content: "Switch off lights when leaving a room to save electricity.",
      category: "Energy"
    };
  }
};
