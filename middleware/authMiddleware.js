const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const UserModel = require("../modals/userModel");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if token is present in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token
      token = req.headers.authorization.split(" ")[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by ID in the decoded token and attach to req object
      req.user = await UserModel.findById(decoded.id).select("-password");

      // Call next middleware
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  // If token is missing
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };
