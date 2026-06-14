const mongoose = require("mongoose");

const getMongoUri = () => process.env.MONGODB_URI || process.env.mongodb;

const connectDB = async () => {
  const uri = getMongoUri();
  if (!uri) {
    console.error("[Server] Missing MONGODB_URI in Server/.env");
    return false;
  }

  mongoose.set("bufferCommands", false);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[Server] MongoDB connected (${mongoose.connection.name})`);
    return true;
  } catch (err) {
    console.error("[Server] MongoDB connection failed:", err.message);
    console.error(
      "[Server] Check Atlas: correct password, database user, and IP whitelist (Network Access)."
    );
    return false;
  }
};

const isDbConnected = () => mongoose.connection.readyState === 1;

const ensureDb = (req, res, next) => {
  if (isDbConnected()) {
    return next();
  }

  return res.status(503).json({
    message:
      "Database is not connected. Check Server/.env MONGODB_URI and MongoDB Atlas network access.",
  });
};

module.exports = { connectDB, ensureDb, isDbConnected };
