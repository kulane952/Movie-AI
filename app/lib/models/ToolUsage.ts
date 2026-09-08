import mongoose from "mongoose";

const toolUsageSchema = new mongoose.Schema(
  {
    tool: {
      type: String,
      required: true,
    },

    success: {
      type: Boolean,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ToolUsage =
  mongoose.models.ToolUsage ||
  mongoose.model("ToolUsage", toolUsageSchema);