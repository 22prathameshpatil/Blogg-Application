const { Router } = require("express");
const staticRouter = Router();
const BLOG = require('../models/blog');
const { checkStrictAuth } = require("../middlewares/strictAuthentication");

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

staticRouter.get("/newblog", checkStrictAuth, (req, res) => {
  res.render("addBlog", { user: req.user });
});


staticRouter.get("/forgetpassword", (req, res) => {
  res.render("forgetPassword");
});



module.exports = staticRouter;
