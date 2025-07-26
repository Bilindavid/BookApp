import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "Username must be at least 3 characters" });
    }

    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
    const user = new User({ username, email, password, profileImage });
    await user.save();
    const token = generateToken(user._id);
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }
    const isExisting = await User.findOne({ email });
    if (!isExisting) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    const correctPassword = await isExisting.comparePassword(password);
    if (!correctPassword) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    const token = generateToken(isExisting._id);
    return res.status(200).json({
      token,
      user: {
        id: isExisting._id,
        username: isExisting.username,
        email: isExisting.email,
        profileImage: isExisting.profileImage,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
