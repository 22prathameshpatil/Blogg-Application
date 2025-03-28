const { validateToken } = require("../services/auth");

function checkForAuthenticationCookie(cookieName) {
  return async (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
      return next();
    }

    try {
      const userPayLoad = await validateToken(tokenCookieValue); 
      req.user = userPayLoad;
    } catch (error) {
      console.error("Token validation failed:", error.message);
    }
    
    next(); 
  };
}

module.exports = {
  checkForAuthenticationCookie,
};
