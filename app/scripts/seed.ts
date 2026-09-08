import mongoose from "mongoose";
import { Movie } from "../lib/models/Movie";

const mongoUri = process.env.MONGODB_URI;

async function seed() {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined");
  }

  await mongoose.connect(mongoUri);

  console.log("MongoDB connected");

  await Movie.deleteMany({});

  await Movie.insertMany([
    {
      title: "Interstellar",
      year: 2014,
      genre: "Sci-Fi",
      rating: 8.7,
      director: "Christopher Nolan",
      description: "A team travels through a wormhole in space.",
    },
    {
      title: "Inception",
      year: 2010,
      genre: "Sci-Fi",
      rating: 8.8,
      director: "Christopher Nolan",
      description: "A thief enters people's dreams.",
    },
    {
      title: "The Matrix",
      year: 1999,
      genre: "Sci-Fi",
      rating: 8.7,
      director: "The Wachowskis",
      description: "A hacker discovers the true nature of reality.",
    },
    {
      title: "The Godfather",
      year: 1972,
      genre: "Crime",
      rating: 9.2,
      director: "Francis Ford Coppola",
      description: "The story of a powerful crime family.",
    },
    {
      title: "The Dark Knight",
      year: 2008,
      genre: "Action",
      rating: 9.0,
      director: "Christopher Nolan",
      description: "Batman faces the Joker.",
    },
  ]);

  console.log("Sample movies inserted");

  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error("Seed error:", error);
  process.exit(1);
});