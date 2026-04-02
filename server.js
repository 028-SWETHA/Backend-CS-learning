require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");


const app = express();
app.use(cors());
app.use(express.json());

// ✅ Use ENV variable for MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));
// ✅ Schema
const userSchema = new mongoose.Schema({
  name: String,
  rollNumber: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// ✅ Signup
app.post("/signup", async (req, res) => {
  try {
    const { name, rollNumber, password } = req.body;

    const existingUser = await User.findOne({ rollNumber });
    if (existingUser) {
      return res.status(400).json({ message: "Roll number already exists!" });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      rollNumber,
      password: hashedPassword,
    });

    await newUser.save();

    res.json({ message: "Signup successful!" });
  } catch (err) {
    res.status(500).json({ message: "Server error!" });
  }
});

// ✅ Login
app.post("/login", async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    const user = await User.findOne({ rollNumber });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    // 🔐 Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    res.json({
      message: "Login successful!",
      user: {
        name: user.name,
        rollNumber: user.rollNumber,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error!" });
  }
});

// ✅ Dynamic PORT (IMPORTANT)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));