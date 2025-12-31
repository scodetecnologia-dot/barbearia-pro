import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMarketingCopy = async (
  type: 'service' | 'bio',
  name: string,
  keywords: string
): Promise<string> => {
  try {
    const prompt = type === 'service' 
      ? `Escreva uma descrição curta, atrativa e sofisticada para um serviço de barbearia chamado "${name}". Use estas palavras-chave/características: ${keywords}. Máximo de 2 frases.`
      : `Escreva uma biografia profissional curta e confiante para um barbeiro chamado "${name}". Use estas características: ${keywords}. Máximo de 2 frases.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });

    return response.text?.trim() || "Descrição indisponível no momento.";
  } catch (error) {
    console.error("Erro ao gerar texto com Gemini:", error);
    return "Não foi possível gerar a descrição automaticamente.";
  }
};

export const generateLogoImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // Iterate through parts to find the image
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const base64EncodeString = part.inlineData.data;
          // Return full data URI
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao gerar imagem com Gemini:", error);
    return null;
  }
};
