import express from "express"
import {
  registerCompany,
  loginCompany,
  companyData,
  updateCompany,
  deleteCompany,
  postCompanyJob,
  getCompanyPostedJobs,
  changeVisibility,
  deleteCompanyJob,
  updateCompanyJob
} from "../controllers/companyController.js"

import upload from "../config/multer.js"
import protectCompany from "../middlewares/companyMiddleware.js"

const companyRouter = express.Router()

// auth
companyRouter.post("/recruiter-registration", upload.single("image"), registerCompany)
companyRouter.post("/recruiter-login", loginCompany)

// company
companyRouter.get("/company", protectCompany, companyData)
companyRouter.put("/company-update", protectCompany, upload.single("image"), updateCompany)
companyRouter.delete("/company", protectCompany, deleteCompany)

// jobs
companyRouter.post("/jobs", protectCompany, postCompanyJob)
companyRouter.get("/jobs", protectCompany, getCompanyPostedJobs)
companyRouter.put("/jobs/:id", protectCompany, updateCompanyJob)
companyRouter.delete("/jobs/:id", protectCompany, deleteCompanyJob)
companyRouter.post("/jobs/visibility/:id", protectCompany, changeVisibility)

export default companyRouter
