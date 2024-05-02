const express = require("express");
const cors = require("cors");
// requiring env File:
const dotenv = require("dotenv");
dotenv.config("./.env");
// cloudinary
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Requiring Cookie-Parser
const cookieParser = require("cookie-parser");
// Require the dbConnect
const dbConnect = require("./dbConnect");
const app = express();
// Requiring the Routers
const authRouter = require("./routers/authRouter");
const postsRouter = require("./routers/postsRouter");
const userRouter = require("./routers/userRouter");

// Morgan
const morgan = require("morgan");
// TO CONNECT THE dbConnect.js
dbConnect();
// SERVER
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Listening to Port ${PORT}`);
});
// Middlewares
app.use(express.json({ limit: "10mb" })); //Parse Body Means parse Reqeust Like Post/delete/put Request
app.use(morgan("common")); //Tell us about which request is hitted by client is shown in the Terminal---it Helps us in debugging.
app.use(cookieParser());
// Cors is Basically used to Connect Frontend to BAckend providing the Frontend URL
//It should be used before Our Router's
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);
// Use Router Code
app.use("/auth", authRouter);
app.use("/posts", postsRouter);
app.use("/user", userRouter);

// Check
app.get("/", (req, res) => {
  res.status(200).send("Successfully!");
});
