import mongoose from "mongoose";

const jokeSchema = new mongoose.Schema(
  {
    joke: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    externalId: {
      type: String,
    },

    rating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Joke =
  mongoose.models.Joke ||
  mongoose.model("Joke", jokeSchema);