const BLOG = require("../models/blog");
const mongoose = require("mongoose");
const COMMENT = require("../models/comment");

async function handleAddBlog(req, res) {
    try {
        const blog = await BLOG.create({
            title: req.body.title,
            body: req.body.body,
            createdBy: req.user._id,
            converImageUrl: `uploads/${req.file.filename}`,
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

        res.render("blog", { blog, user: req.user ,comments:comment});
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



module.exports = {
    handleAddBlog,
    handleBlogView,
    handleBlogComment,
};
