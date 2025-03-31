const express = require("express");
const staticRouter = require("./routes/staticRoute");
const mongoose = require("mongoose");
const app = express();
const PORT = 8000;
const path = require("path");
const userRoute = require("./routes/userRoute");
const blogRoute = require("./routes/blogRoute");
const cookieParser = require("cookie-parser");
const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");

mongoose
  .connect("mongodb://127.0.0.1:27017/blogify")
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.static(path.resolve("./public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use("/", staticRouter);
app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
