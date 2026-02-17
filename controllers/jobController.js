import Job from "../models/Job.js";
import mongoose from "mongoose";


const fetchAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ visible: true })
      .sort({ createdAt: -1 })
      .populate("company", "name image");

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs"
    });
  }
};



const fetchJobById = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID"
      })
    }

    const job = await Job.findById(id).populate("company", "name email image")

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      })
    }

    res.status(200).json({
      success: true,
      data: job
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job"
    })
  }
}



export { fetchAllJobs, fetchJobById }