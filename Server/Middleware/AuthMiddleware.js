const jwt = require("jsonwebtoken");
const model = require("../Models/UserModels");
const asyncHandler = require("express-async-handler");

const getJwtSecret = () => process.env.JWT_SECRET || process.env.JWTOKEN;

const protect = asyncHandler(async (req, res, next) => {
  if (!req.headers.authorization?.startsWith("Bearer")) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = await model.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    next();
  } catch (err) {
    console.error("[AuthMiddleware]", err.message);
    res.status(401);
    throw new Error("Not authorized, invalid token");
  }
});

module.exports = { protect };
