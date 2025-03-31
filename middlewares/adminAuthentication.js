const { validateToken } = require("../services/auth");

async function adminAuthentication(req, res, next) {
  const tokenCookieValue = req.cookies["token"];
  if (!tokenCookieValue) {
    return res.render("signin", { error: "You must sign in to view this page." });
  }

  try {
    const userPayload = await validateToken(tokenCookieValue);
    req.user = userPayload;
    if (userPayload.role !== "ADMIN") {
      return res.render("signin", { error: "You must be an admin to view this page." });
    }
    next();
  } catch (error) {
    console.error("Strict Authentication Error:", error.message);
    return res.render("signin", { error: "Session expired, please log in again" });
  }
}

module.exports = { adminAuthentication };
