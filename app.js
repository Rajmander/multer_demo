import express from "express";
import path, { resolve } from "path";

import nodemailer from "nodemailer";

import { v4 as uuidv4 } from "uuid";

import { fileURLToPath } from "url";
import { dirname } from "path";

//import { dev } from "./otp.js";

import PDFDocument from "pdfkit";

import fs from "fs";

//dev();

import { generatePdfBuffer } from "./gen.js";

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json());

import dotenv from "dotenv";
dotenv.config();

import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = uuidv4() + ext;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images allowed"), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
});

// Import db connection
import { dbConfig } from "./dbConfig.js";

dbConfig();

//import user from "./models/user_model.js";
import User from "./models/user_model.js";
import mongoose from "mongoose";

//test();

const PORT = process.env.PORT || 3000;

// Find one
app.get("/users/:name", async (req, res, next) => {
  const name = req.params.name;
  console.log("username ", name);

  const userData = await user.findOne({ username: name });

  if (!userData) {
    return res.status(200).json({ msg: "User not found", data: [] });
  }

  res.status(200).json({ msg: "User fetched", data: userData });
});

// GET ALL USERS
app.get("/users", async (req, res, next) => {
  const totalUsers = await user.countDocuments();

  console.log(req.headers);

  //console.log(typeof req.query.offset);

  return;

  let offset = req.query.offset > 1 ? req.query.offset - 1 : 0;

  let page = 1;
  if (offset > 0) {
    page = offset + 1;
  }
  let limit = req.query.limit ? req.query.limit : 2;

  const MAX_LIMIT = 50;

  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  console.log("Offset = ", offset, "limit = ", limit);

  // return;

  const users = await user.find().skip(offset).limit(limit);
  res.status(200).json({
    msg: "Users listing",
    data: users,
    metaData: {
      totalUsers,
      page: page,
      limit,
    },
  });
});

// CREATE USER
app.post("/users", async (req, res) => {
  try {
    const { name, salary, city, mobile, department } = req.body;

    const hasUser = await User.find({ username: name });
    if (hasUser.length > 0) {
      return res.status(209).json({ msg: "Username already exists" });
    }

    const userC = new user();
    userC.username = name;
    userC.salary = salary;
    userC.city = city;
    userC.mobile = mobile;
    userC.department = department;
    const userData = await userC.save();

    return res.status(200).json({
      status: "success",
      msg: "Users saved successfully",
      data: userData,
    });
  } catch (error) {
    console.log("Error code = ", error.name);
  }
});

