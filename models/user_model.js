import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 150,
    },
    salary: {
      type: Number,
      default: 0.0,
      min: 0.0,
      max: 100000.0,
    },
    isAtive: {
      type: Boolean,
      default: true,
    },
    city: String,
  },
  { versionKey: false },
);

export default mongoose.model("users", UserSchema);
