const express = require("express");
const router = express.Router();
const User = require("./models/User");
const {
  hashPassword,
  comparePassword,
  generateToken,
} = require("./utils/auth");

router.post("/register", async (req, res) => {
  try {
    // Extract the user data from the request body
    const { username, password } = req.body;

    // Hash the password
    const passwordHash = await hashPassword(password);

    console.log(username);
    console.log(passwordHash);
    // Create a new user object
    const user = await User.create({
      username,
      passwordHash,
    });
    // Check if the user was successfully inserted
    if (!user) {
      throw new Error("User registration failed");
    }
    // Respond with a success message or appropriate response
    res.json({ message: "User registered successfully" });
  } catch (error) {
    // Handle registration error
    console.error(error);

    // Check for specific validation errors
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Handle registration error
    res.status(500).json({ error: "An error occurred during registration" });
  }
});

router.post("/login", async (req, res) => {
  try {
    // Extract the user data from the request body
    const { username, password } = req.body;

    // Fetch the user data from the database
    const user = await User.findOne({ where: { username } });

    // If the user does not exist or the password is incorrect, return an error response
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Generate a JWT token
    const token = generateToken({ username: user.username });

    // Respond with the token
    res.json({ token });
  } catch (error) {
    // Handle login error
    console.error(error);
    res.status(500).json({ error: "An error occurred during login" });
  }
});

module.exports = router;
