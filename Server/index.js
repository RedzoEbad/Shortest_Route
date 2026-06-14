const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRouter = require("./Routes/AuthRoutes");
const { protect } = require("./Middleware/AuthMiddleware");
const { connectDB } = require("./config/db");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

let server = null;

app.use(express.json());
app.use(cors());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRouter);

app.get("/api/protected", protect, (req, res) => {
  res.json({ message: "Protected route accessed", user: req.user });
});

app.use((err, req, res, next) => {
  console.error("[Server] Error:", err);
  const statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || "Internal server error",
  });
});

const shutdown = (signal) => {
  console.log(`[Server] ${signal} received — closing...`);
  if (server) {
    server.close(() => {
      mongoose.connection.close(false).finally(() => process.exit(0));
    });
  } else {
    process.exit(0);
  }
};

const startServer = async () => {
  await connectDB();

  server = app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `[Server] Port ${PORT} is already in use. Run: Get-NetTCPConnection -LocalPort ${PORT} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`
      );
    } else {
      console.error("[Server] Port error:", err.message);
    }
    process.exit(1);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
// Nodemon restart signal — release port before nodemon spawns a new process
process.once("SIGUSR2", () => {
  if (server) {
    server.close(() => process.kill(process.pid, "SIGUSR2"));
  }
});

if (require.main === module) {
  startServer();
} else {
  connectDB().catch((err) => {
    console.error("[Server] MongoDB connection error:", err.message);
  });
}

module.exports = app;
