import { tool } from "ai";
import { z } from "zod";

import { getRandomJoke } from "../services/jokeService";
import { connectDB } from "../mongodb";
import { Joke } from "../models/Joke";

export const jokeTool = tool({
  description:
    "Get random dad jokes and save them in the database.",

  inputSchema: z.object({
    action: z.enum(["random"]),
  }),

  execute: async ({ action }) => {
    try {
      if (action !== "random") {
        return {
          success: false,
          error: "Invalid joke action",
        };
      }

      const result = await getRandomJoke();

      if (!result.success) {
        return result;
      }

      await connectDB();

      await Joke.create({
        joke: result.joke,
        category: "dad",
        externalId: result.id,
      });

      return {
        success: true,
        type: "joke",
        data: {
          joke: result.joke,
        },
      };
    } catch (error) {
      console.error("Joke tool error:", error);

      return {
        success: false,
        error: "Unable to get a joke right now.",
      };
    }
  },
});