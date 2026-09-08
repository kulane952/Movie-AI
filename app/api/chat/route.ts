import {
  streamText,
  convertToModelMessages,
} from "ai";

import { openrouter } from "../../lib/ai";

import { databaseTool } from "../../lib/tools/databaseTool";
import { movieTool } from "../../lib/tools/movieTool";
import { jokeTool } from "../../lib/tools/jokeTool";

import { connectDB } from "../../lib/mongodb";
import Chat from "../../lib/models/Chat"

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();

    console.log(
      "CHAT MESSAGES:",
      JSON.stringify(messages, null, 2)
    );

    // ==========================================
    // CHECK CHAT ID
    // ==========================================

    if (!chatId) {
      return Response.json(
        {
          error: "chatId is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // CONNECT DATABASE
    // ==========================================

    await connectDB();

    // ==========================================
    // FIND CHAT
    // ==========================================

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return Response.json(
        {
          error: "Chat not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================
    // CONVERT MESSAGES
    // ==========================================

    const modelMessages =
      await convertToModelMessages(messages);

    console.log(
      "MODEL MESSAGES:",
      JSON.stringify(
        modelMessages,
        null,
        2
      )
    );

    // ==========================================
    // SAVE USER MESSAGE
    // ==========================================

    const latestMessage =
      messages[messages.length - 1];

    if (
      latestMessage &&
      latestMessage.role === "user"
    ) {
      const textPart =
        latestMessage.parts?.find(
          (part: any) =>
            part.type === "text"
        );

      const content =
        textPart?.text ||
        latestMessage.content ||
        "";

      if (content.trim()) {
        chat.messages.push({
          id:
            latestMessage.id ||
            crypto.randomUUID(),

          role: "user",

          content: content.trim(),

          createdAt: new Date(),
        });
      }
    }

    // ==========================================
    // GENERATE AI RESPONSE
    // ==========================================

    const result = streamText({
      model: openrouter(
        "inclusionai/ling-3.0-flash-fin:free"
      ),

      system: `
You are a helpful AI assistant.

You have access to:
- databaseTool
- movieTool
- jokeTool

IMPORTANT CONVERSATION RULES:

1. ALWAYS read the complete conversation history before answering.

2. NEVER say that you have no previous context if previous messages
   are present in the conversation.

3. If the user previously mentioned a movie and then says:
   - "it"
   - "this movie"
   - "that movie"
   - "the movie"

   assume they are referring to the previously discussed movie.

4. If the user previously mentioned a person and then says:
   - "he"
   - "she"
   - "the director"
   - "the actor"

   use the previous conversation to identify that person.

5. Example:

User: Tell me about Interstellar.
Assistant: Interstellar is a 2014 movie directed by Christopher Nolan.

User: Who directed it?
Assistant: Christopher Nolan directed Interstellar.

6. If the movie was already identified in the conversation,
   DO NOT ask the user for the movie name again.

7. Use movieTool whenever movie information is needed.

8. If the previous movie has an IMDb ID, use that IMDb ID
   when possible.

9. For "movies like [movie]", use the recommendations action
   of movieTool.

10. Never invent movie information.

11. Keep answers natural and conversational.
`,

      messages: modelMessages,

      tools: {
        databaseTool,
        movieTool,
        jokeTool,
      },
    });

    // ==========================================
    // SAVE ASSISTANT RESPONSE
    // ==========================================

    // result.onFinish(async ({ text }) => {
    //   try {
    //     if (!text?.trim()) {
    //       return;
    //     }

    //     await connectDB();

    //     const currentChat =
    //       await Chat.findById(chatId);

    //     if (!currentChat) {
    //       return;
    //     }

    //     currentChat.messages.push({
    //       id: crypto.randomUUID(),

    //       role: "assistant",

    //       content: text.trim(),

    //       createdAt: new Date(),
    //     });

    //     // Create title from first user message
    //     if (
    //       currentChat.title === "New Chat"
    //     ) {
    //       const firstUserMessage =
    //         currentChat.messages.find(
    //           (message) =>
    //             message.role === "user"
    //         );

    //       if (firstUserMessage) {
    //         currentChat.title =
    //           firstUserMessage.content
    //             .slice(0, 50)
    //             .trim();
    //       }
    //     }

    //     await currentChat.save();

    //     console.log(
    //       "Chat saved successfully:",
    //       chatId
    //     );
    //   } catch (error) {
    //     console.error(
    //       "Failed to save assistant message:",
    //       error
    //     );
    //   }
    // });

    return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error(
      "Chat API error:",
      error
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}

