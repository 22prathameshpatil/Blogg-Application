const {Router} = require('express');
const {handleUserLogin,handleUserSignUp,handleUserLogout,handleForgetPassword ,handleResetPasswordForm,handleResetPassword} = require('../controllers/user');
const userRoute = Router();

userRoute.post('/signin',handleUserLogin);

userRoute.post('/signup',handleUserSignUp);

userRoute.get('/logout',handleUserLogout);

userRoute.post('/forgetPassword',handleForgetPassword);

userRoute.get('/resetPassword/:token',handleResetPasswordForm);

userRoute.post("/resetPassword/:token", handleResetPassword);

module.exports = userRoute;