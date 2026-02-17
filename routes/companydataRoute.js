import getCompaniesData from "../controllers/companydataController.js";
import express from "express"

const companydataRouter = express.Router()

companydataRouter.get("/companyData",getCompaniesData)

export default companydataRouter
