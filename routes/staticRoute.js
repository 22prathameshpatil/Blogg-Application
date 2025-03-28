const { Router } = require("express");
const staticRouter = Router();
const BLOG = require('../models/blog');

staticRouter.get("/", async (req, res) => {
  const allBlogs = await BLOG.find({});
  res.render("home", { user: req.user ,blogs:allBlogs});
});

staticRouter.get("/signin", (req, res) => {
  res.render("signin");
});

staticRouter.get("/signup", (req, res) => {
  res.render("signup");
});

staticRouter.get("/newblog", (req, res) => {
  res.render("addBlog");
});

staticRouter.get("/forgetpassword", (req, res) => {
  res.render("forgetPassword");
});

module.exports = staticRouter;
