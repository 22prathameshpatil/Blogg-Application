const { validateToken } = require("../services/auth");

async function checkStrictAuth(req, res, next) {
  const tokenCookieValue = req.cookies["token"];
  if (!tokenCookieValue) {
    return res.render("signin", { error: "You must sign in to view this page." });
  }

  try {
    const userPayload = await validateToken(tokenCookieValue);
    req.user = userPayload;
    next();
  } catch (error) {
    console.error("Strict Authentication Error:", error.message);
    return res.render("signin", { error: "Session expired, please log in again" });
  }
}

module.exports = { checkStrictAuth };
