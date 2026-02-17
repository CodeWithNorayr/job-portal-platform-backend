import express from "express";
import protectUser from "../middlewares/userMiddleware.js";
import upload from "../config/multer.js";
import {
  registerUser,
  loginUser,
  findUserById,
  updateUser,
  deleteUser,
  applyForJob,
  getUserJobApplications,
} from "../controllers/userController.js";

const userRouter = express.Router();

// REGISTER
userRouter.post(
  "/userRegistration",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  registerUser
);

// LOGIN
userRouter.post("/userLogin", loginUser);

// GET PROFILE
userRouter.get("/userid", protectUser, findUserById);

// UPDATE USER (image + resume)
userRouter.post(
  "/userUpdate",
  protectUser,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  updateUser
);

// DELETE USER
userRouter.delete("/userDelete/:id", protectUser, deleteUser);

// APPLY JOB
userRouter.post("/apply-job", protectUser, applyForJob);

// GET USER APPLICATIONS
userRouter.get("/user-applications", protectUser, getUserJobApplications);

export default userRouter;
