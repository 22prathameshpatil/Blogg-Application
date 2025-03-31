const BLOG = require("../models/blog");
const mongoose = require("mongoose");
const COMMENT = require("../models/comment");
const USER = require("../models/user");
const fs = require("fs");
const path = require("path");

async function handleAddBlog(req, res) {
  try {
    const blog = await BLOG.create({
      title: req.body.title,
      body: req.body.body,
      createdBy: req.user._id,
      coverImageUrl: `uploads/${req.file.filename}`,
    });

    return res.redirect(`/blog/${blog._id}`);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error creating blog");
  }
}

async function handleBlogView(req, res) {
  try {
    const blogId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).send("Invalid blog ID");
    }

    const blog = await BLOG.findById(blogId).populate("createdBy");
    const comment = await COMMENT.find({ blogId }).populate("createdBy");
    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    res.render("blog", { blog, user: req.user, comments: comment });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching blog");
  }
}

async function handleBlogComment(req, res) {
  try {
    const result = await COMMENT.create({
      content: req.body.content,
      blogId: req.params.blogId,
      createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error creating comment");
  }
}

async function handleDeleteBlog(req, res) {
  try {
    const blogId = req.params.id;

    const blog = await BLOG.findById(blogId);
    if (!blog) {
      return res.status(404).render("userProfile", { error: "Blog not found" });
    }

    if (blog.coverImageUrl) {
      const imagePath = path.join(
        __dirname,
        "..",
        "public",
        blog.coverImageUrl
      );
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting image:", err);
      });
    }

    await BLOG.findByIdAndDelete(blogId);
    await COMMENT.deleteMany({ blogId });

    res.redirect("/user/userprofile");
  } catch (error) {
    console.log(error);
    res.status(500).render("userProfile", { error: "Error deleting blog" });
  }
}

const handleDeleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Delete the comment
    await COMMENT.findByIdAndDelete(commentId);

    const user = await USER.findById(req.user._id); 
    if (!user) return res.status(404).send("User not found");

    const blogs = await BLOG.find({ createdBy: user._id });
    const comments = await COMMENT.find({ createdBy: user._id }).populate("blogId");

    if (req.headers.referer && req.headers.referer.includes('/user/admin')) {
      return res.redirect('/user/admin');  
  }
    res.render("userProfile", { user, blogs, comments });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

module.exports = {
  handleAddBlog,
  handleBlogView,
  handleBlogComment,
  handleDeleteBlog,
  handleDeleteComment,
};
