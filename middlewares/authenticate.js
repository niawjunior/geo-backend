const { verifyToken } = require("../utils/auth");

// Middleware to verify the JWT token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Missing authorization token" });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid authorization token" });
  }
};

module.exports = authenticate;
