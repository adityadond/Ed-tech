const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");

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
      message: "Password and confirm password does not match. Please try again",
    });
  }

  //check user already exists
  const existingUser = await User.findOne({email})
  if(existingUser){
    return res.status(400).json({
        success: false,
        message: "User already exists"
    })


}

  // find most recent otp for user
  const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1)
console.log(recentOtp,"recentOtp")
  //validate OTP
if(recentOtp.length==0){
    return res.status(400).json({
        success:false,
        message:"OTP found"})
}else if(otp!==recentOtp){
    return res.status(400).json({
        success:false,
        message:"Invalid OTP"
    })
}
  //hash passowrd

  //entry create in DB

  // return respose
};

//login

//change password
