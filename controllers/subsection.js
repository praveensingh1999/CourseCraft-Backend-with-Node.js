// Import necessary modules (ES6)
import Section from "../models/Section.js"
import SubSection from "../models/SubSection.js"
import { uploadImageToCloudinary } from "../utils/imageUploader.js"

// ================================
// CREATE SubSection
// ================================
export const createSubSection = async (req, res) => {
  try {
    const { sectionId, title, description } = req.body
    const video = req.files?.video

    // Validate input
    if (!sectionId || !title || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    // Upload video to Cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    )
    //console.log(uploadDetails);

    // Create SubSection
    const subSectionDetails = await SubSection.create({
      title,
      timeDuration: `${uploadDetails.duration}`,
      description,
      videoUrl: uploadDetails.secure_url,
    })

    // Update Section with SubSection
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      {
        $push: { subSection: subSectionDetails._id },
      },
      { new: true }
    ).populate("subSection")

    return res.status(200).json({
      success: true,
      data: updatedSection,
    })
  } catch (error) {
    console.error("Error creating new sub-section:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// ================================
// UPDATE SubSection
// ================================
export const updateSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId, title, description } = req.body

    const subSection = await SubSection.findById(subSectionId)
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      })
    }

    if (title !== undefined) subSection.title = title
    if (description !== undefined) subSection.description = description

    if (req.files?.video) {
      const uploadDetails = await uploadImageToCloudinary(
        req.files.video,
        process.env.FOLDER_NAME
      )
      subSection.videoUrl = uploadDetails.secure_url
      subSection.timeDuration = `${uploadDetails.duration}`
    }

    await subSection.save()

    // Fetch updated section
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    return res.status(200).json({
      success: true,
      message: "SubSection updated successfully",
      data: updatedSection,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the SubSection",
    })
  }
}

// ================================
// DELETE SubSection
// ================================
export const deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body

    // Remove SubSection reference from Section
    await Section.findByIdAndUpdate(sectionId, {
      $pull: { subSection: subSectionId },
    })

    const subSection = await SubSection.findByIdAndDelete(subSectionId)
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      })
    }

    // Fetch updated section
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    return res.status(200).json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    })
  }
}
