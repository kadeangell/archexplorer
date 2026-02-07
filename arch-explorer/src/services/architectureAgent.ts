import { generateText, tool, stepCountIs } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});
import { z } from "zod";
import type { Coordinates, ArchitecturalDetail } from "../types";
import { queryNearbyBuildingsWikidata } from "./wikidataService";

// Tool: look up buildings near coordinates via Wikidata SPARQL
const lookupBuildings = tool({
  description:
    "Look up notable buildings and architectural landmarks near the given GPS coordinates using Wikidata. Returns structured architectural data including styles, architects, images, and heritage status.",
  inputSchema: z.object({
    latitude: z.number().describe("Latitude of the location"),
    longitude: z.number().describe("Longitude of the location"),
    radiusKm: z
      .number()
      .default(0.5)
      .describe("Search radius in kilometers"),
  }),
  execute: async ({ latitude, longitude, radiusKm }) => {
    try {
      const buildings = await queryNearbyBuildingsWikidata(latitude, longitude, radiusKm);

      return {
        buildings: buildings.map((b) => ({
          wikidataId: b.wikidataId,
          name: b.name,
          lat: b.lat,
          lon: b.lon,
          style: b.style ?? null,
          architect: b.architect ?? null,
          yearBuilt: b.yearBuilt ?? null,
          imageUrl: b.imageUrl ?? null,
          floors: b.floors ?? null,
          height: b.height ?? null,
          heritageStatus: b.heritageStatus ?? null,
        })),
        count: buildings.length,
        source: "wikidata",
      };
    } catch (error) {
      console.warn("Wikidata lookup failed, falling back to AI knowledge:", error);
      return {
        query: { latitude, longitude, radiusKm },
        note: "Wikidata API unavailable. Use your own knowledge for architectural details.",
      };
    }
  },
});

// Tool: get detailed info about a specific building by searching Wikidata
const getBuildingDetails = tool({
  description:
    "Get detailed architectural information about a specific building by name and location from Wikidata.",
  inputSchema: z.object({
    buildingName: z.string().describe("Name of the building"),
    latitude: z.number().describe("Approximate latitude"),
    longitude: z.number().describe("Approximate longitude"),
  }),
  execute: async ({ buildingName, latitude, longitude }) => {
    try {
      const buildings = await queryNearbyBuildingsWikidata(latitude, longitude, 0.3);
      const match = buildings.find(
        (b) => b.name.toLowerCase().includes(buildingName.toLowerCase()) ||
          buildingName.toLowerCase().includes(b.name.toLowerCase()),
      );
      if (match) {
        return {
          wikidataId: match.wikidataId,
          name: match.name,
          lat: match.lat,
          lon: match.lon,
          style: match.style ?? null,
          architect: match.architect ?? null,
          yearBuilt: match.yearBuilt ?? null,
          imageUrl: match.imageUrl ?? null,
          floors: match.floors ?? null,
          height: match.height ?? null,
          heritageStatus: match.heritageStatus ?? null,
          source: "wikidata",
        };
      }
      return {
        buildingName,
        location: { latitude, longitude },
        note: "Building not found in Wikidata. Use your own knowledge for details.",
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
  coords: Coordinates,
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
