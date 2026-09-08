import mongoose from "mongoose";

const userSettingsSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    favorite_genre: {
      type: String,
    },

    preferred_category: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const UserSettings =
  mongoose.models.UserSettings ||
  mongoose.model(
    "UserSettings",
    userSettingsSchema
  );