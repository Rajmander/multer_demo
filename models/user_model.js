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
      index: true,
    },
    mobile: {
      type: String,
      match: /^[0-9]{10}$/,
    },
    salary: {
      type: Number,
      default: 0.0,
      min: 0.0,
      max: 100000.0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true, // Filtering
    },
    city: { type: String, index: true },
    department: { type: String, index: true },
  },
  { versionKey: false },
);

export default mongoose.model("User", UserSchema);
