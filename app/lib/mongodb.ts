import mongoose from "mongoose";

// Function-kan wuxuu application-ka ku xirayaa MongoDB.
export async function connectDB() {
  // Waxaan .env.local ka qaadaneynaa MongoDB URL-ka.
  const mongoUri = process.env.MONGODB_URI;

  // Haddii MongoDB URL-ka uusan jirin,
  // waxaan joojineynaa connection-ka.
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined");
  }

  // Haddii database-ku horey ugu xiran yahay,
  // connection cusub ma sameyneyno.
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // Halkan waxaan application-ka ku xiraynaa MongoDB.
  await mongoose.connect(mongoUri);

  // Console-ka waxaan ku arki doonaa marka connection-ku shaqeeyo.
  console.log("MongoDB connected successfully");
}