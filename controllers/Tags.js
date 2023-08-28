const Tag = require("../models/Tags");

//create Tag handler function

exports.createTag = async (req, res) => {
  try {
    //fetch data
    const { name, description } = req.body;

    //validation
    if (!name || !description) {
      return res
        .status(404)
        .json({ success: false, message: "All fields are required" });
    }
    //create entry in db
    const tagDetails = await Tag.create({
      name: name,
      description: description,
    });
    console.log(tagDetails, "tagDetails");
    return res.status(200).json({
      success: true,
      message: "Tag Entry created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//getAllTags handler function

exports.showAlltags = async (req, res) => {
  try {
    //fetch data
    const allTags = await Tag.find({}, { name: true, description: true });
     return res
      .status(200)
      .json({
        success: true,
        message: "All tags returned successfully",
        allTags,
      });

    //create entry in db
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
