import { clerkClient } from "@clerk/express";
// Middleware (Protect Educator Routes)

const protectEducator = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const response = await clerkClient.users.getUser(userId);
    if (response.publicMetadata.role !== "educator") {
      return res
        .status(403)
        .json({ message: "Forbidden. You are not an educator." });
    }
    next();
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export default protectEducator;
