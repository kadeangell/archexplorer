export interface OverpassBuilding {
  osmId: string;
  name: string;
  lat: number;
  lon: number;
  wikidataId?: string;
  tags: Record<string, string>;
}

const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";
const MIN_REQUEST_INTERVAL_MS = 10_000;

let lastQueryTime = 0;

async function throttle(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastQueryTime;
  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - elapsed)
    );
  }
}

export async function queryNearbyBuildings(
  lat: number,
  lon: number,
  radius: number = 300
): Promise<OverpassBuilding[]> {
  await throttle();

  const query = `[out:json][timeout:10];way["building"]["name"](around:${radius},${lat},${lon});out tags center;`;

  let retries = 0;
  const maxRetries = 2;

  while (true) {
    lastQueryTime = Date.now();

    const response = await fetch(OVERPASS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (response.status === 429) {
      if (retries >= maxRetries) {
        console.warn("Overpass API rate limited after retries, returning empty");
        return [];
      }
      const retryAfter = response.headers.get("retry-after");
      const waitMs = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : MIN_REQUEST_INTERVAL_MS * (retries + 1);
      retries++;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      continue;
    }

    if (!response.ok) {
      console.warn(`Overpass API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const elements: any[] = data.elements ?? [];

    return elements
      .filter((el: any) => el.tags?.name && el.center)
      .map((el: any) => ({
        osmId: String(el.id),
        name: el.tags.name,
        lat: el.center.lat,
        lon: el.center.lon,
        wikidataId: el.tags.wikidata || undefined,
        tags: el.tags ?? {},
      }));
  }
}
