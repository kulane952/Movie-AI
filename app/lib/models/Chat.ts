import mongoose, {
  Schema,
  Document,
  Model,
} from "mongoose";

export interface IChat extends Document {
  title: string;

  messages: {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: Date;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema =
  new Schema(
    {
      id: {
        type: String,
        required: true,
      },

      role: {
        type: String,
        enum: [
          "user",
          "assistant",
        ],
        required: true,
      },

      content: {
        type: String,
        required: true,
      },

      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      _id: false,
    }
  );

const ChatSchema =
  new Schema<IChat>(
    {
      title: {
        type: String,
        default: "New Chat",
        trim: true,
      },

      messages: {
        type: [MessageSchema],
        default: [],
      },
    },
    {
      timestamps: true,
    }
  );

const Chat: Model<IChat> =
  mongoose.models.Chat ||
  mongoose.model<IChat>(
    "Chat",
    ChatSchema
  );

export default Chat;