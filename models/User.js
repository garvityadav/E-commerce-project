const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    maxLength: 50,
    trim: true,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    unique: true,
    maxLength: 255,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: "Please provide email",
    },
    required: [true, "Email is required"],
  },
  password: {
    type: String,
    minLength: 8,
    trim: true,
    required: [true, "Password is required"],
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("user", UserSchema);
