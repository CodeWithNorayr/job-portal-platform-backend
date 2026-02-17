import JobApplication from "../models/JobApplication.js";

const getJobApplications = async (req, res) => {
  try {

    const companyId = req.company._id

    // Find all applications for this user
    const applications = await JobApplication.find({ companyId })
      .populate("userId")
      .populate("jobId")      // optional: populate job details
      .populate("companyId"); // optional: populate company details

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No applications found"
      });
    }

    return res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications"
    });
  }
};

export default getJobApplications;