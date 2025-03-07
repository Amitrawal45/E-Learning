import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.config.js";
import { clerkWebhooks } from "./controllers/webhooks.controller.js";

//Initialize Express
const app = express();

// Connect to Database
await connectDB();

// Middleware
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.send("Api Working....");
});
app.post('/clerk', express.json(),clerkWebhooks)

//Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
