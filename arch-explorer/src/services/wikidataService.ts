const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";

export async function getWikidataImages(
  wikidataIds: string[]
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
        headers: { Accept: "application/sparql-results+json" },
      }
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

      // Extract Q-id from entity URI like http://www.wikidata.org/entity/Q12345
      const qidMatch = entityUri.match(/Q\d+$/);
      if (!qidMatch || !imageUri) continue;

      const qid = qidMatch[0];
      // Extract filename from commons URI
      const filename = decodeURIComponent(
        imageUri.split("/").pop() ?? ""
      );
      if (!filename) continue;

      result[qid] =
        `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=800`;
    }

    return result;
  } catch (error) {
    console.warn("Wikidata image fetch failed:", error);
    return {};
  }
}
