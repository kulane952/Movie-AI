import { connectDB } from "../mongodb";
import { Movie } from "../models/Movie";

export async function cacheMovie(movie: {
  imdbId?: string;
  title: string;
  year: string | number;
  genre: string;
  imdbRating?: string;
  director: string;
  plot: string;
  cast?: string;
  poster?: string;
  runtime?: string;
  ratings?: unknown[];
}) {
  await connectDB();

  const year = Number.parseInt(
    String(movie.year),
    10
  );

  const existingMovie = await Movie.findOne({
    title: movie.title,
    year,
  });

  if (existingMovie) {
    return existingMovie;
  }

  const newMovie = await Movie.create({
    title: movie.title,
    year,
    genre: movie.genre,
    rating:
      Number.parseFloat(movie.imdbRating || "0") || 0,
    director: movie.director,
    description: movie.plot,
    cast: movie.cast
      ? movie.cast
          .split(",")
          .map((name) => name.trim())
      : [],
    poster: movie.poster || "",
    runtime: movie.runtime || "",
    externalRatings: movie.ratings || [],
  });

  return newMovie;
}