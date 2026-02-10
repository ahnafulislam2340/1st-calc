
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const solveWithAI = async (query: string, imageBase64?: string) => {
  const model = imageBase64 ? 'gemini-3-flash-preview' : 'gemini-3-flash-preview';
  
  const systemInstruction = `You are an expert math and science tutor. 
  When a user provides a problem, break it down into logical steps. 
  If the input is an image, describe the problem first.
  Provide the final answer clearly.
  Format your response as a JSON object with properties: 'answer', 'explanation', and 'steps' (array).`;

  try {
    const parts: any[] = [{ text: query }];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            steps: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['answer', 'explanation']
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw error;
  }
};
