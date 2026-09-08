import mongoose from "mongoose";

// Schema-kan wuxuu qeexayaa review-ga movie.
const reviewSchema = new mongoose.Schema({
  // ID-ga movie-ga review-ga loo qoray.
  movie_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true,
  },

  // ID-ga user-ka review-ga qoray.
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Rating-ka user-ku siiyay movie-ga.
  rating: {
    type: Number,
    required: true,
  },

  // Comment-ka review-ga.
  comment: {
    type: String,
    required: true,
  },

  // Taariikhda review-ga.
  date: {
    type: Date,
    required: true,
  },
});

// Waxaan sameyneynaa Review model.
export const Review =
  mongoose.models.Review || mongoose.model("Review", reviewSchema);