import { tool } from "ai";
import { z } from "zod";

import {
  searchMoviesByTitle,
  getMovieDetails,
  getMovieDetailsByTitle,
  getMovieRecommendations,
  getSmartMovieRecommendations,
} from "../services/omdbService";

import { cacheMovie } from "../services/movieCache";

export const movieTool = tool({
  description: `
Search movies, get detailed movie information,
and provide smart movie recommendations.

ACTIONS:

1. search
Use when the user wants to:
- Search for movies
- Find a movie
- Look up movies

2. details
Use when the user asks:
- Tell me about a movie
- Movie details
- Who directed this movie?
- What is this movie about?
- Cast
- Rating
- Plot
- Year
- Director
- Awards

3. recommendations
Use when the user asks:
- Recommend movies
- Recommend movies like Interstellar
- Movies similar to Interstellar
- Similar movies
- Movies in the same style
- Movies in a genre

IMPORTANT:

- Always use conversation history.
- Understand references such as:
  "it", "this movie", "that movie",
  "the director", "the actor", "similar movies".

- For movie details, prefer IMDb ID when available.
- If IMDb ID is unavailable, use movie title.

- For "movies like [movie]",
  use the smart recommendation engine.

- Smart recommendations consider:
  genre,
  director,
  actors,
  and IMDb rating.

- Do not invent movie information.
- Use OMDb data whenever movie information is requested.
`,

  inputSchema: z.object({
    action: z.enum([
      "search",
      "details",
      "recommendations",
    ]),

    title: z.string().optional(),

    year: z.number().optional(),

    imdbId: z.string().optional(),

    genre: z.string().optional(),
  }),

  execute: async ({
    action,
    title,
    year,
    imdbId,
    genre,
  }) => {
    try {
      // ==========================================
      // SEARCH
      // ==========================================

      if (action === "search") {
        if (!title?.trim()) {
          return {
            success: false,
            error: "Movie title is required.",
          };
        }

        const result =
          await searchMoviesByTitle(
            title.trim(),
            year
          );

        if (!result.success) {
          return result;
        }

        return {
          success: true,
          type: "movie_search",
          count: result.data.length,
          totalResults:
            result.totalResults,
          data: result.data,
        };
      }

      // ==========================================
      // DETAILS
      // ==========================================

      if (action === "details") {
        let result;

        // Prefer IMDb ID
        if (imdbId?.trim()) {
          result = await getMovieDetails(
            imdbId.trim()
          );
        }

        // Otherwise use title
        else if (title?.trim()) {
          result =
            await getMovieDetailsByTitle(
              title.trim(),
              year
            );
        }

        else {
          return {
            success: false,
            error:
              "Movie title or IMDb ID is required.",
          };
        }

        if (!result.success) {
          return result;
        }

        const movie = result.data;

        // ========================================
        // CACHE MOVIE
        // ========================================

        try {
          await cacheMovie({
            imdbId: movie.imdbId,
            title: movie.title,
            year: movie.year,
            genre: movie.genre,
            imdbRating:
              movie.imdbRating,
            director: movie.director,
            plot: movie.plot,
            cast: movie.cast,
            poster: movie.poster,
            runtime: movie.runtime,
            ratings: movie.ratings,
          });
        } catch (cacheError) {
          console.error(
            "Movie cache error:",
            cacheError
          );
        }

        return {
          success: true,
          type: "movie_details",
          data: movie,
          cached: true,
        };
      }

      // ==========================================
      // SMART RECOMMENDATIONS
      // ==========================================

      if (action === "recommendations") {
        const recommendationInput =
          title?.trim() || genre?.trim();

        if (!recommendationInput) {
          return {
            success: false,
            error:
              "Movie title or genre is required.",
          };
        }

        // ----------------------------------------
        // MOVIE-BASED RECOMMENDATIONS
        // ----------------------------------------

        if (title?.trim()) {
          const result =
            await getSmartMovieRecommendations(
              title.trim()
            );

          if (!result.success) {
            return result;
          }

          return {
            success: true,
            type: "movie_recommendations",

            count: result.count,

            data: result.data,

            basedOn: result.basedOn,
          };
        }

        // ----------------------------------------
        // GENRE-BASED RECOMMENDATIONS
        // ----------------------------------------

        if (genre?.trim()) {
          const result =
            await getMovieRecommendations(
              genre.trim(),
              year
            );

          if (!result.success) {
            return result;
          }

          return {
            success: true,
            type: "movie_recommendations",

            count: result.data.length,

            totalResults:
              result.totalResults,

            data: result.data,

            basedOn: genre.trim(),
          };
        }

        return {
          success: false,
          error:
            "Unable to create recommendations.",
        };
      }

      // ==========================================
      // INVALID ACTION
      // ==========================================

      return {
        success: false,
        error: "Invalid movie action.",
      };
    } catch (error) {
      console.error(
        "Movie tool error:",
        error
      );

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to fetch movie information.",
      };
    }
  },
});