import User from "../models/User.js";
import bcrypt from "bcrypt";
import validator from "validator";
import generateToken from "../utils/generateToken.js";
import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";
import cloudinary from "../config/cloudinary.js";

// ===========================
// REGISTER USER
// ===========================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const imageFile = req.files?.image?.[0]?.path;
    const resumeFile = req.files?.resume?.[0]?.path;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });

    if (!validator.isEmail(email))
      return res.status(400).json({ success: false, message: "Invalid email" });

    if (password.length < 8)
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(409).json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      image: imageFile || null,
      resume: resumeFile || null,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        resume: user.resume,
      },
    });
  } catch (error) {
    console.error("REGISTER USER ERROR:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to register user" });
  }
};

// ===========================
// LOGIN USER
// ===========================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        resume: user.resume,
      },
    });
  } catch (error) {
    console.error("LOGIN USER ERROR:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to login user" });
  }
};

// ===========================
// GET USER PROFILE
// ===========================
const findUserById = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("FETCH USER ERROR:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch user" });
  }
};

// ===========================
// UPDATE USER
// ===========================
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { name, password } = req.body;
    const imageFile = req.files?.image?.[0]?.path;
    const resumeFile = req.files?.resume?.[0]?.path;

    const updateData = {};
    if (name) updateData.name = name;
    if (password) {
      if (password.length < 8)
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Remove old image from Cloudinary
    if (imageFile && user.image?.includes("res.cloudinary.com")) {
      const publicId = getPublicIdFromUrl(user.image);
      await cloudinary.uploader.destroy(`users/images/${publicId}`, { resource_type: "image" });
      updateData.image = imageFile;
    }

    // Remove old resume from Cloudinary
    if (resumeFile && user.resume?.includes("res.cloudinary.com")) {
      const publicId = getPublicIdFromUrl(user.resume);
      await cloudinary.uploader.destroy(`users/resumes/${publicId}`, { resource_type: "raw" });
      updateData.resume = resumeFile;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true }).select("-password");

    res.status(200).json({ success: true, message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to update user" });
  }
};

// ===========================
// DELETE USER
// ===========================
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.image?.includes("res.cloudinary.com")) {
      const publicId = getPublicIdFromUrl(user.image);
      await cloudinary.uploader.destroy(`users/images/${publicId}`, { resource_type: "image" });
    }

    if (user.resume?.includes("res.cloudinary.com")) {
      const publicId = getPublicIdFromUrl(user.resume);
      await cloudinary.uploader.destroy(`users/resumes/${publicId}`, { resource_type: "raw" });
    }

    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to delete user" });
  }
};

// ===========================
// APPLY FOR JOB
// ===========================
const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ success: false, message: "Job ID is required" });

    const alreadyApplied = await JobApplication.findOne({ userId: req.user._id, jobId });
    if (alreadyApplied) return res.status(409).json({ success: false, message: "Already applied for this job" });

    const jobData = await Job.findById(jobId);
    if (!jobData) return res.status(404).json({ success: false, message: "Job not found" });

    await JobApplication.create({
      userId: req.user._id,
      jobId,
      companyId: jobData.company,
    });

    res.status(201).json({ success: true, message: "Applied successfully" });
  } catch (error) {
    console.error("APPLY JOB ERROR:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to apply" });
  }
};

// ===========================
// GET USER JOB APPLICATIONS
// ===========================
const getUserJobApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ userId: req.user._id })
      .populate("jobId")
      .populate("companyId")
      .populate("userId", "-password");

    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error("FETCH APPLICATIONS ERROR:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch applications" });
  }
};

// ===========================
// HELPER: extract public ID from Cloudinary URL
// ===========================
const getPublicIdFromUrl = (url) => {
  const parts = url.split("/");
  const folder = parts.slice(-2, -1)[0];
  const filename = parts.pop().split(".")[0];
  return `${folder}/${filename}`;
};

export {
  registerUser,
  loginUser,
  findUserById,
  updateUser,
  deleteUser,
  applyForJob,
  getUserJobApplications,
};
