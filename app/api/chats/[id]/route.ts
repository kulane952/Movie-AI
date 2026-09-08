import { NextResponse } from "next/server";

import { connectDB } from "../../../lib/mongodb";
import Chat from "../../../lib/models/Chat";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: Request,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    console.log("GET CHAT ID:", id);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Chat ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const chat = await Chat.findById(id).lean();

    if (!chat) {
      return NextResponse.json(
        {
          success: false,
          error: "Chat not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    console.error("GET /api/chats/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load chat.",
      },
      {
        status: 500,
      }
    );
  }
}