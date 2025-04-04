import { NextResponse, NextRequest } from "next/server";
import { getSearchParams } from "@/utils/query";
import { addLayoverInfo, minimalFlightInfo } from "@/utils/flightUtils";

// Use 'any' type for the context parameter to bypass TypeScript errors
export async function GET(request: NextRequest, context: any): Promise<NextResponse> {
  const id = context.params.id;
  if (!id || typeof id !== "string" || id.trim() === "") {
    return NextResponse.json({ error: "Valid Flight ID required" }, { status: 400 });
  }

  // Build URL for the dedicated AFS flight details endpoint.
  const baseUrl = process.env.AFS_BASE_URL as string;
  const apiKey = process.env.AFS_API_KEY as string;
  if (!apiKey) {
    return NextResponse.json({ error: "AFS API key is not configured" }, { status: 500 });
  }

  const url = new URL(`/api/flights/${id}`, baseUrl);

  try {
    const res = await fetch(url, {
      headers: { "x-api-key": apiKey },
    });
    
    if (!res.ok) {
      const errorText = await res.text(); // Get the response text for more details
      if (res.status === 404) {
        return NextResponse.json({ error: "Flight not found", details: errorText }, { status: 404 });
      }
      return NextResponse.json({ error: `AFS API error ${res.status}: ${errorText}` }, { status: res.status });
    }
    
    const flight = await res.json();
    return NextResponse.json(flight, { status: 200 });
  } catch (error: any) {
    console.error("Error retrieving flight details:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}