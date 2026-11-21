import { tool } from "ai";
import { z } from "zod";

import { connectDB } from "../mongodb";
import { Movie } from "../models/Movie";
import { User } from "../models/User";

// Tool-kan wuxuu AI-ga siinayaa awood uu
// MongoDB uga raadiyo movies iyo users.
export const databaseTool = tool({
  // Description-kan AI-ga ayuu u sheegayaa
  // waxa tool-kan loo isticmaalo.
  description:
    "Search movies and users in the database and count movies by genre.",

  // Zod schema-kan wuxuu qeexayaa
  // input-ka tool-ku aqbalayo.
  inputSchema: z.object({
    // Waxaan dooraneynaa waxa la raadinayo.
    entity: z.enum(["movies", "users"]),

    // Genre-ka movie-ga.
    genre: z.string().optional(),

    // Rating-ka ugu yar.
    minRating: z.number().optional(),

    // Da'da ugu yar.
    minAge: z.number().optional(),

    // Haddii count la rabo.
    countByGenre: z.boolean().optional(),
  }),

  // Function-kan ayaa shaqeynaya marka AI-gu isticmaalo tool-ka.
  execute: async ({
    entity,
    genre,
    minRating,
    minAge,
    countByGenre,
  }) => {
    console.log("DATABASE TOOL CALLED:", {
    entity,
    genre,
    minRating,
    minAge,
    countByGenre,
  });
    // Marka hore MongoDB ayaan ku xireynaa.
    await connectDB();

    // -----------------------------------------
    // COUNT MOVIES BY GENRE
    // -----------------------------------------

    // Haddii user-ku codsado:
    // "Count total movies by genre"
    if (countByGenre) {
      // MongoDB aggregation ayaa tirinaysa
      // movie kasta oo genre kasta ku jira.
      const result = await Movie.aggregate([
        {
          $group: {
            _id: "$genre",
            total: {
              $sum: 1,
            },
          },
        },

        // Natiijada waxaan u kala hormarineynaa
        // tirada ugu badan.
        {
          $sort: {
            total: -1,
          },
        },
      ]);

      // Waxaan AI-ga ugu celineynaa natiijada.
      return {
        success: true,
        type: "movie_genre_count",
        data: result,
      };
    }

    // -----------------------------------------
    // MOVIES
    // -----------------------------------------

    if (entity === "movies") {
      // Filter-ka MongoDB.
      const filter: Record<string, unknown> = {};

      // Haddii genre la bixiyay,
      // waxaan ku daraynaa filter-ka.
      if (genre) {
        filter.genre = {
          $regex: genre,
          $options: "i",
        };
      }

      // Haddii rating la bixiyay,
      // waxaan raadinaynaa rating ka weyn ama
      // la mid ah rating-kaas.
      if (minRating !== undefined) {
        filter.rating = {
          $gte: minRating,
        };
      }

      // MongoDB ayaan ka raadinaynaa movies.
      const movies = await Movie.find(filter).lean();

console.log("DATABASE RESULT:", movies);

      // Natiijada ayaan soo celineynaa.
      return {
        success: true,
        type: "movies",
        count: movies.length,
        // ObjectId/Date -> JSON caadi ah, si AI SDK-gu u aqbalo.
        data: JSON.parse(JSON.stringify(movies)),
      };
    }

    // -----------------------------------------
    // USERS
    // -----------------------------------------

    if (entity === "users") {
      // User filter.
      const filter: Record<string, unknown> = {};

      // Haddii age la bixiyay,
      // waxaan raadineynaa users da'doodu
      // ka weyn tahay ama la mid tahay.
      if (minAge !== undefined) {
        filter.age = {
          $gte: minAge,
        };
      }

      // MongoDB ayaan ka raadinaynaa users.
      const users = await User.find(filter).lean();

      // Natiijada ayaan soo celineynaa.
      return {
        success: true,
        type: "users",
        count: users.length,
        data: JSON.parse(JSON.stringify(users)),
      };
    }

    // Haddii request-ku uusan sax ahayn.
    return {
      success: false,
      error: "Invalid database request",
    };
  },
});