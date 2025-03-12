import { Webhook } from "svix";
import UserModel from "../models/users.model.js";
import Stripe from "stripe";
import PurchaseModel from "../models/purchase.model.js";
import CourseModel from "../models/course.model.js";

// Api controller function to manage Clerk User with databas
export const clerkWebhooks = async (req, res) => {
  try {
    const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    await webhook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });
    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await UserModel.create(userData);
        res.json({});
        break;
      }
      case "user.updated": {
        const userData = {
          email: data.email_address[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await UserModel.findByIdAndUpdate(data.id, userData);
        res.json({});
        break;
      }
      case "user.deleted": {
        await UserModel.findByIdAndDelete(data.id);
        res.json({});
        break;
      }

      default:
        break;
    }
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

const stripeInsctance = new Stripe(process.env.STRIPE_SECRET_KEY);
export const stripeWebhooks = async (request, response) => {
  const sig = request.headers["stripe-signature"];
  let event;
  try {
    event = Stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET_KEY
    );
  } catch (error) {
    response.status(400).send(`Webhook Error:${error.message}`);
  }

  //Handle the event
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      const session = await stripeInsctance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { purchaseId } = session.data[0].metadata;
      const purchaseData = await PurchaseModel.findById(purchaseId);
      const userData = await UserModel.findById(purchaseData.userId);
      const courseData = await CourseModel.findById(
        purchaseData.courseId.toString()
      );

      courseData.enrolledStudents.push(userData);
      await courseData.save();

      userData.enrolledCourses.push(courseData._id);
      await userData.save();

      purchaseData.status = "completed";
      await purchaseData.save();

      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      const session = await stripeInsctance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { purchaseId } = session.data[0].metadata;
      const purchaseData = await PurchaseModel.findById(purchaseId);
      purchaseData.status = "failed";
      await purchaseData.save();

      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  response.json({
    received: true,
  });
};
