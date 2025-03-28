const USER = require("../models/user");
const crypto = require("crypto");
require("dotenv").config();
const { createTransport } = require("nodemailer");


async function handleUserLogin(req,res) {
    const {email,password} = req.body;
    const token = await USER.matchPasswordAndGenerateToken(email,password);
    if (!token) {
       return res.render('signin',{error:"Something went Wrong Check details Properly"});
    }
    return res.cookie('token',token).redirect('/');

}
async function handleUserSignUp(req, res) {
    try {
        const user = await USER.create({
            fullName: req.body.fullName,
            email: req.body.email,
            password: req.body.password,
        });
        return res.redirect('/signin');
    } catch (error) {
        console.log(error);
        return res.status(500).render('signup', { error: "User registration failed. Try again!" }); // ✅ Return response
    }
}


async function handleUserLogout(req, res) {
        res.clearCookie('token').redirect('/');
      
}


async function handleForgetPassword(req, res) {
    const { email } = req.body;
    const user = await USER.findOne({ email });

    if (!user) {
        return res.render('forgetPassword', { error: "User Not Found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; 
    await user.save();

    
    const transporter = createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD }
    });

    const resetLink = `http://localhost:8000/user/resetPassword/${resetToken}`;
    const mailOptions = {
        from: "prathameshpatil.22082001@gmail.com",
        to: email,
        subject: "Password Reset",
        html: `<p>Click the link to reset your password:</p>
               <a href="${resetLink}">${resetLink}</a>`
    };

    await transporter.sendMail(mailOptions);
    return res.render('forgetPassword', { message: "Reset link sent to your email." });
}

   async function handleResetPasswordForm(req, res) {
    const { token } = req.params;
    const user = await USER.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });

    if (!user) {
        return res.render("resetPassword", { error: "Invalid or expired token" });
    }

    return res.render("resetPassword", { token }); 
}


async function handleResetPassword(req, res) {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await USER.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });

    if (!user) {
        return res.render("resetPassword", { error: "Invalid or expired token" });
    }

    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();  

    return res.redirect("/signin");
}



module.exports = {
    handleUserLogin,
    handleUserSignUp,
    handleUserLogout,
    handleForgetPassword,
    handleResetPasswordForm,
    handleResetPassword,
}