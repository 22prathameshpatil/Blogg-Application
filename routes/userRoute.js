const {Router} = require('express');
const {handleUserAdmin,handleUserLogin,handleProfileView,handleUserSignUp,handleUserLogout,handleUserProfileEdit,handleForgetPassword ,handleResetPasswordForm,handleResetPassword,handleDeleteUSer} = require('../controllers/user');
const { adminAuthentication } = require('../middlewares/adminAuthentication');
const userRoute = Router();


userRoute.post('/signin',handleUserLogin);

userRoute.post('/signup',handleUserSignUp);

userRoute.get('/logout',handleUserLogout);

userRoute.get('/admin',adminAuthentication,handleUserAdmin);

userRoute.post('/admin/delete/:id',handleDeleteUSer);

userRoute.post('/forgetPassword',handleForgetPassword);

userRoute.get('/resetPassword/:token',handleResetPasswordForm);

userRoute.post("/resetPassword/:token", handleResetPassword);

userRoute.get('/userprofile',handleProfileView);

userRoute.post('/userprofile/edit',handleUserProfileEdit);

module.exports = userRoute;