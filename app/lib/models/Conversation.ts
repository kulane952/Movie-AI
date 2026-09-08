import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    messages: {
      type: Array,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model(
    "Conversation",
    conversationSchema
  );