// PARTIAL UPDATE
app.patch("/users/:id", async (req, res, next) => {
  try {
    let { name } = req.body;
    let id = req.params.id;

    name = name ?? "";

    if (name == "") {
      return res
        .status(400)
        .json({ message: "Name is required", error: "Validation error" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid Id");

    if (!id) {
      return res
        .status(400)
        .json({ message: "Id is required", error: "Validation error" });
    }

    const userData = await user.findByIdAndUpdate(
      id,
      { $set: { username: name, city: "Faridabad" } },
      { new: true },
    );

    if (!userData) {
      return res.status(404).json({
        message: "User not found",
        error: "NotFoundError",
      });
    }

    const data = {
      active: userData.isAtive,
      name: userData.username,
      city: userData.city,
      salary: userData.salary,
    };

    res.status(200).json({
      message: "User updated successfully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong while updating the user",
      error: error.message || "InternalServerError",
    });
  }
});

// User BY Id
app.get("/users/:id", async (req, res, next) => {
  const userId = req.params.id;
  const userData = await user.findById(userId, { _id: 0 });

  if (!userData) {
    return res.status(200).json({ msg: "User not found", data: [] });
  }
  return res
    .status(200)
    .json({ msg: "User fetched successfully", data: userData });
});

//$upsert
// Delete
app.delete("/users/:id", async (req, res, next) => {
  try {
    const userId = req.params.id;
    const userDeleted = await user.findByIdAndDelete(userId);

    if (!userDeleted) {
      return res.status(200).json({ msg: "Error while user deletion" });
    }
    return res.status(200).json({ msg: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

// Delete all users
app.delete("/users", async (req, res, next) => {
  const userDeleted = await user.deleteMany();
  if (userDeleted) {
    res.status(200).json({ msg: "All user deleted successfully" });
  }
  res.status(200).json({ msg: "Something went wrong" });
});

// Update status for all users
app.patch("/users_all/users_update", async (req, res, next) => {
  //return res.status(200).json({ msg: "Something went wrong" });

  //const usersData = await user.find({ isAtive: null });

  //console.log(usersData);

  await user.updateMany({ amount: { $exists: null } }, { $set: { amount: 0 } });
});

app.get("/y_users", async (req, res, next) => {
  const userData = await user.aggregate([
    {
      $match: { isAtive: true },
    },
    // {
    //   $count: "totalUsers",
    // },
    {
      $group: {
        _id: "$city",
        usersCount: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: 0,
        city: "$_id",
        usersCount: 1,
        totalAmount: 1,
      },
    },
    {
      $group: {
        _id: null,
      },
    },
  ]);
  if (!userData) {
    res.status(400).json({ msg: "User not matched" });
  }
  res.status(200).json({ msg: "User fetched", data: userData });
});

// use of multer
app.post("/users/upload", (req, res) => {
  //upload.single("avatar")(req, res, (error) => {
  upload.array("avatars")(req, res, (error) => {
    if (error) {
      console.error("Error catching in file uploading ", error.message);
      return res.status(400).json({
        success: false,
        message: "File upload failed",
        error: error.message,
      });
    }

    if (!req.files) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    console.log("File details ", req.files);

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: req.files.map((file) => file.filename),
      //data: req.file.filename,
    });
  });
});
// clbg kdet bpns njby

app.post("/sendEmail", async (req, res, next) => {
  const pdfBuffer = await generatePdfBuffer({
    name: "John Doe",
    email: "john@example.com",
    date: "2026-03-25",
    items: [
      { description: "Product 1", amount: 29.99 },
      { description: "Product 2", amount: 49.99 },
    ],
  });

  // const filename = uuidv4() + ".pdf";
  // const pdfPath = path.join(__dirname, filename);

  // const doc = new PDFDocument();
  // const stream = fs.createWriteStream(pdfPath);
  // doc.pipe(stream);
  // doc.fontSize(20).text("Hello! This is a test PDF.", 100, 100);
  // doc.end();

  // console.log("before promise resolved");

  // await new Promise((resolve, reject) => {
  //   stream.on("finish", resolve);
  //   stream.on("error", reject);
  // });

  // console.log("After promise resolved");

  // 1. Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "rajmandersinghmatharu@gmail.com",
      pass: "",
    },
  });

  // 2. Define email
  const mailOptions = {
    from: "rajmandersinghmatharu@gmail.com",
    to: "rajmandersinghmatharu@gmail.com",
    subject: "Test Email from Node.js",
    html: ` <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2 style="color:#4CAF50;">Hello John Doe!</h2>
        <p>Thank you for signing up on our platform. Your account has been successfully created.</p>
        <h3>Account Details:</h3>
        <ul>
          <li><strong>Username:</strong> johndoe</li>
          <li><strong>Email:</strong> john@example.com</li>
        </ul>
        <p style="color:#555;">If you didn’t sign up, please ignore this email.</p>
        <hr>
        <p style="font-size: 0.9em; color:#888;">&copy; 2026 My Company. All rights reserved.</p>
      </div>`,
    attachments: [
      {
        filename: uuidv4() + ".pdf",
        //path: pdfPath,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  // 3. Send email
  let info = await transporter.sendMail(mailOptions);
  console.log("Email sent: " + info.response);
});

//===== find demo =====
app.get("/find", async (req, res) => {
  const users = await user.find(
    {
      //salary: { $not: { $gt: 7000 }, $exists: true },
    },
    { username: 1, _id: 0, salary: 1, city: 1 },
    { skip: 0, limit: 100 },
  );

  //{ salary: { $gt: 50000 } },

  const data = users.map((u) => ({
    id: u._id,
    name: u.username,
    city: u.city,
    salary: u.salary,
  }));

  return res
    .status(200)
    .json({ success: true, message: "User fetched successfully", data: data });
});

// rename field name
app.post("/rename", async (req, res) => {
  const test = await user.find({ isActive: true });
  return res.status(200).json({ success: true, test });
  //console.log(test);
  // const result = await user.updateMany(
  //   {},
  //   { $rename: { isAtive: "isActive" } },
  // );

  // console.log(result);

  // return res.status(200).json({ success: true, result });
});

app.get("/api/v1/finddemo", async (req, res, next) => {
  try {
    let pageQuery = req.query.page;
    let limitQuery = req.query.limit;

    let page = parseInt(pageQuery, 10);
    let limit = parseInt(limitQuery, 10);

    page = isNaN(page) || page < 1 ? 1 : page;
    limit = isNaN(limit) || limit < 1 ? 10 : limit;

    let skip = (page - 1) * limit;

    console.log("Skip ===== ", skip, "Limit = ", limit);

    const users = await User.find({ isActive: true, salary: { $gt: 20000 } })
      .skip(skip)
      .limit(limit)
      .lean();

    if (!users.length) {
      return res.status(200).json({
        success: true,
        message: "No users found",
        data: [],
      });
    }

    const formattedUsers = users.map((userItem) => ({
      id: userItem._id.toString(),
      name: userItem.username,
      mobile: userItem.mobile,
      salary: userItem.salary,
      city: userItem.city,
      department: userItem.department,
      isActive: userItem.isActive,
    }));

    const totalUsers = await User.countDocuments();

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: formattedUsers,
      metaData: {
        page: page,
        limit: limit,
        count: formattedUsers.length,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    console.error("GET_USERS_ERROR", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update User
app.patch("/api/v1/demo/users/:id", async (req, res, next) => {
  try {
    const { salary } = req.body;
    const { id } = req.params;

    const user = await User.findById(id);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { salary: salary } },
      { new: true },
    ).lean();

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const formattedUser = {
      id: updatedUser._id,
      name: updatedUser.username,
      salary: updatedUser.salary,
      city: updatedUser.city,
      department: updatedUser.department,
      isActive: updatedUser.isActive,
      mobile: updatedUser.mobile,
    };

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: formattedUser,
    });
  } catch (error) {
    console.error("UPDATE_USER_ERROR", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
