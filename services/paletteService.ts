
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function fileToGenerativePart(file: File): Promise<{mimeType: string, data: string}> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target && typeof e.target.result === 'string') {
                const base64 = e.target.result.split(',')[1];
                resolve({
                    mimeType: file.type,
                    data: base64,
                });
            } else {
                reject(new Error('Failed to read file as data URL.'));
            }
        };
        reader.onerror = (e) => reject(new Error('File reading error.'));
        reader.readAsDataURL(file);
    });
}

export const generatePaletteFromImage = async (imageFile: File, prompt: string, colorCount: number): Promise<string[]> => {
    const imagePart = await fileToGenerativePart(imageFile);

    const fullPrompt = `Analyze the attached image and the user's request: "${prompt}". 
    Generate a color palette of exactly ${colorCount} colors that fits the theme.
    The palette should be aesthetically pleasing and suitable for pixel art.
    Return the palette as an array of hex color codes.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: imagePart },
                { text: fullPrompt }
            ]
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    palette: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING,
                            description: 'A hex color code, e.g., "#RRGGBB"',
                        },
                    },
                },
                required: ['palette'],
            },
        },
    });

    const jsonString = response.text;
    const result = JSON.parse(jsonString);

    if (!result.palette || !Array.isArray(result.palette)) {
        throw new Error('Invalid palette format received from AI.');
    }

    return result.palette;
};
