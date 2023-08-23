const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  accountType: {
    type: String,
    enum: ["Admin", "Student", "Instructor"],
    required: true,
  },
  additionalDetails: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Profile",
  },
  courses: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Courses",
    },
  ],
  image: {
    type: String,
    required: true,
  },
  token:{
    type: String,
  },
  resetPasswordExpires:{
    type:Date,
  },
  courseProgress: [
    {
      type: mongoose.Types.ObjectId,
      ref: "CourseProgress",
    }
  ],
});

module.exports = mongoose.model("User", userSchema);
