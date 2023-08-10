import mongoose, { FilterQuery, UpdateQuery, QueryOptions } from "mongoose";

let isConnected = false; // variable to check if mongoose is connected

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL) return console.log("MongoDB_URL not fount");
  if (isConnected) return console.log("Already connected to MonoDB");

  try {
    await mongoose.connect(process.env.MONGODB_URL);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};
