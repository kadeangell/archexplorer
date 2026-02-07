import { generateText, tool, stepCountIs } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});
import { z } from "zod";
import type { Coordinates, ArchitecturalDetail } from "../types";
import { queryNearbyBuildings } from "./overpassService";
import { getWikidataImages } from "./wikidataService";

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
    try {
      const buildings = await queryNearbyBuildings(latitude, longitude, radiusMeters);
      const wikidataIds = buildings
        .map((b) => b.wikidataId)
        .filter((id): id is string => !!id);
      const imageMap = await getWikidataImages(wikidataIds);

      return {
        buildings: buildings.map((b) => ({
          osmId: b.osmId,
          name: b.name,
          lat: b.lat,
          lon: b.lon,
          wikidataId: b.wikidataId ?? null,
          imageUrl: b.wikidataId ? imageMap[b.wikidataId] ?? null : null,
          tags: b.tags,
        })),
        count: buildings.length,
      };
    } catch (error) {
      console.warn("Overpass lookup failed, falling back to AI knowledge:", error);
      return {
        query: { latitude, longitude, radiusMeters },
        note: "Overpass API unavailable. Use your own knowledge for architectural details.",
      };
    }
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
    try {
      const buildings = await queryNearbyBuildings(latitude, longitude, 200);
      const match = buildings.find(
        (b) => b.name.toLowerCase() === buildingName.toLowerCase()
      );
      if (match) {
        const imageMap = match.wikidataId
          ? await getWikidataImages([match.wikidataId])
          : {};
        return {
          osmId: match.osmId,
          name: match.name,
          lat: match.lat,
          lon: match.lon,
          wikidataId: match.wikidataId ?? null,
          imageUrl: match.wikidataId ? imageMap[match.wikidataId] ?? null : null,
          tags: match.tags,
        };
      }
      return {
        buildingName,
        location: { latitude, longitude },
        note: "Building not found in OpenStreetMap. Use your own knowledge for details.",
      };
    } catch (error) {
      console.warn("Building detail lookup failed:", error);
      return {
        buildingName,
        location: { latitude, longitude },
        note: "API unavailable. Use your own knowledge for details.",
      };
    }
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
- imageUrl and wikidataId from the tool results when available

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
      "distance": null,
      "imageUrl": "url or null",
      "wikidataId": "Q-id or null"
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
