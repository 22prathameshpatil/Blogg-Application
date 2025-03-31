const { Router } = require("express");
const { handleAddBlog,handleBlogView,handleBlogComment,handleDeleteBlog,handleDeleteComment } = require("../controllers/blog");
const multer = require('multer');
const path = require('path');
const BLOG = require("../models/blog");
const COMMENT = require("../models/comment");
const { checkStrictAuth } = require("../middlewares/strictAuthentication");
const blogRoute = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve('./public/uploads/'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }   
});

const upload = multer({ storage: storage });    


blogRoute.post("/", upload.single('coverImageUrl') , handleAddBlog);

blogRoute.get("/:id",checkStrictAuth, handleBlogView);

blogRoute.post("/comment/:blogId", handleBlogComment);

blogRoute.post("/delete/:id", handleDeleteBlog);

blogRoute.post("/comment/delete/:commentId", handleDeleteComment);



module.exports = blogRoute;
    