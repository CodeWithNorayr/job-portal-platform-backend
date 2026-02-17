import mongoose from "mongoose"

const jobApplicationSchema = new mongoose.Schema({
  userId:{type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},
  companyId:{type:mongoose.Schema.Types.ObjectId,ref:"Company",required:true},
  jobId:{type:mongoose.Schema.Types.ObjectId,ref:"Job",required:true},
},{timestamps:true})

const JobApplication = mongoose.models.JobApplication || mongoose.model("JobApplication",jobApplicationSchema)

export default JobApplication