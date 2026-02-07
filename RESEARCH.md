# Architectural Data Sources & API Research

> Research for GPS-based building identification app using Vercel AI SDK v6 + Expo

---

## 1. Building Identification from GPS Coordinates

### 1.1 OpenStreetMap Overpass API (FREE, No API Key)

**Endpoint:** `https://overpass-api.de/api/interpreter`

The Overpass API is a read-only API serving custom-selected parts of OSM map data. It's the best free option for identifying buildings at GPS coordinates.

**Key Query Pattern — Find building at coordinates:**
```
[out:json];
way(around:25,{lat},{lon})[building];
out body geom;
>;
out skel qt;
```

**Available Building Tags in OSM:**
| Tag | Description | Example |
|-----|-------------|---------|
| `building` | Building type | `apartments`, `church`, `commercial`, `office`, etc. (189 types) |
| `name` | Building name | `Empire State Building` |
| `building:architecture` | Architectural style | `art_deco`, `gothic`, `modern`, `brutalist`, etc. |
| `building:levels` | Number of floors | `102` |
| `height` | Height in meters | `443` |
| `building:material` | Facade material | `brick`, `stone`, `glass` |
| `building:colour` | Building color | `#FF0000` or `red` |
| `start_date` | Year built/completed | `1931` |
| `architect` | Architect name | `Shreve, Lamb & Harmon` |
| `addr:street` | Street address | `350 Fifth Avenue` |
| `roof:shape` | Roof type | `flat`, `gabled`, `dome` |
| `heritage` | Heritage designation | `2` (grade) |
| `wikidata` | Wikidata Q-ID | `Q9188` (links to rich data) |
| `wikipedia` | Wikipedia article | `en:Empire State Building` |

**Architectural Styles Supported** (chronological):
- 600-1400: Islamic, Romanesque, Gothic
- 1400-1800: Renaissance, Baroque, Rococo, Ottoman
- 1800-1900: Neoclassicism, Victorian, Georgian, Historicism (+ Neo-* variants)
- 1900-1950: Art Nouveau, Art Deco, Functionalism, International Style, Constructivism
- 1950-present: Brutalist, Postmodern, Deconstructivism, High-Tech, Contemporary

**Pros:** Free, no API key, very rich building data, global coverage
**Cons:** Rate-limited (shared public server), data quality varies by region, no guaranteed completeness
**Rate Limits:** ~10,000 requests/day on public server; can self-host for unlimited

---

### 1.2 Google Places API (New, v1)

**Endpoint:** `https://places.googleapis.com/v1/places:searchNearby`

The Google Places API provides rich POI data including building names, types, and addresses.

**Reverse Geocoding for Building ID:**
```
GET https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={API_KEY}
```

**Place Details (New) with FieldMask:**
```
GET https://places.googleapis.com/v1/places/{PLACE_ID}
Headers: X-Goog-FieldMask: displayName,formattedAddress,types,editorialSummary,addressDescriptor
```

**Available Fields:**
- `displayName` — Building/place name
- `formattedAddress` — Full address
- `types` — Place types (church, museum, school, etc.)
- `editorialSummary` — AI-generated description
- `addressDescriptor` — Landmarks and area descriptions
- `location` — Lat/lng coordinates
- `photos` — Place photos
- `rating`, `reviews` — User ratings

**Pros:** Excellent global coverage, rich POI data, reliable uptime, address descriptors
**Cons:** Paid ($32/1000 Nearby Search, $17/1000 Place Details), no architectural style data, API key required
**Free Tier:** $200/month credit (~6,000 Place Details/month)

---

### 1.3 Mapbox Geocoding API (v6)

**Endpoint:** `https://api.mapbox.com/search/geocode/v6/reverse`

**Reverse Geocoding:**
```
GET https://api.mapbox.com/search/geocode/v6/reverse?longitude={lon}&latitude={lat}&access_token={TOKEN}
```

**Features:**
- Building entrance-level precision (100M+ US addresses)
- Smart Address Match confidence scoring
- Batch geocoding (up to 1,000 queries per request)
- Forward and reverse geocoding with separate endpoints

**Pros:** Great address precision, building entrance data, generous free tier (100K requests/month)
**Cons:** Limited building metadata beyond address, no architectural data
**Pricing:** Free for 100K requests/month, then $0.75/1000

