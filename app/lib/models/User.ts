import mongoose from "mongoose";

// Schema-kan wuxuu qeexayaa xogta user-ka.
const userSchema = new mongoose.Schema({
  // Magaca user-ka.
  name: {
    type: String,
    required: true,
  },

  // Email-ka user-ka.
  email: {
    type: String,
    required: true,
  },

  // Da'da user-ka.
  age: {
    type: Number,
    required: true,
  },

  // Genre-ka uu user-ku jecel yahay.
  favorite_genre: {
    type: String,
    required: true,
  },
});

// Waxaan sameyneynaa User model.
export const User =
  mongoose.models.User || mongoose.model("User", userSchema);