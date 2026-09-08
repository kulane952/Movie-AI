const OMDB_URL = "https://www.omdbapi.com/";

// ==========================================
// API KEY
// ==========================================

function getApiKey(): string {
  const apiKey = process.env.OMDB_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("OMDB_API_KEY is not defined.");
  }

  return apiKey;
}

// ==========================================
// SEARCH MOVIES
// ==========================================

export async function searchMoviesByTitle(
  title: string,
  year?: number
) {
  const apiKey = getApiKey();

  const params = new URLSearchParams();

  params.set("s", title.trim());
  params.set("type", "movie");
  params.set("apikey", apiKey);

  if (year) {
    params.set("y", year.toString());
  }

  const response = await fetch(
    `${OMDB_URL}?${params.toString()}`,
    {
      cache: "no-store",
    }
  );

  const data = await response.json();

  console.log("OMDb Search:", data);

  if (!response.ok) {
    throw new Error(
      `OMDb API request failed: ${response.status}`
    );
  }

  if (data.Response === "False") {
    return {
      success: false as const,
      error: data.Error || "Movie not found.",
    };
  }

  return {
    success: true as const,
    data: data.Search || [],
    totalResults: Number(data.totalResults || 0),
  };
}

// ==========================================
// MOVIE DETAILS
// ==========================================

export async function getMovieDetails(
  imdbId: string
) {
  const apiKey = getApiKey();

  if (!imdbId?.trim()) {
    throw new Error("IMDb ID is required.");
  }

  const params = new URLSearchParams();

  params.set("i", imdbId.trim());
  params.set("plot", "full");
  params.set("apikey", apiKey);

  const response = await fetch(
    `${OMDB_URL}?${params.toString()}`,
    {
      cache: "no-store",
    }
  );

  const data = await response.json();

  console.log("OMDb Details:", data);

  if (!response.ok) {
    throw new Error(
      `OMDb API request failed: ${response.status}`
    );
  }

  if (data.Response === "False") {
    return {
      success: false as const,
      error: data.Error || "Movie not found.",
    };
  }

  return {
    success: true as const,
    data: {
      imdbId: data.imdbID,
      title: data.Title,
      year: data.Year,
      rated: data.Rated,
      released: data.Released,
      runtime: data.Runtime,
      genre: data.Genre,
      director: data.Director,
      writer: data.Writer,
      cast: data.Actors,
      plot: data.Plot,
      language: data.Language,
      country: data.Country,
      awards: data.Awards,
      poster: data.Poster,
      ratings: data.Ratings || [],
      imdbRating: data.imdbRating,
      imdbVotes: data.imdbVotes,
      type: data.Type,
      boxOffice: data.BoxOffice,
    },
  };
}

// ==========================================
// DETAILS BY TITLE
// ==========================================

export async function getMovieDetailsByTitle(
  title: string,
  year?: number
) {
  const search = await searchMoviesByTitle(
    title,
    year
  );

  if (!search.success) {
    return search;
  }

  if (!search.data.length) {
    return {
      success: false as const,
      error: "Movie not found.",
    };
  }

  const exactMatch =
    search.data.find(
      (movie: any) =>
        movie.Title?.toLowerCase() ===
        title.trim().toLowerCase()
    ) || search.data[0];

  if (!exactMatch.imdbID) {
    return {
      success: false as const,
      error: "IMDb ID was not found.",
    };
  }

  return getMovieDetails(exactMatch.imdbID);
}

// ==========================================
// SMART RECOMMENDATIONS
// ==========================================