---

### 1.4 HERE Geocoding & Search API (v7)

**Endpoint:** `https://revgeocode.search.hereapi.com/v1/revgeocode`

**Reverse Geocoding:**
```
GET https://revgeocode.search.hereapi.com/v1/revgeocode?at={lat},{lon}&apiKey={KEY}
```

**Features:**
- 120M+ places, 400M+ addresses globally
- House number type (Point Address vs interpolated)
- Full address components
- Map view boundaries

**Pros:** Very large global dataset, good address quality
**Cons:** No architectural data, limited building metadata, free tier is 1,000 requests/day
**Pricing:** Free for 1K/day, paid plans start at $449/month

---

## 2. Architectural Detail Databases

### 2.1 Wikidata (FREE, No API Key)

**SPARQL Endpoint:** `https://query.wikidata.org/sparql`
**REST API:** `https://www.wikidata.org/w/api.php`

Wikidata is the richest free source of structured architectural data. 1.65B+ item statements.

**Key Properties for Buildings:**
| Property | ID | Description |
|----------|-----|-------------|
| Architectural style | P149 | Gothic, Art Deco, etc. |
| Architect | P84 | Person/firm who designed it |
| Coordinate location | P625 | GPS coordinates |
| Inception/date built | P571 | Year of construction |
| Heritage designation | P1435 | Protected status |
| Height | P2048 | Building height |
| Number of floors | P1101 | Floor count |
| Country | P17 | Country location |
| Image | P18 | Wikimedia Commons image |
| Instance of | P31 | Building, church, skyscraper, etc. |
| Named after | P138 | What/who it's named for |
| Occupant | P466 | Current occupant/tenant |
| Operator | P137 | Operating organization |
| Official website | P856 | Website URL |
| NRHP reference | P649 | National Register ID |

**Example SPARQL Query — Find buildings near coordinates with architecture info:**
```sparql
SELECT ?building ?buildingLabel ?styleLabel ?architectLabel ?coord ?image WHERE {
  SERVICE wikibase:around {
    ?building wdt:P625 ?coord.
    bd:serviceParam wikibase:center "Point({lon} {lat})"^^geo:wktLiteral.
    bd:serviceParam wikibase:radius "0.5".  # km
  }
  ?building wdt:P31/wdt:P279* wd:Q41176.  # instance of building
  OPTIONAL { ?building wdt:P149 ?style. }
  OPTIONAL { ?building wdt:P84 ?architect. }
  OPTIONAL { ?building wdt:P18 ?image. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 50
```

**Pros:** Extremely rich structured data, free, links to Wikipedia articles, images, global coverage for notable buildings
**Cons:** Only notable/documented buildings (not every house), SPARQL learning curve, query can be slow
**Rate Limits:** No hard limit, but be respectful (~1 req/sec recommended)

---

### 2.2 Wikipedia REST API (FREE)

**Summary Endpoint:**
```
GET https://en.wikipedia.org/api/rest_v1/page/summary/{title}
```

**Extract Endpoint:**
```
GET https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles={title}&format=json
```

Use after identifying a building via OSM or Wikidata (which provide Wikipedia article links). Returns human-readable descriptions, history, and architectural narratives.

**Pros:** Rich text descriptions, free, well-structured summaries
**Cons:** Only for notable buildings with articles, text requires parsing for structured facts

---

## 3. Government & Public Data Sources

### 3.1 National Register of Historic Places — NPS ArcGIS REST API (FREE)

**MapServer Base URL:**
```
https://mapservices.nps.gov/arcgis/rest/services/cultural_resources/nrhp_locations/MapServer
```

**Layers:**
- **Layer 0 (Points):** Point locations for all listed properties
- **Layer 1 (Polygons):** Boundary polygons for larger properties

**Spatial Query — Find historic places near coordinates:**
```
GET https://mapservices.nps.gov/arcgis/rest/services/cultural_resources/nrhp_locations/MapServer/0/query?
  geometry={lon},{lat}&
  geometryType=esriGeometryPoint&
  spatialRel=esriSpatialRelIntersects&
  distance=500&
  units=esriSRUnit_Meter&
  outFields=*&
  f=json
```

