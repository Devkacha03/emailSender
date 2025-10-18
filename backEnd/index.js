import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import databaseConnection from "./database/db.js";
import userRoute from "./routes/userRoute.js";
import mail from "./routes/emailConfigRoute.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

databaseConnection();

app.get("/", (req, res) => {
  res.send("this is Testing route");
});

app.use("/api/users", userRoute);
app.use("/api", mail);

const { PORT, HOST } = process.env;

app.listen(5000, () => {
  console.log(`server is running on http://${HOST}:${PORT}`);
});