export async function getSmartMovieRecommendations(
  title: string
) {
  const apiKey = getApiKey();

  // ----------------------------------------
  // 1. Get original movie
  // ----------------------------------------

  const movieResult =
    await getMovieDetailsByTitle(title);

  if (!movieResult.success) {
    return movieResult;
  }

  const movie = movieResult.data;

  // ----------------------------------------
  // 2. Extract useful information
  // ----------------------------------------

  const genres =
    movie.genre
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) || [];

  const actors =
    movie.cast
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) || [];

  const director =
    movie.director
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) || [];

  // ----------------------------------------
  // 3. Build search terms
  // ----------------------------------------

  const searchTerms = [
    ...genres.slice(0, 2),
    ...actors.slice(0, 1),
    ...director.slice(0, 1),
  ];

  const uniqueTerms = [
    ...new Set(searchTerms),
  ];

  // ----------------------------------------
  // 4. Search candidate movies
  // ----------------------------------------

  const candidates: any[] = [];

  for (const term of uniqueTerms.slice(0, 4)) {
    try {
      const params = new URLSearchParams();

      params.set("s", term);
      params.set("type", "movie");
      params.set("apikey", apiKey);

      const response = await fetch(
        `${OMDB_URL}?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (
        response.ok &&
        data.Response === "True" &&
        Array.isArray(data.Search)
      ) {
        candidates.push(...data.Search);
      }
    } catch (error) {
      console.error(
        `Recommendation search failed for ${term}:`,
        error
      );
    }
  }

  // ----------------------------------------
  // 5. Remove duplicates
  // ----------------------------------------

  const uniqueCandidates = Array.from(
    new Map(
      candidates.map((movie) => [
        movie.imdbID,
        movie,
      ])
    ).values()
  );

  // Don't recommend the same movie
  const filteredCandidates =
    uniqueCandidates.filter(
      (candidate) =>
        candidate.imdbID !== movie.imdbId
    );

  // ----------------------------------------
  // 6. Get details for top candidates
  // ----------------------------------------

  const detailedMovies: any[] = [];

  for (const candidate of filteredCandidates.slice(
    0,
    10
  )) {
    try {
      const details = await getMovieDetails(
        candidate.imdbID
      );

      if (details.success) {
        detailedMovies.push(details.data);
      }
    } catch (error) {
      console.error(
        "Recommendation details error:",
        error
      );
    }
  }

  // ----------------------------------------
  // 7. Score movies
  // ----------------------------------------

  const scoredMovies = detailedMovies.map(
    (candidate) => {
      let score = 0;

      const candidateGenres =
        candidate.genre
          ?.split(",")
          .map((g: string) =>
            g.trim().toLowerCase()
          ) || [];

      const originalGenres =
        genres.map((g) =>
          g.toLowerCase()
        );

      // Genre match
      for (const genre of originalGenres) {
        if (
          candidateGenres.includes(genre)
        ) {
          score += 5;
        }
      }

      // Same director
      if (
        candidate.director &&
        movie.director &&
        candidate.director
          .toLowerCase()
          .includes(
            movie.director.toLowerCase()
          )
      ) {
        score += 4;
      }

      // Shared actors
      const candidateActors =
        candidate.cast
          ?.split(",")
          .map((a: string) =>
            a.trim().toLowerCase()
          ) || [];

      for (const actor of actors) {
        if (
          candidateActors.includes(
            actor.toLowerCase()
          )
        ) {
          score += 3;
        }
      }

      // Rating bonus
      const rating = Number(
        candidate.imdbRating
      );

      if (!Number.isNaN(rating)) {
        score += rating;
      }

      return {
        ...candidate,
        recommendationScore: score,
      };
    }
  );

  // ----------------------------------------
  // 8. Sort by score
  // ----------------------------------------

  scoredMovies.sort(
    (a, b) =>
      b.recommendationScore -
      a.recommendationScore
  );

  // ----------------------------------------
  // 9. Return top 6
  // ----------------------------------------

  return {
    success: true as const,

    type: "movie_recommendations",

    basedOn: {
      imdbId: movie.imdbId,
      title: movie.title,
      genres: genres,
      director: movie.director,
      cast: movie.cast,
    },

    data: scoredMovies.slice(0, 6),

    count: Math.min(
      scoredMovies.length,
      6
    ),
  };
}

// ==========================================
// OLD RECOMMENDATION FUNCTION
// ==========================================

export async function getMovieRecommendations(
  input: string,
  year?: number
) {
  const apiKey = getApiKey();

  if (!input?.trim()) {
    return {
      success: false as const,
      error:
        "Movie title or genre is required.",
    };
  }

  const params = new URLSearchParams();

  params.set("s", input.trim());
  params.set("type", "movie");
  params.set("apikey", apiKey);

  if (year) {
    params.set("y", year.toString());
  }

  const response = await fetch(
    `${OMDB_URL}?${params.toString()}`,
    {
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `OMDb API request failed: ${response.status}`
    );
  }

  if (data.Response === "False") {
    return {
      success: false as const,
      error:
        data.Error ||
        "No movies found.",
    };
  }

  return {
    success: true as const,
    data: data.Search || [],
    totalResults: Number(
      data.totalResults || 0
    ),
  };
}