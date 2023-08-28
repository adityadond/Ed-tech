const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
  try {
    //data fetch
    const { sectionName, courseId } = req.body;
    //data validation
    if (!sectionName || !courseId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing property" });
    }
    //create section

    const newSection = await Section.create({
      sectionName: sectionName,
      courseId: courseId,
    });
    //update course with section objectID
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    );
    return res
    .status(200)
    .json({
      success: true,
      message: "Section created successfully",
      updatedCourse
    });
    //return sucess response
  } catch (error) 
  {
    return res.status(500).json({
        success: false,
        message: "Unable to create section. Please try again",
        error: error.message 
      });
  }
};

