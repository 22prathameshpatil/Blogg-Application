const JWT = require('jsonwebtoken');
const secret = "prathamesh";

async function createToken(user) {
    const payload= {
        _id : user._id,
        email: user.email,
        profileImageURL:user.profileImageURL,
        role:user.role,
    }
    const token = JWT.sign(payload,secret);
    return token;
}
async function validateToken(token) {
    const payload = JWT.verify(token,secret);
    return payload;
}

module.exports = {
    createToken,
    validateToken,
}