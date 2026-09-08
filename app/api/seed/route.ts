import { connectDB } from "../../lib/mongodb";
import { Movie } from "../../lib/models/Movie";
import { User } from "../../lib/models/User";
import { Review } from "../../lib/models/Review";

export async function POST() {
  try {
    await connectDB();

    await Movie.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});

    const movies = await Movie.insertMany([
      {
        title: "Interstellar",
        year: 2014,
        genre: "Sci-Fi",
        rating: 8.7,
        director: "Christopher Nolan",
        description:
          "A team travels through a wormhole in space.",
      },
      {
        title: "Inception",
        year: 2010,
        genre: "Sci-Fi",
        rating: 8.8,
        director: "Christopher Nolan",
        description:
          "A thief enters people's dreams.",
      },
      {
        title: "The Matrix",
        year: 1999,
        genre: "Sci-Fi",
        rating: 8.7,
        director: "The Wachowskis",
        description:
          "A hacker discovers the true nature of reality.",
      },
      {
        title: "The Godfather",
        year: 1972,
        genre: "Crime",
        rating: 9.2,
        director: "Francis Ford Coppola",
        description:
          "The story of a powerful crime family.",
      },
      {
        title: "The Dark Knight",
        year: 2008,
        genre: "Action",
        rating: 9.0,
        director: "Christopher Nolan",
        description:
          "Batman faces the Joker.",
      },
    ]);

    const users = await User.insertMany([
      {
        name: "Ahmed",
        email: "ahmed@example.com",
        age: 22,
        favorite_genre: "Action",
      },
      {
        name: "Hassan",
        email: "hassan@example.com",
        age: 27,
        favorite_genre: "Sci-Fi",
      },
      {
        name: "Amina",
        email: "amina@example.com",
        age: 31,
        favorite_genre: "Drama",
      },
      {
        name: "Fatima",
        email: "fatima@example.com",
        age: 24,
        favorite_genre: "Comedy",
      },
    ]);

    await Review.insertMany([
      {
        movie_id: movies[0]._id,
        user_id: users[1]._id,
        rating: 5,
        comment: "Amazing movie!",
        date: new Date(),
      },
      {
        movie_id: movies[1]._id,
        user_id: users[2]._id,
        rating: 5,
        comment: "Excellent story.",
        date: new Date(),
      },
    ]);

    return Response.json({
      success: true,
      message: "Sample data inserted successfully",
      movies: movies.length,
      users: users.length,
      reviews: 2,
    });
  } catch (error) {
    console.error("Seed error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to insert sample data",
      },
      {
        status: 500,
      }
    );
  }
}