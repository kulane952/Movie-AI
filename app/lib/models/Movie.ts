import mongoose from "mongoose";

// Schema-kan wuxuu qeexayaa xogta movie-ga.
const movieSchema = new mongoose.Schema({
  // ID-ga MongoDB ayaa si automatic ah u sameynaya.

  // Magaca movie-ga.
  title: {
    type: String,
    required: true,
  },

  // Sanadka movie-ga la sameeyay.
  year: {
    type: Number,
    required: true,
  },

  // Genre-ka movie-ga.
  genre: {
    type: String,
    required: true,
  },

  // Rating-ka movie-ga.
  rating: {
    type: Number,
    required: true,
  },

  // Director-ka movie-ga.
  director: {
    type: String,
    required: true,
  },

  // Description-ka movie-ga.
  description: {
    type: String,
    required: true,
  },
});

// Waxaan hubineynaa in model-ka aan laba jeer la sameyn.
export const Movie =
  mongoose.models.Movie || mongoose.model("Movie", movieSchema);