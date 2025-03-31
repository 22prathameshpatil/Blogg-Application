const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const { createToken } = require("../services/auth");

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageURL: {
      type: String,
      default: "/images/default.png",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    resetToken: { type: String, default: null },

    resetTokenExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  const salt = randomBytes(16).toString("hex");
  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  user.salt = salt;
  user.password = hashedPassword;

  next();
});

userSchema.static(
  "matchPasswordAndGenerateToken",
  async function (email, password) {
    const user = await this.findOne({ email }).lean();
    if (!user) return false;

    const salt = user.salt;
    const hashedPassword = user.password;

    const originalPassword = createHmac("sha256", salt)
      .update(password)
      .digest("hex");

    if (hashedPassword === originalPassword) {
      const token = createToken({
        ...user,
        password: undefined,
        salt: undefined,
      });
      return token;
    } else {
      return null;
    }
  }
);

userSchema.virtual("blogs", {
  ref: "blog",
  localField: "_id",
  foreignField: "createdBy",
});

const USER = model("user", userSchema);

module.exports = USER;
