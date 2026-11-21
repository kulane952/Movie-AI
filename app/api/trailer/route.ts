import { NextResponse, type NextRequest } from "next/server";

// Trailer-ka filimka YouTube ayaan ka raadineynaa,
// si user-ku app-ka gudihiisa ugu daawado.
export async function GET(request: NextRequest) {
  const title =
    request.nextUrl.searchParams.get("title")?.trim();

  const year =
    request.nextUrl.searchParams.get("year")?.trim() || "";

  if (!title) {
    return NextResponse.json(
      {
        success: false,
        error: "Movie title is required.",
      },
      { status: 400 }
    );
  }

  try {
    const query = `${title} ${year} official trailer`.trim();

    const response = await fetch(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
        // Trailer-ka 1 maalin ayaan cache-gareyneynaa.
        next: { revalidate: 86400 },
      }
    );

    const html = await response.text();

    const match = html.match(
      /"videoId":"([A-Za-z0-9_-]{11})"/
    );

    if (!match) {
      return NextResponse.json(
        {
          success: false,
          error: "Trailer not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        videoId: match[1],
      },
    });
  } catch (error) {
    console.error("Trailer search error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to find a trailer right now.",
      },
      { status: 500 }
    );
  }
}
