import express from "express"
import getJobApplications from "../controllers/applications.js";
import protectCompany from "../middlewares/companyMiddleware.js";

const applicationRouter = express.Router();

applicationRouter.get('/applications', protectCompany, getJobApplications);

export default applicationRouter;