**Available Fields (33 total):**
| Field | Type | Description |
|-------|------|-------------|
| RESNAME | String | Resource/property name |
| ResType | String | Building, Site, District, Structure, Object |
| Address | String | Street address |
| City | String | City |
| County | String | County |
| State | String | State |
| CertDate | String | Certification/listing date |
| NRIS_Refnum | String | NRHP reference number |
| Is_NHL | String | National Historic Landmark flag |
| NumCBldg | Integer | Number of contributing buildings |
| STATUS | String | Listed, Eligible, etc. |
| NARA_URL | String | Link to NARA documentation |
| IS_EXTANT | String | Whether property still exists |

**Pros:** Authoritative US historic data, free, spatial query support, 95,000+ listed properties
**Cons:** US only, point accuracy varies, limited to historically significant buildings, no real-time API docs

### 3.2 Additional Government Sources

**State Historic Preservation Offices (SHPOs):**
- Many states maintain their own historic building databases
- Often accessible via state GIS portals
- Data quality and API availability varies by state

**Local Building Permit/Assessment Databases:**
- County assessor records often include year built, construction type, square footage
- Increasingly available via open data portals (e.g., Socrata/Tyler Technologies APIs)
- Not standardized across jurisdictions

---

## 4. Vercel AI SDK v6 — Agent Architecture

### 4.1 Overview

AI SDK 6 (latest major release) introduces first-class agent support with the `Agent` interface and `ToolLoopAgent` class. It unifies `generateObject` and `generateText` to enable multi-step tool calling loops with structured output generation.

**Key packages for Expo:**
```bash
npm install ai @ai-sdk/react @ai-sdk/anthropic zod
```

**Expo Requirements:** Expo 52+ (for `expo/fetch` streaming support)

### 4.2 ToolLoopAgent Class

The recommended way to build agents. Handles the complete tool execution loop automatically.

```typescript
import { ToolLoopAgent, stepCountIs, tool, Output } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const buildingAgent = new ToolLoopAgent({
  model: anthropic('claude-sonnet-4-5-20250929'),
  instructions: 'You identify buildings and provide architectural details from GPS coordinates.',
  tools: {
    identifyBuilding: tool({
      description: 'Identify a building at given GPS coordinates using OpenStreetMap',
      inputSchema: z.object({
        lat: z.number().describe('Latitude'),
        lon: z.number().describe('Longitude'),
      }),
      execute: async ({ lat, lon }) => {
        // Call Overpass API
      },
    }),
    getArchitecturalDetails: tool({
      description: 'Get architectural details from Wikidata for a building',
      inputSchema: z.object({
        wikidataId: z.string().describe('Wikidata Q-ID'),
      }),
      execute: async ({ wikidataId }) => {
        // Query Wikidata SPARQL
      },
    }),
    checkHistoricRegister: tool({
      description: 'Check if building is on the National Register of Historic Places',
      inputSchema: z.object({
        lat: z.number(),
        lon: z.number(),
        name: z.string().optional(),
      }),
      execute: async ({ lat, lon }) => {
        // Query NPS ArcGIS
      },
    }),
  },
  stopWhen: stepCountIs(10),
  output: Output.object({
    schema: z.object({
      buildingName: z.string(),
      address: z.string(),
      architecturalStyle: z.string().optional(),
      architect: z.string().optional(),
      yearBuilt: z.string().optional(),
      height: z.string().optional(),
      floors: z.number().optional(),
      historicStatus: z.string().optional(),
      description: z.string(),
      sources: z.array(z.string()),
    }),
  }),
});
```

### 4.3 Expo Project Structure

```
app/
├── api/
│   └── chat+api.ts          # Backend streaming route
├── (tabs)/
│   └── index.tsx             # Camera/GPS UI
├── tools/
│   ├── overpass.ts           # OSM Overpass tool
│   ├── wikidata.ts           # Wikidata SPARQL tool
│   ├── google-places.ts      # Google Places tool
│   ├── nps-historic.ts       # NPS Historic Register tool
│   └── wikipedia.ts          # Wikipedia summary tool
├── agents/
│   └── building-agent.ts     # ToolLoopAgent configuration
└── utils.ts                  # API URL generator
```

