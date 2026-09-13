"use server";

import { globalSearch, type SearchResults } from "@/services/search.service";

export async function searchAction(query: string): Promise<SearchResults> {
  return globalSearch(query);
}
