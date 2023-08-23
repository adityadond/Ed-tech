const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//send otp

exports.sendOTP = async (req, res) => {
  try {
    //fetch email from req body
    const { email } = req.body;

    //check if user already exists
    const checkUserPresent = await User.findOne({ email });

    //if user already exists, then return a response
    if (checkUserPresent) {
      return res.status(401).json({
        success: true,
        message: "User already registered",
      });
    }
    //generate OTP
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP generated", otp);
    //check unique otp or not
    const result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }
    const otpPayload = { email, otp };

    //create an entry for otp
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody, "otpBody");

    //return response
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//signup
exports.signup = async (req, res) => {
  // data fetch from req body
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;
    //validate data

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    //2 password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and confirm password does not match. Please try again",
      });
    }

    //check user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // find most recent otp for user
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOtp, "recentOtp");
    //validate OTP
    if (recentOtp.length == 0) {
      return res.status(400).json({
        success: false,
        message: "OTP found",
      });
    } else if (otp !== recentOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }
    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //entry create in DB
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      contactNumber,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    // return respose
    return res.status(200).json({
      success: true,
      message: "User is registered successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};

//login

exports.login = async (req, res) => {
  try {
    //get data from req body
    const { email, password } = req.body;
    //vadition of data
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required. please try again",
      });
    }

    // user check whether it exists or not
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "USer is not registered, Please sign up first",
      });
    }

    //generate jwt token after password matching
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        role: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;

      //create cookie and send response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      response.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged in successfully",
      });
    } else {
      return response.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }
  } catch (error) {
    console.error(error);
    console.log(error);
    return response.status(500).json({
      success: false,
      message: "Login failed, please try again",
    });
  }
};

//change password
exports.changePassword = async (req, res) => {
  //get datta from req body
  //get oldpass,new pass and confirm pass
  //validation
  //validate pwd in db
  //
  //send mail password change
  //return response
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirm password do not match.' });
    }

    // Fetch user from the database
    const user = await User.findById(req.user.id); // Assuming you have user authentication middleware

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Validate old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Old password is incorrect.' });
    }

    // Hash and update the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 is the salt rounds
    user.password = hashedPassword;
    await user.save();

    // Send email notification for password change
    await sendPasswordChangeEmail(user.email);

    return res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while processing your request.' });
  }

};