### 4.4 Streaming API Route (Expo)

```typescript
// app/api/chat+api.ts
import { streamText, convertToModelMessages } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-5-20250929'),
    messages: await convertToModelMessages(messages),
    tools: { /* building tools */ },
    stopWhen: stepCountIs(10),
  });

  return result.toUIMessageStreamResponse();
}
```

### 4.5 Frontend Hook (Expo)

```typescript
// app/(tabs)/index.tsx
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { fetch as expoFetch } from 'expo/fetch';

const { messages, sendMessage } = useChat({
  transport: new DefaultChatTransport({
    fetch: expoFetch,
    api: generateAPIUrl('/api/chat'),
  }),
});

// On GPS fix, send coordinates to agent
const handleLocation = (coords: { lat: number; lon: number }) => {
  sendMessage({
    content: `Identify the building at coordinates: ${coords.lat}, ${coords.lon}`,
  });
};
```

### 4.6 Key AI SDK v6 Features for This Project

| Feature | Usage |
|---------|-------|
| **ToolLoopAgent** | Orchestrate multi-step building identification pipeline |
| **Structured Output** | `Output.object()` with Zod schema for typed building results |
| **Multi-step loops** | `stopWhen: stepCountIs(N)` for iterative data gathering |
| **Tool approval** | `needsApproval: true` for paid API calls (Google Places) |
| **MCP support** | Connect to external data servers via Model Context Protocol |
| **DevTools** | `npx @ai-sdk/devtools` for debugging tool calls at localhost:4983 |
| **Expo streaming** | `expo/fetch` + `toUIMessageStreamResponse()` for mobile streaming |
| **Call options** | `callOptionsSchema` for passing user preferences (detail level, etc.) |

### 4.7 Agent Workflow Patterns

**Recommended Pattern: Sequential Chain with Parallel Fallback**

```
1. GPS Coordinates received
   │
2. [PARALLEL] Query OSM Overpass + Google Reverse Geocode
   │          (identify building name, address, type)
   │
3. [CONDITIONAL] If OSM returns wikidata=* tag:
   │    → Query Wikidata SPARQL for rich architectural data
   │    → Query Wikipedia for narrative description
   │
4. [CONDITIONAL] If in United States:
   │    → Query NPS ArcGIS for historic register status
   │
5. [AGGREGATE] LLM synthesizes all gathered data
   │            into structured BuildingInfo response
   │
6. Return structured result + natural language summary
```

This maps naturally to AI SDK v6's ToolLoopAgent — the LLM decides which tools to call at each step based on what data it has gathered so far.

---

## 5. Recommended Architecture

### Data Source Priority (in order of query):

1. **OpenStreetMap Overpass** (always, free) — Building identification, basic metadata, wikidata/wikipedia links
2. **Google Places API** (always, paid fallback) — Name verification, address, editorial summary
3. **Wikidata SPARQL** (when wikidata ID available) — Rich structured architectural data
4. **Wikipedia REST** (when article link available) — Narrative description and history
5. **NPS ArcGIS** (US locations only) — Historic register status and designation details
6. **Mapbox** (optional) — Precise building entrance coordinates for AR overlay

### Cost Optimization Strategy:

- Start with FREE sources (OSM + Wikidata + Wikipedia + NPS) — covers 80% of use cases
- Fall back to Google Places only when OSM returns no building name
- Cache results aggressively (buildings don't change often)
- Use `needsApproval` on paid API tools during development

### Technology Stack:

| Layer | Technology |
|-------|-----------|
| **Mobile App** | Expo 52+ / React Native with TypeScript |
| **AI Orchestration** | Vercel AI SDK v6 (`ToolLoopAgent`) |
| **LLM** | Claude Sonnet 4.5 via `@ai-sdk/anthropic` |
| **Streaming** | `expo/fetch` + `toUIMessageStreamResponse()` |
| **GPS** | `expo-location` |
| **State** | `useChat` hook from `@ai-sdk/react` |
| **Schema Validation** | Zod |
| **Free Data** | OSM Overpass, Wikidata SPARQL, Wikipedia REST, NPS ArcGIS |
| **Paid Data** | Google Places API (v1) with $200/mo free tier |
