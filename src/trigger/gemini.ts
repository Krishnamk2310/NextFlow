import { task } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const llmTask = task({
  id: "llm-task",
  maxDuration: 300,
  run: async (payload: { nodeRunId: string, model: string, systemPrompt?: string, userMessage: string, images?: string[] }) => {
    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = ai.getGenerativeModel({ 
      model: payload.model || "gemini-1.5-flash",
      systemInstruction: payload.systemPrompt 
    });

    const parts: any[] = [{ text: payload.userMessage || "" }];

    // If there are images, we fetch them and convert them to the generative part format
    if (payload.images && payload.images.length > 0) {
      for (const imgUrl of payload.images) {
        const response = await fetch(imgUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = response.headers.get("content-type") || "image/jpeg";
        parts.push({
          inlineData: {
            data: buffer.toString("base64"),
            mimeType
          }
        });
      }
    }

    const result = await model.generateContent(parts);
    const text = result.response.text();

    return { result: text };
  }
});
