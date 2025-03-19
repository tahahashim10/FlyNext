// similar to afs api utils/query.js
import { NextRequest } from "next/server";

export function getSearchParams(request: NextRequest): Record<string, string> {
    return Object.fromEntries(request.nextUrl.searchParams.entries());
}
  