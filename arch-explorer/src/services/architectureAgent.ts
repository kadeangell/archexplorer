import { generateText, tool, stepCountIs } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});
import { z } from "zod";
import type { Coordinates, ArchitecturalDetail } from "../types";

// Tool: look up buildings near coordinates
const lookupBuildings = tool({
  description:
    "Look up notable buildings and architectural landmarks near the given GPS coordinates. Returns information about nearby structures.",
  inputSchema: z.object({
    latitude: z.number().describe("Latitude of the location"),
    longitude: z.number().describe("Longitude of the location"),
    radiusMeters: z
      .number()
      .default(500)
      .describe("Search radius in meters"),
  }),
  execute: async ({ latitude, longitude, radiusMeters }) => {
    // TODO: Integrate with real data source (OpenStreetMap Overpass API,
    // Google Places, or similar). For now, return the query parameters
    // so the LLM uses its own knowledge.
    return {
      query: { latitude, longitude, radiusMeters },
      note: "Using AI knowledge for architectural details. Real API integration pending.",
    };
  },
});

// Tool: get detailed info about a specific building
const getBuildingDetails = tool({
  description:
    "Get detailed architectural information about a specific building by name and location.",
  inputSchema: z.object({
    buildingName: z.string().describe("Name of the building"),
    latitude: z.number().describe("Approximate latitude"),
    longitude: z.number().describe("Approximate longitude"),
  }),
  execute: async ({ buildingName, latitude, longitude }) => {
    // TODO: Integrate with real architectural database
    return {
      buildingName,
      location: { latitude, longitude },
      note: "Using AI knowledge for details. Real API integration pending.",
    };
  },
});

export async function queryArchitecture(
  coords: Coordinates
): Promise<{ buildings: ArchitecturalDetail[]; summary: string }> {
  const { text } = await generateText({
    model: openai("gpt-4o"),
    tools: { lookupBuildings, getBuildingDetails },
    stopWhen: stepCountIs(5),
    system: `You are an architectural expert and urban historian. When given GPS coordinates, identify notable buildings and architectural landmarks nearby.

For each building, provide:
- Name, address, architectural style, year built, architect
- A brief description and notable features
- Historical significance

Respond with valid JSON matching this structure:
{
  "buildings": [
    {
      "id": "unique-id",
      "name": "Building Name",
      "address": "Address",
      "style": "Architectural Style",
      "yearBuilt": "Year or range",
      "architect": "Architect name or Unknown",
      "description": "Brief description",
      "notableFeatures": ["feature1", "feature2"],
      "historicalSignificance": "Why it matters",
      "distance": null
    }
  ],
  "summary": "Brief overview of the architectural character of this area"
}

Use the lookupBuildings tool first, then provide detailed information. Always return valid JSON.`,
    prompt: `What notable buildings and architectural landmarks are near these coordinates? Latitude: ${coords.latitude}, Longitude: ${coords.longitude}. Use the lookupBuildings tool first, then provide your analysis as JSON.`,
  });

  try {
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { buildings: [], summary: "No architectural data found for this location." };
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      buildings: parsed.buildings || [],
      summary: parsed.summary || "Architectural details retrieved.",
    };
  } catch {
    return {
      buildings: [],
      summary: text || "Unable to parse architectural data.",
    };
  }
}
