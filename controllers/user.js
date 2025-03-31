const USER = require("../models/user");
const crypto = require("crypto");
require("dotenv").config();
const { createTransport } = require("nodemailer");
const BLOG = require("../models/blog");
const COMMENT = require("../models/comment");

async function handleUserLogin(req, res) {
  const { email, password } = req.body;
  const token = await USER.matchPasswordAndGenerateToken(email, password);
  if (!token) {
    return res.render("signin", {
      error: "Something went Wrong Check details Properly",
    });
  }
  return res.cookie("token", token).redirect("/");
}
async function handleUserSignUp(req, res) {
  try {
    const user = await USER.create({
      fullName: req.body.fullName,
      email: req.body.email,
      password: req.body.password,
    });
    return res.redirect("/signin");
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .render("signup", { error: "User registration failed. Try again!" }); // ✅ Return response
  }
}

async function handleUserLogout(req, res) {
  res.clearCookie("token").redirect("/");
}

async function handleForgetPassword(req, res) {
  const { email } = req.body;
  const user = await USER.findOne({ email });

  if (!user) {
    return res.render("forgetPassword", { error: "User Not Found" });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetToken = resetToken;
  user.resetTokenExpiry = Date.now() + 3600000;
  await user.save();

  const transporter = createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
  });

  const resetLink = `http://localhost:8000/user/resetPassword/${resetToken}`;
  const mailOptions = {
    from: "prathameshpatil.22082001@gmail.com",
    to: email,
    subject: "Password Reset",
    html: `<p>Click the link to reset your password:</p>
               <a href="${resetLink}">${resetLink}</a>`,
  };

  await transporter.sendMail(mailOptions);
  return res.render("forgetPassword", {
    message: "Reset link sent to your email.",
  });
}

async function handleResetPasswordForm(req, res) {
  const { token } = req.params;
  const user = await USER.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.render("resetPassword", { error: "Invalid or expired token" });
  }

  return res.render("resetPassword", { token });
}

async function handleResetPassword(req, res) {
  const { token } = req.params;
  const { newPassword } = req.body;

  const user = await USER.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.render("resetPassword", { error: "Invalid or expired token" });
  }

  user.password = newPassword;
  user.resetToken = null;
  user.resetTokenExpiry = null;

  await user.save();

  return res.redirect("/signin");
}

async function handleProfileView(req, res) {
  try {
    const userId = req.user._id;

    const user = await USER.findById(userId).select(
      "-password,-salt,-resetToken,-resetTokenExpiry"
    );

    if (!user) {
      return res.status(404).render("profile", { error: "User not found" });
    }

    const blogs = await BLOG.find({ createdBy: userId });

    const comments = await COMMENT.find({ createdBy: userId }).populate(
      "blogId"
    );

    return res.render("userProfile", { user, blogs, comments });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .render("userProfile", { error: "Error fetching profile data" });
  }
}

async function handleUserProfileEdit(req, res) {
  try {
    const { fullName, email } = req.body;
    const userId = req.user._id;

    const user = await USER.findByIdAndUpdate(
      userId,
      { fullName, email },
      { new: true }
    );
    if (!user) {
      return res.status(404).render("profile", { error: "User not found" });
    }

    res.redirect("/user/userprofile");
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .render("userProfile", { error: "Error fetching profile data" });
  }
}
async function handleUserAdmin(req, res) {
  try {
    const users = await USER.find().populate({
      path: "blogs",
      populate: { path: "comments" }, // Populate comments inside blogs
    });

    res.render("admin", { users, user: req.user });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error loading admin panel");
  }
}

async function handleDeleteUSer(req, res) {
  try {
    const userId = req.params.id;
    const users = await USER.find().populate({
      path: "blogs",
      populate: { path: "comments" }, // Populate comments inside blogs
    });

    // ✅ First, fetch the user before using it
    const user = await USER.findById(userId);
    if (!user) {
      return res.status(404).render("admin", { error: "User not found", users });
    }

    // ✅ Check user role before deletion
    if (user.role === "ADMIN") {
      return res.render("admin", { error: "Admin cannot be deleted as a user", users });
    }

    // ✅ Delete related blogs and comments first
    await BLOG.deleteMany({ createdBy: userId });
    await COMMENT.deleteMany({ createdBy: userId });

    // ✅ Now delete the user
    await USER.findByIdAndDelete(userId);


    // ✅ Render the admin panel with updated data
    res.render("admin", { users, user: req.user });
  } catch (error) {
    console.log(error);
    res.status(500).render("admin", { error: "Error deleting user", users: await USER.find() });
  }
}

module.exports = {
  handleUserLogin,
  handleUserSignUp,
  handleUserLogout,
  handleForgetPassword,
  handleResetPasswordForm,
  handleResetPassword,
  handleProfileView,
  handleUserProfileEdit,
  handleUserAdmin,
  handleDeleteUSer,
};
