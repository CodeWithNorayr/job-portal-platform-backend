import express from "express"
import { fetchAllJobs, fetchJobById } from "../controllers/jobController.js"


const jobRouter = express.Router()

jobRouter.get("/jobs",fetchAllJobs)
jobRouter.get("/job/:id",fetchJobById)




export default jobRouter