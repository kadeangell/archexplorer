const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";

export interface WikidataBuilding {
  wikidataId: string;
  name: string;
  lat: number;
  lon: number;
  style?: string;
  architect?: string;
  yearBuilt?: string;
  imageUrl?: string;
  floors?: number;
  height?: string;
  heritageStatus?: string;
}

/**
 * Query Wikidata for buildings near a coordinate using the
 * wikibase:around spatial service.  Returns structured architectural
 * data, images, and metadata in a single SPARQL call.
 */
export async function queryNearbyBuildingsWikidata(
  lat: number,
  lon: number,
  radiusKm: number = 0.5,
): Promise<WikidataBuilding[]> {
  const sparql = `
SELECT DISTINCT
  ?building ?buildingLabel ?coord
  ?styleLabel ?architectLabel ?inception
  ?image ?floors ?height ?heritageLabel
WHERE {
  SERVICE wikibase:around {
    ?building wdt:P625 ?coord .
    bd:serviceParam wikibase:center "Point(${lon} ${lat})"^^geo:wktLiteral .
    bd:serviceParam wikibase:radius "${radiusKm}" .
  }
  ?building wdt:P31/wdt:P279* wd:Q41176 .
  OPTIONAL { ?building wdt:P149 ?style . }
  OPTIONAL { ?building wdt:P84 ?architect . }
  OPTIONAL { ?building wdt:P571 ?inception . }
  OPTIONAL { ?building wdt:P18 ?image . }
  OPTIONAL { ?building wdt:P1101 ?floors . }
  OPTIONAL { ?building wdt:P2048 ?height . }
  OPTIONAL { ?building wdt:P1435 ?heritage . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
LIMIT 20`;

  try {
    const response = await fetch(
      `${SPARQL_ENDPOINT}?query=${encodeURIComponent(sparql)}`,
      {
        headers: {
          Accept: "application/sparql-results+json",
          "User-Agent": "ArchExplorer/1.0 (mobile app; architecture discovery)",
        },
      },
    );

    if (!response.ok) {
      console.warn(`Wikidata SPARQL error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const bindings: any[] = data.results?.bindings ?? [];

    const seen = new Set<string>();
    const results: WikidataBuilding[] = [];

    for (const b of bindings) {
      const entityUri: string = b.building?.value ?? "";
      const qidMatch = entityUri.match(/Q\d+$/);
      if (!qidMatch) continue;

      const qid = qidMatch[0];
      if (seen.has(qid)) continue;
      seen.add(qid);

      const label: string = b.buildingLabel?.value ?? "";
      // Skip items that are just the Q-id (no English label)
      if (!label || label === qid) continue;

      const coordStr: string = b.coord?.value ?? "";
      const coordMatch = coordStr.match(/Point\(([-\d.]+)\s+([-\d.]+)\)/);
      const bLon = coordMatch ? parseFloat(coordMatch[1]) : lon;
      const bLat = coordMatch ? parseFloat(coordMatch[2]) : lat;

      let imageUrl: string | undefined;
      const imageUri: string = b.image?.value ?? "";
      if (imageUri) {
        const filename = decodeURIComponent(imageUri.split("/").pop() ?? "");
        if (filename) {
          imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=800`;
        }
      }

      let yearBuilt: string | undefined;
      const inception: string = b.inception?.value ?? "";
      if (inception) {
        const yearMatch = inception.match(/^\d{4}/);
        if (yearMatch) yearBuilt = yearMatch[0];
      }

      results.push({
        wikidataId: qid,
        name: label,
        lat: bLat,
        lon: bLon,
        style: b.styleLabel?.value || undefined,
        architect: b.architectLabel?.value || undefined,
        yearBuilt,
        imageUrl,
        floors: b.floors?.value ? parseInt(b.floors.value, 10) : undefined,
        height: b.height?.value || undefined,
        heritageStatus: b.heritageLabel?.value || undefined,
      });
    }

    return results;
  } catch (error) {
    console.warn("Wikidata spatial query failed:", error);
    return [];
  }
}

/**
 * Look up images for specific Wikidata entity IDs.
 * Kept for backward compatibility but the spatial query above
 * already returns images.
 */
export async function getWikidataImages(
  wikidataIds: string[],
): Promise<Record<string, string>> {
  if (wikidataIds.length === 0) return {};

  const valuesClause = wikidataIds.map((id) => `wd:${id}`).join(" ");

  const sparql = `
SELECT ?building ?image WHERE {
  VALUES ?building { ${valuesClause} }
  ?building wdt:P18 ?image .
}`;

  try {
    const response = await fetch(
      `${SPARQL_ENDPOINT}?query=${encodeURIComponent(sparql)}`,
      {
        headers: {
          Accept: "application/sparql-results+json",
          "User-Agent": "ArchExplorer/1.0 (mobile app; architecture discovery)",
        },
      },
    );

    if (!response.ok) {
      console.warn(`Wikidata SPARQL error: ${response.status}`);
      return {};
    }

    const data = await response.json();
    const bindings: any[] = data.results?.bindings ?? [];

    const result: Record<string, string> = {};

    for (const binding of bindings) {
      const entityUri: string = binding.building?.value ?? "";
      const imageUri: string = binding.image?.value ?? "";

      const qidMatch = entityUri.match(/Q\d+$/);
      if (!qidMatch || !imageUri) continue;

      const qid = qidMatch[0];
      const filename = decodeURIComponent(imageUri.split("/").pop() ?? "");
      if (!filename) continue;

      result[qid] = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=800`;
    }

    return result;
  } catch (error) {
    console.warn("Wikidata image fetch failed:", error);
    return {};
  }
}
