import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { ImageConversationResult } from "../types";

const openai = createOpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

export async function analyzeArchitectureImage(
  base64Image: string
): Promise<ImageConversationResult> {
  try {
    const base64DataUrl = `data:image/jpeg;base64,${base64Image}`;

    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "system",
          content: `You are an expert architectural historian. Analyze this image and identify: the architectural style, estimated era of construction, notable features, materials, and any historical context. Respond with valid JSON matching: { "analysis": "string", "architecturalStyle": "string or null", "estimatedEra": "string or null", "notableFeatures": ["string"] }`,
        },
        {
          role: "user",
          content: [
            { type: "image", image: base64DataUrl },
            {
              type: "text",
              text: "Analyze this architectural image. Identify the style, era, notable features, and provide a detailed analysis. Return valid JSON only.",
            },
          ],
        },
      ],
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        analysis: text,
        architecturalStyle: null,
        estimatedEra: null,
        notableFeatures: [],
        loading: false,
        error: null,
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      analysis: parsed.analysis || "Analysis complete.",
      architecturalStyle: parsed.architecturalStyle || null,
      estimatedEra: parsed.estimatedEra || null,
      notableFeatures: parsed.notableFeatures || [],
      loading: false,
      error: null,
    };
  } catch (e) {
    return {
      analysis: "",
      architecturalStyle: null,
      estimatedEra: null,
      notableFeatures: [],
      loading: false,
      error: e instanceof Error ? e.message : "Failed to analyze image",
    };
  }
}
