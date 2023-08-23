const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

//reset password token
exports.resetPasswordToken = async (req, res) => {
  //get email from req body
  try {
    const { email } = req.body;
    //check user for this email , email validation
    const user = await User.findOne({ email });
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }

    //generate token

    const token = crypto.randomUUID();
    //update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );
    //create url
    const url = `http://localhost:3000/update-password/${token}`;
    //send mail containg time
    await mailSender(email, "Password rest link", `Password Reset link:${url}`);
    //return response
    return res.status(200).json({
      success: true,
      message:
        "Email sent successfully and Password reset instructions sent to your email.",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while processing your request." });
  }
};

//resetpassword

exports.resetpassword = async (req, res) => {
  //data fetch
  //validation
  //get user details from db using token
  //if no entry invalid token
  //token time check
  //has password
  //update password
  //return response

  //data fetch
  try {
    const { password, confirmPassword, token } = req.body;

    if (password !== confirmPassword) {
      return res.json({
        success: true,
        message: "Password not matching",
      });
    }
    const userDetails = await User.findOne({ token: token });
    if (!userDetails) {
      return res.json({ success: false, message: "Token is invalid" });
    }
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.json({
        success: false,
        message: "Token is expired, Please generate your token",
      });
    }

    const hasPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      { token: token },
      { password: hasPassword },
      { new: true }
    );
    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while processing your request." });
  }
};
