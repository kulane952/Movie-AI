"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import MovieCard from "./components/MovieCard";
import Markdown from "./components/Markdown";

type Movie = {
  imdbId?: string;
  imdbID?: string;
  title?: string;
  Title?: string;
  year?: string;
  Year?: string;
  rated?: string;
  Rated?: string;
  released?: string;
  Released?: string;
  runtime?: string;
  Runtime?: string;
  genre?: string;
  Genre?: string;
  director?: string;
  Director?: string;
  writer?: string;
  Writer?: string;
  cast?: string;
  Actors?: string;
  plot?: string;
  Plot?: string;
  language?: string;
  Language?: string;
  country?: string;
  Country?: string;
  awards?: string;
  Awards?: string;
  poster?: string;
  Poster?: string;
  imdbRating?: string;
  imdbVotes?: string;
  boxOffice?: string;
};

type ChatHistory = {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export default function Home() {
  const [input, setInput] = useState("");

  const [selectedMovie, setSelectedMovie] =
    useState<Movie | null>(null);

  const [chatId, setChatId] =
    useState<string | null>(null);

  const [chats, setChats] =
    useState<ChatHistory[]>([]);

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [loadingHistory, setLoadingHistory] =
    useState(true);

  const [creatingChat, setCreatingChat] =
    useState(false);

  const submittingRef =
    useRef(false);

  // Trailer-ka wuxuu ku xiran yahay movie-ga la furay,
  // si movie kale marka la furo trailer-kii hore uusan u soo bixin.
  const [trailer, setTrailer] =
    useState<{
      movieKey: string;
      status: "loading" | "ready" | "error";
      videoId?: string;
    } | null>(null);

  const selectedMovieKey =
    selectedMovie?.imdbID ||
    selectedMovie?.imdbId ||
    selectedMovie?.title ||
    selectedMovie?.Title ||
    "";

  const activeTrailer =
    trailer?.movieKey === selectedMovieKey
      ? trailer
      : null;

  const trailerId =
    activeTrailer?.status === "ready"
      ? activeTrailer.videoId
      : undefined;

  const trailerStatus =
    activeTrailer?.status || "idle";

  // ==========================================
  // WATCH TRAILER (app-ka gudihiisa)
  // ==========================================

  async function watchTrailer() {
    if (!selectedMovie) {
      return;
    }

    const movieKey = selectedMovieKey;

    const title =
      selectedMovie.title ||
      selectedMovie.Title ||
      "";

    const year =
      selectedMovie.year ||
      selectedMovie.Year ||
      "";

    setTrailer({
      movieKey,
      status: "loading",
    });

    try {
      const response = await fetch(
        `/api/trailer?title=${encodeURIComponent(title)}&year=${encodeURIComponent(year)}`
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.error ||
            "Trailer not found."
        );
      }

      setTrailer({
        movieKey,
        status: "ready",
        videoId: data.data.videoId,
      });
    } catch (error) {
      console.error(
        "Trailer error:",
        error
      );

      setTrailer({
        movieKey,
        status: "error",
      });
    }
  }

  const {
    messages,
    sendMessage,
    status,
    setMessages,
    error,
  } = useChat();

  // ==========================================
  // LOAD CHAT HISTORY
  // ==========================================

  useEffect(() => {
    loadChats();
  }, []);

  async function loadChats() {
    try {
      setLoadingHistory(true);

      const response = await fetch(
        "/api/chats",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      const text =
        await response.text();

      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        console.error(
          "Non-JSON response from /api/chats:",
          {
            status: response.status,
            body: text.slice(0, 500),
          }
        );

        throw new Error(
          `API returned non-JSON response (${response.status}).`
        );
      }

      const data = JSON.parse(text);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to load chats."
        );
      }

      if (data?.success) {
        setChats(data.data || []);
      }
    } catch (error) {
      console.error(
        "Failed to load chats:",
        error
      );
    } finally {
      setLoadingHistory(false);
    }
  }

  // ==========================================
  // CREATE NEW CHAT
  // ==========================================

  async function createNewChat() {
    if (creatingChat) {
      return;
    }

    try {
      setCreatingChat(true);

      const response = await fetch(
        "/api/chats",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title: "New Chat",
          }),
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      const text =
        await response.text();

      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        console.error(
          "Non-JSON response from create chat:",
          {
            status: response.status,
            body: text.slice(0, 500),
          }
        );

        throw new Error(
          `API returned non-JSON response (${response.status}).`
        );
      }

      const data = JSON.parse(text);

      console.log(
        "CREATE NEW CHAT RESPONSE:",
        data
      );

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.error ||
            "Failed to create chat."
        );
      }

      const newChatId =
        data?.data?._id;

      if (!newChatId) {
        throw new Error(
          "Chat created but no chat ID was returned."
        );
      }

      setChatId(newChatId);

      setMessages([]);

      setSelectedMovie(null);

      await loadChats();
    } catch (error) {
      console.error(
        "Create chat error:",
        error
      );
    } finally {
      setCreatingChat(false);
    }
  }

  // ==========================================
  // OPEN EXISTING CHAT
  // ==========================================

  async function openChat(id: string) {
    if (!id) {
      return;
    }

    try {
      const response = await fetch(
        `/api/chats/${id}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      const text =
        await response.text();

      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        console.error(
          "Non-JSON response from /api/chats/[id]:",
          {
            status: response.status,
            url: response.url,
            body: text.slice(0, 500),
          }
        );

        throw new Error(
          `API returned non-JSON response (${response.status}).`
        );
      }

      const data = JSON.parse(text);

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.error ||
            "Failed to load chat."
        );
      }

      const loadedChatId =
        data?.data?._id || id;

      setChatId(loadedChatId);

      setSelectedMovie(null);

      const storedUiMessages =
        data?.data?.uiMessages || [];

      const storedMessages =
        data?.data?.messages || [];

      // UI messages (movie cards ku jiraan) haddii la hayo,
      // haddii kale text-ka kaliya.
      const restoredMessages =
        storedUiMessages.length > 0
          ? storedUiMessages
          : storedMessages.map(
          (message: {
            id: string;
            role: "user" | "assistant";
            content: string;
          }) => ({
            id: message.id,
            role: message.role,
            parts: [
              {
                type: "text",
                text: message.content,
              },
            ],
          })
        );

      setMessages(restoredMessages);

      // Mobile-ka marka chat la furo sidebar-ka xir
      if (
        window.innerWidth < 768
      ) {
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error(
        "Open chat error:",
        error
      );
    }
  }

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    // Ka hortag double submit
    if (submittingRef.current) {
      return;
    }

    if (!input.trim()) {
      return;
    }

    if (
      status === "streaming" ||
      status === "submitted"
    ) {
      return;
    }

    submittingRef.current = true;

    const text = input.trim();

    try {
      let currentChatId =
        chatId;

      // ======================================
      // CREATE CHAT AUTOMATICALLY
      // ======================================

      if (!currentChatId) {
        console.log(
          "No active chat. Creating chat..."
        );

        const response = await fetch(
          "/api/chats",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              title:
                text
                  .slice(0, 50)
                  .trim() ||
                "New Chat",
            }),
          }
        );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        const responseText =
          await response.text();

        if (
          !contentType.includes(
            "application/json"
          )
        ) {
          console.error(
            "Non-JSON auto-create response:",
            {
              status: response.status,
              body: responseText.slice(
                0,
                500
              ),
            }
          );

          throw new Error(
            `API returned non-JSON response (${response.status}).`
          );
        }

        const data =
          JSON.parse(
            responseText
          );

        console.log(
          "AUTO CREATE CHAT RESPONSE:",
          data
        );

        if (
          !response.ok ||
          !data?.success
        ) {
          throw new Error(
            data?.error ||
              "Failed to create chat."
          );
        }

        currentChatId =
          data?.data?._id;

        if (!currentChatId) {
          throw new Error(
            "Chat was created but no chat ID was returned."
          );
        }

        setChatId(
          currentChatId
        );

        console.log(
          "New chat created:",
          currentChatId
        );

        await loadChats();
      }

      // ======================================
      // FINAL CHAT ID CHECK
      // ======================================

      if (!currentChatId) {
        throw new Error(
          "chatId is missing."
        );
      }

      console.log(
        "Sending message with chatId:",
        currentChatId
      );

      // Clear input before sending
      setInput("");

      // ======================================
      // SEND TO AI
      // ======================================

      await sendMessage(
        {
          text,
        },
        {
          body: {
            chatId:
              currentChatId,
          },
        }
      );

      // Refresh sidebar after AI response
      setTimeout(() => {
        loadChats();
      }, 1000);
    } catch (error) {
      console.error(
        "handleSubmit error:",
        error
      );

      // Restore input if request failed
      setInput(text);
    } finally {
      submittingRef.current =
        false;
    }
  }

  // ==========================================
  // MOVIE CLICK
  // ==========================================

  async function handleMovieClick(
    movie: Movie
  ) {
    const movieId =
      movie.imdbID ||
      movie.imdbId;

    const movieTitle =
      movie.Title ||
      movie.title ||
      "this movie";

    setSelectedMovie(movie);

    if (!movieId) {
      return;
    }

    if (!chatId) {
      return;
    }

    if (
      status === "streaming" ||
      status === "submitted"
    ) {
      return;
    }

    try {
      await sendMessage(
        {
          text: `Tell me more about ${movieTitle}. IMDb ID: ${movieId}`,
        },
        {
          body: {
            chatId,
          },
        }
      );

      setTimeout(() => {
        loadChats();
      }, 1000);
    } catch (error) {
      console.error(
        "Movie message error:",
        error
      );
    }
  }

  // ==========================================
  // EMPTY STATE
  // ==========================================

  const isEmpty =
    messages.length === 0;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="flex min-h-screen">

        {/* ================================= */}
        {/* SIDEBAR */}
        {/* ================================= */}

        {sidebarOpen && (
          <>
            {/* Desktop Sidebar */}

            <aside className="hidden w-72 shrink-0 border-r border-gray-100 bg-gray-50/70 md:flex md:flex-col">

              {/* Sidebar Header */}

              <div className="border-b border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-lg font-bold text-gray-950">
                    Movie AI
                  </h1>

                  {/* Close Sidebar */}

                  <button
                    type="button"
                    onClick={() =>
                      setSidebarOpen(
                        false
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-gray-400 transition hover:bg-gray-200 hover:text-gray-900"
                    aria-label="Close sidebar"
                  >
                    ←
                  </button>
                </div>

                {/* New Chat */}

                <button
                  type="button"
                  onClick={
                    createNewChat
                  }
                  disabled={
                    creatingChat
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="text-lg">
                    {creatingChat
                      ? "..."
                      : "+"}
                  </span>

                  {creatingChat
                    ? "Creating..."
                    : "New Chat"}
                </button>
              </div>

              {/* Chat History */}

              <div className="flex-1 overflow-y-auto p-3">
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  History
                </p>

                {loadingHistory ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(
                      (item) => (
                        <div
                          key={item}
                          className="h-10 animate-pulse rounded-xl bg-gray-200"
                        />
                      )
                    )}
                  </div>
                ) : chats.length ===
                  0 ? (
                  <div className="px-2 py-6 text-center text-sm text-gray-400">
                    No conversations
                    yet.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {chats.map(
                      (chat) => (
                        <button
                          key={
                            chat._id
                          }
                          type="button"
                          onClick={() =>
                            openChat(
                              chat._id
                            )
                          }
                          className={`w-full rounded-xl px-3 py-3 text-left text-sm transition ${
                            chatId ===
                            chat._id
                              ? "bg-gray-200 font-medium text-gray-950"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
                          }`}
                        >
                          <div className="truncate">
                            {chat.title ||
                              "New Chat"}
                          </div>
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </aside>

            {/* Mobile Sidebar */}

            <div className="fixed inset-0 z-40 md:hidden">

              {/* Overlay */}

              <button
                type="button"
                aria-label="Close sidebar"
                onClick={() =>
                  setSidebarOpen(
                    false
                  )
                }
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />

              {/* Sidebar */}

              <aside className="relative z-50 flex h-full w-80 max-w-[85vw] flex-col border-r border-gray-100 bg-white shadow-2xl">

                {/* Mobile Header */}

                <div className="border-b border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold text-gray-950">
                      Movie AI
                    </h1>

                    <button
                      type="button"
                      onClick={() =>
                        setSidebarOpen(
                          false
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                      aria-label="Close sidebar"
                    >
                      ×
                    </button>
                  </div>

                  {/* New Chat */}

                  <button
                    type="button"
                    onClick={
                      createNewChat
                    }
                    disabled={
                      creatingChat
                    }
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="text-lg">
                      {creatingChat
                        ? "..."
                        : "+"}
                    </span>

                    {creatingChat
                      ? "Creating..."
                      : "New Chat"}
                  </button>
                </div>

                {/* Mobile History */}

                <div className="flex-1 overflow-y-auto p-3">
                  <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    History
                  </p>

                  {loadingHistory ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(
                        (item) => (
                          <div
                            key={item}
                            className="h-10 animate-pulse rounded-xl bg-gray-200"
                          />
                        )
                      )}
                    </div>
                  ) : chats.length ===
                    0 ? (
                    <div className="px-2 py-6 text-center text-sm text-gray-400">
                      No conversations
                      yet.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {chats.map(
                        (chat) => (
                          <button
                            key={
                              chat._id
                            }
                            type="button"
                            onClick={() =>
                              openChat(
                                chat._id
                              )
                            }
                            className={`w-full rounded-xl px-3 py-3 text-left text-sm transition ${
                              chatId ===
                              chat._id
                                ? "bg-gray-200 font-medium text-gray-950"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
                            }`}
                          >
                            <div className="truncate">
                              {chat.title ||
                                "New Chat"}
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </>
        )}

        {/* ================================= */}
        {/* MAIN CHAT */}
        {/* ================================= */}

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">

          {/* ================================= */}
          {/* TOP HEADER */}
          {/* ================================= */}

          <header className="border-b border-gray-100 bg-white">
            <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-4 sm:py-5">

              {/* Open Sidebar */}

              {!sidebarOpen && (
                <button
                  type="button"
                  onClick={() =>
                    setSidebarOpen(
                      true
                    )
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg text-gray-600 shadow-sm transition hover:bg-gray-100 hover:text-gray-950"
                  aria-label="Open sidebar"
                >
                  ☰
                </button>
              )}

              <div className="min-w-0">
                <h2 className="text-xl font-bold tracking-tight text-gray-950">
                  Movie AI
                </h2>

                <p className="mt-1 truncate text-sm text-gray-500">
                  Ask anything about
                  movies.
                </p>
              </div>
            </div>
          </header>

          {/* ================================= */}
          {/* MESSAGES */}
          {/* ================================= */}

          <div className="flex-1">

            {isEmpty ? (
              <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">

                {/* Icon */}

                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-950 text-2xl text-white">
                  🎬
                </div>

                {/* Title */}

                <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                  What movie are you
                  interested in?
                </h1>

                {/* Description */}

                <p className="mt-3 max-w-lg text-gray-500">
                  Search movies, discover
                  details, ask about
                  directors, actors,
                  ratings, or get smart
                  recommendations.
                </p>

                {/* Suggestions */}

                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {[
                    "Tell me about Interstellar",
                    "Recommend movies like Inception",
                    "Who directed The Dark Knight?",
                  ].map(
                    (suggestion) => (
                      <button
                        key={
                          suggestion
                        }
                        type="button"
                        onClick={() =>
                          setInput(
                            suggestion
                          )
                        }
                        className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 transition hover:border-gray-400 hover:text-gray-950"
                      >
                        {suggestion}
                      </button>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-4xl space-y-8 px-4 pb-36 pt-8">

                {/* Messages */}

                {messages.map(
                  (message) => (
                    <div
                      key={
                        message.id
                      }
                      className={
                        message.role ===
                        "user"
                          ? "flex justify-end"
                          : "flex justify-start"
                      }
                    >

                      {/* ================================= */}
                      {/* USER MESSAGE */}
                      {/* ================================= */}

                      {message.role ===
                        "user" && (
                        <div className="max-w-[85%] sm:max-w-[80%]">
                          <div className="rounded-2xl rounded-br-md bg-gray-950 px-5 py-3.5 text-[15px] leading-6 text-white shadow-sm">
                            {message.parts.map(
                              (
                                part,
                                index
                              ) => {
                                if (
                                  part.type ===
                                  "text"
                                ) {
                                  return (
                                    <span
                                      key={
                                        `${message.id}-text-${index}`
                                      }
                                    >
                                      {
                                        part.text
                                      }
                                    </span>
                                  );
                                }

                                return null;
                              }
                            )}
                          </div>
                        </div>
                      )}

                      {/* ================================= */}
                      {/* ASSISTANT MESSAGE */}
                      {/* ================================= */}

                      {message.role ===
                        "assistant" && (
                        <div className="w-full max-w-[95%] space-y-5">

                          {message.parts.map(
                            (
                              part,
                              index
                            ) => {

                              // =================================
                              // TEXT
                              // =================================

                              if (
                                part.type ===
                                "text"
                              ) {
                                return (
                                  <div
                                    key={
                                      `${message.id}-text-${index}`
                                    }
                                    className="assistant-text"
                                  >
                                    <Markdown
                                      text={
                                        part.text
                                      }
                                    />
                                  </div>
                                );
                              }

                              // =================================
                              // MOVIE TOOL
                              // =================================

                              if (
                                part.type ===
                                "tool-movieTool"
                              ) {
                                const toolPart =
                                  part as any;

                                const output =
                                  toolPart.output;

                                // =================================
                                // TOOL LOADING
                                // =================================

                                if (
                                  !output
                                ) {
                                  return (
                                    <div
                                      key={
                                        `${message.id}-tool-${index}`
                                      }
                                      className="flex items-center gap-2 py-2 text-sm text-gray-500"
                                    >
                                      <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400" />

                                      <span>
                                        Searching
                                        movies...
                                      </span>
                                    </div>
                                  );
                                }

                                // =================================
                                // TOOL ERROR
                                // =================================

                                if (
                                  !output.success
                                ) {
                                  // Haddii AI-gu dib u isku dayay oo uu guuleystay,
                                  // error-kii hore ha la muujin.
                                  const recovered =
                                    message.parts
                                      .slice(index + 1)
                                      .some(
                                        (laterPart) =>
                                          laterPart.type ===
                                            "tool-movieTool" &&
                                          (
                                            laterPart as {
                                              output?: {
                                                success?: boolean;
                                              };
                                            }
                                          ).output?.success
                                      );

                                  if (recovered) {
                                    return null;
                                  }

                                  return (
                                    <div
                                      key={
                                        `${message.id}-tool-error-${index}`
                                      }
                                      className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
                                    >
                                      {
                                        output.error
                                      }
                                    </div>
                                  );
                                }

                                // =================================
                                // MOVIE DETAILS
                                // =================================

                                if (
                                  output.type ===
                                  "movie_details"
                                ) {
                                  return (
                                    <div
                                      key={
                                        `${message.id}-details-${index}`
                                      }
                                    >
                                      <MovieCard
                                        movie={
                                          output.data
                                        }
                                        onClick={() =>
                                          setSelectedMovie(
                                            output.data
                                          )
                                        }
                                      />
                                    </div>
                                  );
                                }

                                // =================================
                                // MOVIE SEARCH
                                // =================================

                                if (
                                  output.type ===
                                  "movie_search"
                                ) {
                                  return (
                                    <div
                                      key={
                                        `${message.id}-search-${index}`
                                      }
                                    >
                                      <div className="mb-3 flex items-center justify-between gap-4">
                                        <h2 className="text-sm font-semibold text-gray-950">
                                          Movies
                                        </h2>

                                        <span className="text-xs text-gray-400">
                                          {output.totalResults ||
                                            output
                                              .data
                                              ?.length ||
                                            0}{" "}
                                          results
                                        </span>
                                      </div>

                                      <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-4">
                                        {output.data?.map(
                                          (
                                            movie: Movie,
                                            movieIndex: number
                                          ) => (
                                            <MovieCard
                                              key={
                                                movie.imdbID ||
                                                movie.imdbId ||
                                                `${movie.title || movie.Title}-${movieIndex}`
                                              }
                                              movie={
                                                movie
                                              }
                                              onClick={() =>
                                                handleMovieClick(
                                                  movie
                                                )
                                              }
                                            />
                                          )
                                        )}
                                      </div>
                                    </div>
                                  );
                                }

                                // =================================
                                // RECOMMENDATIONS
                                // =================================

                                if (
                                  output.type ===
                                  "movie_recommendations"
                                ) {
                                  return (
                                    <div
                                      key={
                                        `${message.id}-recommendations-${index}`
                                      }
                                    >
                                      <div className="mb-3">
                                        <h2 className="text-sm font-semibold text-gray-950">
                                          Recommended
                                          Movies
                                        </h2>

                                        {output.basedOn && (
                                          <p className="mt-1 text-xs text-gray-400">
                                            Based
                                            on{" "}
                                            {typeof output.basedOn ===
                                            "string"
                                              ? output.basedOn
                                              : output
                                                  .basedOn
                                                  .title}
                                          </p>
                                        )}
                                      </div>

                                      <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-4">
                                        {output.data?.map(
                                          (
                                            movie: Movie,
                                            movieIndex: number
                                          ) => (
                                            <MovieCard
                                              key={
                                                movie.imdbID ||
                                                movie.imdbId ||
                                                `${movie.title || movie.Title}-${movieIndex}`
                                              }
                                              movie={
                                                movie
                                              }
                                              onClick={() =>
                                                handleMovieClick(
                                                  movie
                                                )
                                              }
                                            />
                                          )
                                        )}
                                      </div>
                                    </div>
                                  );
                                }
                              }

                              return null;
                            }
                          )}
                        </div>
                      )}
                    </div>
                  )
                )}

                {/* ================================= */}
                {/* STREAMING */}
                {/* ================================= */}

                {(status ===
                  "streaming" ||
                  status ===
                    "submitted") && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400" />

                    <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400 [animation-delay:150ms]" />

                    <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400 [animation-delay:300ms]" />
                  </div>
                )}

                {/* ================================= */}
                {/* ERROR */}
                {/* ================================= */}

                {status === "error" && (
                  <div data-chat-error className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                    The AI could not answer right now
                    {error?.message
                      ? `: ${error.message}`
                      : "."}{" "}
                    Please try again.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ================================= */}
          {/* INPUT */}
          {/* ================================= */}

          <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-100 bg-white/95 p-3 backdrop-blur sm:p-4">
            <form
              onSubmit={
                handleSubmit
              }
              className="mx-auto flex max-w-4xl gap-2"
            >
              <input
                value={input}
                onChange={(e) =>
                  setInput(
                    e.target.value
                  )
                }
                disabled={
                  status ===
                    "streaming" ||
                  status ===
                    "submitted"
                }
                placeholder="Ask about a movie..."
                className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-[15px] text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
              />

              <button
                type="submit"
                disabled={
                  status ===
                    "streaming" ||
                  status ===
                    "submitted" ||
                  !input.trim()
                }
                className="shrink-0 rounded-2xl bg-gray-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
              >
                {status ===
                    "streaming" ||
                status ===
                  "submitted"
                  ? "..."
                  : "Send"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ===================================== */}
      {/* MOVIE MODAL */}
      {/* ===================================== */}

      {selectedMovie && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() =>
            setSelectedMovie(
              null
            )
          }
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* Close Modal */}

            <button
              type="button"
              onClick={() =>
                setSelectedMovie(
                  null
                )
              }
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-lg text-white transition hover:bg-black"
              aria-label="Close movie details"
            >
              ×
            </button>

            <div className="max-h-[90vh] overflow-y-auto">

              {/* ================================= */}
              {/* MOVIE POSTER */}
              {/* ================================= */}

              {/* ================================= */}
              {/* TRAILER PLAYER */}
              {/* ================================= */}

              {trailerId && (
                <div className="aspect-video w-full bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${trailerId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                    title={`${
                      selectedMovie.title ||
                      selectedMovie.Title ||
                      "Movie"
                    } trailer`}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              )}

              <div
                className={
                  trailerId
                    ? "hidden"
                    : "relative"
                }
              >
                {(
                  selectedMovie.poster ||
                  selectedMovie.Poster
                ) &&
                (
                  selectedMovie.poster ||
                  selectedMovie.Poster
                ) !== "N/A" ? (
                  <img
                    src={
                      selectedMovie.poster ||
                      selectedMovie.Poster
                    }
                    alt={
                      selectedMovie.title ||
                      selectedMovie.Title ||
                      "Movie"
                    }
                    className="h-[280px] w-full object-cover sm:h-[320px]"
                  />
                ) : (
                  <div className="flex h-[280px] items-center justify-center bg-gray-100 text-gray-400 sm:h-[320px]">
                    No poster
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Play Trailer */}

                <button
                  type="button"
                  onClick={watchTrailer}
                  disabled={
                    trailerStatus === "loading"
                  }
                  className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl text-gray-950 shadow-xl transition hover:scale-105 hover:bg-white disabled:opacity-70"
                  aria-label="Play trailer"
                >
                  {trailerStatus === "loading"
                    ? "…"
                    : "▶"}
                </button>

                {/* Movie Header */}

                <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-6">
                  <h2 className="text-2xl font-bold sm:text-3xl">
                    {selectedMovie.title ||
                      selectedMovie.Title ||
                      "Unknown Movie"}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-200">

                    {(selectedMovie.year ||
                      selectedMovie.Year) && (
                      <span>
                        {selectedMovie.year ||
                          selectedMovie.Year}
                      </span>
                    )}

                    {(selectedMovie.runtime ||
                      selectedMovie.Runtime) && (
                      <span>
                        •{" "}
                        {selectedMovie.runtime ||
                          selectedMovie.Runtime}
                      </span>
                    )}

                    {(selectedMovie.rated ||
                      selectedMovie.Rated) && (
                      <span>
                        •{" "}
                        {selectedMovie.rated ||
                          selectedMovie.Rated}
                      </span>
                    )}

                    {selectedMovie.imdbRating && (
                      <span className="font-semibold text-white">
                        • ⭐{" "}
                        {
                          selectedMovie.imdbRating
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ================================= */}
              {/* MOVIE DETAILS */}
              {/* ================================= */}

              <div className="space-y-6 p-5 sm:p-6">

                {/* Plot */}

                {(selectedMovie.plot ||
                  selectedMovie.Plot) && (
                  <section>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
                      Plot
                    </h3>

                    <p className="text-[15px] leading-7 text-gray-700">
                      {selectedMovie.plot ||
                        selectedMovie.Plot}
                    </p>
                  </section>
                )}

                {/* Information Grid */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {(selectedMovie.genre ||
                    selectedMovie.Genre) && (
                    <InfoItem
                      label="Genre"
                      value={
                        selectedMovie.genre ||
                        selectedMovie.Genre ||
                        ""
                      }
                    />
                  )}

                  {(selectedMovie.director ||
                    selectedMovie.Director) && (
                    <InfoItem
                      label="Director"
                      value={
                        selectedMovie.director ||
                        selectedMovie.Director ||
                        ""
                      }
                    />
                  )}

                  {(selectedMovie.cast ||
                    selectedMovie.Actors) && (
                    <InfoItem
                      label="Cast"
                      value={
                        selectedMovie.cast ||
                        selectedMovie.Actors ||
                        ""
                      }
                    />
                  )}

                  {(selectedMovie.writer ||
                    selectedMovie.Writer) && (
                    <InfoItem
                      label="Writer"
                      value={
                        selectedMovie.writer ||
                        selectedMovie.Writer ||
                        ""
                      }
                    />
                  )}

                  {(selectedMovie.released ||
                    selectedMovie.Released) && (
                    <InfoItem
                      label="Released"
                      value={
                        selectedMovie.released ||
                        selectedMovie.Released ||
                        ""
                      }
                    />
                  )}

                  {(selectedMovie.language ||
                    selectedMovie.Language) && (
                    <InfoItem
                      label="Language"
                      value={
                        selectedMovie.language ||
                        selectedMovie.Language ||
                        ""
                      }
                    />
                  )}

                  {(selectedMovie.country ||
                    selectedMovie.Country) && (
                    <InfoItem
                      label="Country"
                      value={
                        selectedMovie.country ||
                        selectedMovie.Country ||
                        ""
                      }
                    />
                  )}

                  {(selectedMovie.awards ||
                    selectedMovie.Awards) && (
                    <InfoItem
                      label="Awards"
                      value={
                        selectedMovie.awards ||
                        selectedMovie.Awards ||
                        ""
                      }
                    />
                  )}

                  {selectedMovie.imdbVotes && (
                    <InfoItem
                      label="IMDb Votes"
                      value={
                        selectedMovie.imdbVotes
                      }
                    />
                  )}

                  {selectedMovie.boxOffice && (
                    <InfoItem
                      label="Box Office"
                      value={
                        selectedMovie.boxOffice
                      }
                    />
                  )}
                </div>

                {/* Trailer + IMDb Buttons */}

                <div className="flex flex-wrap items-center gap-3">
                  {!trailerId && (
                    <button
                      type="button"
                      onClick={watchTrailer}
                      disabled={
                        trailerStatus === "loading"
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
                    >
                      {trailerStatus === "loading"
                        ? "Loading trailer..."
                        : "▶ Watch Trailer"}
                    </button>
                  )}

                  {(selectedMovie.imdbID ||
                    selectedMovie.imdbId) && (
                    <a
                      href={`https://www.imdb.com/title/${
                        selectedMovie.imdbID ||
                        selectedMovie.imdbId
                      }/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-950"
                    >
                      View on IMDb →
                    </a>
                  )}

                  {trailerStatus === "error" && (
                    <span className="text-sm text-red-600">
                      Trailer not available.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ==========================================
// INFO ITEM
// ==========================================

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="text-sm leading-6 text-gray-800">
        {value}
      </p>
    </div>
  );
}