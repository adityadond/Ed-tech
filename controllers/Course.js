const Course = require("../models/Course");
const Tag = require("../models/Tag");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/uploadImageToCloudinary");

//create Cousre handler function

exports.createCourse = async (req, res) => {
  try {
    //fetch data

    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body;

    //get thumbnail
    const thumbnail = req.files.thumbnailImage;

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail
    ) {
      return res
        .status(404)
        .json({ message: "All fields are required", sucess: false });
    }

    //check for instructor
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log(instructorDetails, "instructorDetails");
// verify user ids


    if (!instructorDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Instructor Details not found" });
    }
    //check given tag is valid or not
    const tagDetails = await Tag.findById(tag);
    if (!tagDetails) {
      return res
        .status(404)
        .json({ success: false, message: "tagDetails Details not found" });
    }
    //upload image to cloudinary server
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    //create an entry for new tcourse

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatyouwilllearn: whatyouwilllearn,
      price,
      tag: tagDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });

    //add the new course entry to user schema of Instructor

    await User.findByIdAndUpdate(
      {
        _id: instructorDetails._id,
      },
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });

   

}
catch(error) {
    console.error(error);
    return res.status(500).json({
        success:false,
        message:'Failed to create Course',
        error: error.message,
    })
}
};





//getAllCourses handler function

exports.showAllCourses = async (req, res) => {
try {
        //TODO: change the below statement incrementally
        const allCourses = await Course.find({});

        return res.status(200).json({
            success:true,
            message:'Data for all courses fetched successfully',
            data:allCourses,
        })

}
catch(error) {
    console.log(error);
    return res.status(500).json({
        success:false,
        message:'Cannot Fetch course data',
        error:error.message,
    })
}
}

