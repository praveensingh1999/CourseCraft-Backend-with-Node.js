import Category from "../models/Category.js"

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

// ================= CREATE CATEGORY =================
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    const categoryDetails = await Category.create({
      name,
      description,
    })

    return res.status(200).json({
      success: true,
      message: "Category created successfully",
      data: categoryDetails,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ================= SHOW ALL CATEGORIES =================
export const showAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find({})
    return res.status(200).json({
      success: true,
      data: allCategories,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ================= CATEGORY PAGE DETAILS =================
export const categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;
    //console.log("PRINTING CATEGORY ID:", categoryId);

    // Selected category
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        // populate: "ratingAndReviews",
      })
      .exec();

    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (selectedCategory.courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category",
      });
    }

    // Other categories
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    });

    let differentCategory = null;

    if (categoriesExceptSelected.length > 0) {
      const randomCategory =
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)];

      differentCategory = await Category.findById(randomCategory._id)
        .populate({
          path: "courses",
          match: { status: "Published" },
        })
        .exec();
    }

    // Top selling courses
    const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: { path: "instructor" },
      })
      .exec();

    const allCourses = allCategories.flatMap(
      (category) => category.courses
    );

    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}