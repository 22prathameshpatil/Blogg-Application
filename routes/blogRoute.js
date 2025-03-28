const { Router } = require("express");
const { handleAddBlog,handleBlogView,handleBlogComment } = require("../controllers/blog");
const multer = require('multer');
const path = require('path');
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


blogRoute.post("/", upload.single('converImageUrl') , handleAddBlog);

blogRoute.get("/:id", handleBlogView);

blogRoute.post("/comment/:blogId", handleBlogComment);

module.exports = blogRoute;
