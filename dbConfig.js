import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const dbConfig = async () => {
  try {
    const con = await mongoose.connect(process.env.DB_URL);
    if (con) {
      console.log("Db connected successfully");
    }
  } catch (error) {
    console.log(`Error while db connection ${error}`);
  }
};
