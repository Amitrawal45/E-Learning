import CourseModel from "../models/course.model.js";
import PurchaseModel from "../models/purchase.model.js";
import UserModel from "../models/users.model.js";
import Stripe from "stripe";

//Get User Data
export const getUserData = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// User Enrolled courses with lecture link.
export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const userData = await UserModel.findById(userId).populate(
      "enrolledCourses"
    );
    res.json({
      success: true,
      enrolledCourses: userData.enrolledCourses,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//Purchase Course
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const userId = req.auth.userId;
    const userData = await UserModel.findById(userId);
    const courseData = await CourseModel.findById(courseId);

    if (!userData || !courseData) {
      return res.status(404).json({ message: "Data not found" });
    }

    const purchaseData = {
      courseId: courseData._id,
      userId,
      amount: (
        courseData.coursePrice -
        (courseData.discount * courseData.coursePrice) / 100
      ).toFixed(2),
    };

    const newPurchase = await PurchaseModel.create(purchaseData);

    //Stripe Gateway Initialize
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = process.env.CURRENCY ? process.env.CURRENCY.toLowerCase() : "usd";

    //Cresting line items for stripe

    const line_items = [
      {
        price_data: {
          currency,
          product_data: {
            name: courseData.courseTitle,
          },
          unit_amount: Math.floor(newPurchase.amount) * 100,
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}/`,
      line_items: line_items,
      mode: "payment",
      metadata: {
        purchaseId: newPurchase._id.toString(),
      },
    });
    res.json({
      success: true,
      sessionUrl: session.url,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
