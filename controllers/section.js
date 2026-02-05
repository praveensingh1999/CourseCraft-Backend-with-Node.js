import Section from "../models/Section.js"
import Course from "../models/Course.js"
import SubSection from "../models/SubSection.js"

// ================================
// CREATE Section
// ================================
export const createSection = async (req, res) => {
  try {
    //fetch data section name and courseid from req body
    const { sectionName, courseId } = req.body
// data validate
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing required properties",
      })
    }

    // Create section
    const newSection = await Section.create({ sectionName })

    // Add section to course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()
// return response
    return res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourse,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// ================================
// UPDATE Section
// ================================
export const updateSection = async (req, res) => {
  try {
    // fetch data
    const { sectionName, sectionId, courseId } = req.body
  // update data
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    )
//populate coursecontent and subsection
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()
// return response
    return res.status(200).json({
      success: true,
      message: section,
      data: course,
    })
  } catch (error) {
    console.error("Error updating section:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

// ================================
// DELETE Section
// ================================
export const deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.body

    // Remove section reference from course
    await Course.findByIdAndUpdate(courseId, {
      $pull: {
        courseContent: sectionId,
      },
    })

    const section = await Section.findById(sectionId)
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      })
    }

    // Delete all subsections of this section
    await SubSection.deleteMany({
      _id: { $in: section.subSection },
    })

    // Delete section
    await Section.findByIdAndDelete(sectionId)

    // Return updated course
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      data: course,
    })
  } catch (error) {
    console.error("Error deleting section:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}
