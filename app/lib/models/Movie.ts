import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    genre: {
      type: String,
      required: true,
    },

    rating: {
      type: Number,
      required: true,
    },

    director: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    cast: {
      type: [String],
      default: [],
    },

    poster: {
      type: String,
      default: "",
    },

    runtime: {
      type: String,
      default: "",
    },

    externalRatings: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Movie =
  mongoose.models.Movie ||
  mongoose.model("Movie", movieSchema);