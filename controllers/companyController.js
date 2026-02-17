import Company from "../models/Company.js";
import bcrypt from "bcrypt";
import validator from "validator";
import generateToken from "../utils/generateToken.js";
import Job from "../models/Job.js";
import cloudinary from "../config/cloudinary.js";

// ===========================
// REGISTER COMPANY
// ===========================
const registerCompany = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const imageFile = req.file?.path; // Multer + Cloudinary path

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(409).json({ success: false, message: "Company already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const company = await Company.create({
      name,
      email,
      password: hashedPassword,
      image: imageFile || null,
    });

    const token = generateToken(company._id);

    return res.status(201).json({
      success: true,
      message: "Company registered successfully",
      token,
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },
    });
  } catch (error) {
    console.error("REGISTER COMPANY ERROR:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to register company" });
  }
};

// ===========================
// LOGIN COMPANY
// ===========================
const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const company = await Company.findOne({ email });
    if (!company) return res.status(401).json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid email or password" });

    const token = generateToken(company._id);

    return res.status(200).json({
      success: true,
      message: "Company logged in successfully",
      token,
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },
    });
  } catch (error) {
    console.error("LOGIN COMPANY ERROR:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to log in the company" });
  }
};

// ===========================
// GET COMPANY DATA
// ===========================
const companyData = async (req, res) => {
  try {
    const company = await Company.findById(req.company._id).select("-password");
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    return res.status(200).json({ success: true, data: company });
  } catch (error) {
    console.error("FETCH COMPANY ERROR:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch company" });
  }
};

// ===========================
// UPDATE COMPANY
// ===========================
const updateCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.company._id);
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    const { name, password } = req.body;
    const imageFile = req.file?.path;

    const updateData = {};
    if (name) updateData.name = name;
    if (password) {
      if (password.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Remove old image from Cloudinary if replaced
    if (imageFile && company.image?.includes("res.cloudinary.com")) {
      const publicId = getPublicIdFromUrl(company.image);
      await cloudinary.uploader.destroy(`companies/images/${publicId}`, { resource_type: "image" });
      updateData.image = imageFile;
    }

    const updatedCompany = await Company.findByIdAndUpdate(company._id, updateData, { new: true, runValidators: true }).select("-password");

    return res.status(200).json({ success: true, message: "Company updated successfully", data: updatedCompany });
  } catch (error) {
    console.error("UPDATE COMPANY ERROR:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update company" });
  }
};

// ===========================
// DELETE COMPANY
// ===========================
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.company._id);
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    // Delete company image from Cloudinary
    if (company.image?.includes("res.cloudinary.com")) {
      const publicId = getPublicIdFromUrl(company.image);
      await cloudinary.uploader.destroy(`companies/images/${publicId}`, { resource_type: "image" });
    }

    // Delete all jobs of the company
    await Job.deleteMany({ company: company._id });
    await Company.findByIdAndDelete(company._id);

    return res.status(200).json({ success: true, message: "Company deleted successfully" });
  } catch (error) {
    console.error("DELETE COMPANY ERROR:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to delete company" });
  }
};

// ===========================
// JOB CONTROLLERS
// ===========================
const postCompanyJob = async (req, res) => {
  try {
    const { title, description, location, category, level, salary, date } = req.body;
    if (!title || !description || !location || !category || !level || !salary || !date)
      return res.status(400).json({ success: false, message: "All fields are required" });

    const job = await Job.create({
      title,
      description,
      location,
      category,
      level,
      salary: Number(salary),
      date: new Date(date),
      company: req.company._id,
    });

    return res.status(201).json({ success: true, message: "Job created", job });
  } catch (error) {
    console.error("POST JOB ERROR:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create job" });
  }
};

const getCompanyPostedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ company: req.company._id });
    return res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    console.error("GET JOBS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch jobs" });
  }
};

const changeVisibility = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (job.company.toString() !== req.company._id.toString()) return res.status(403).json({ success: false, message: "Unauthorized access" });

    job.visible = !job.visible;
    await job.save();

    return res.status(200).json({ success: true, message: "Visibility changed", visible: job.visible });
  } catch (error) {
    console.error("CHANGE VISIBILITY ERROR:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to change visibility" });
  }
};

const deleteCompanyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (job.company.toString() !== req.company._id.toString()) return res.status(403).json({ success: false, message: "Unauthorized access" });

    await Job.findByIdAndDelete(job._id);
    return res.status(200).json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    console.error("DELETE JOB ERROR:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to delete job" });
  }
};

const updateCompanyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (job.company.toString() !== req.company._id.toString()) return res.status(403).json({ success: false, message: "Unauthorized action" });

    const { title, description, location, category, level, salary, date } = req.body;
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (location) updateData.location = location;
    if (category) updateData.category = category;
    if (level) updateData.level = level;
    if (salary) updateData.salary = Number(salary);
    if (date) updateData.date = new Date(date);

    const updatedJob = await Job.findByIdAndUpdate(job._id, updateData, { new: true, runValidators: true });
    return res.status(200).json({ success: true, message: "Job updated successfully", data: updatedJob });
  } catch (error) {
    console.error("UPDATE JOB ERROR:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update job" });
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
  registerCompany,
  loginCompany,
  companyData,
  updateCompany,
  deleteCompany,
  postCompanyJob,
  getCompanyPostedJobs,
  changeVisibility,
  deleteCompanyJob,
  updateCompanyJob,
};
