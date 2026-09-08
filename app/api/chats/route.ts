
import { NextResponse } from "next/server";

import { connectDB } from "../../lib/mongodb";
import Chat from "../../lib/models/Chat";

export async function GET() {
  try {
    await connectDB();

    const chats = await Chat.find()
      .sort({ updatedAt: -1 })
      .select("_id title createdAt updatedAt")
      .lean();

    return NextResponse.json({
      success: true,
      data: chats,
    });
  } catch (error) {
    console.error(
      "GET /api/chats error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load chats.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    console.log(
      "POST /api/chats BODY:",
      body
    );

    const title =
      typeof body?.title === "string" &&
      body.title.trim()
        ? body.title.trim()
        : "New Chat";

    const chat = await Chat.create({
      title,
      messages: [],
    });

    const chatData = {
      _id: chat._id.toString(),
      title: chat.title,
      messages: chat.messages,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };

    console.log(
      "NEW CHAT CREATED:",
      chatData._id
    );

    return NextResponse.json(
      {
        success: true,
        data: chatData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/chats error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create chat.",
      },
      { status: 500 }
    );
  }
}