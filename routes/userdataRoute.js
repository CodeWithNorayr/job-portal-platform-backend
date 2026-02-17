import express from "express"
import { fetchAllUsers } from "../controllers/userdataController.js"

const userdataRouter = express.Router()


userdataRouter.get("/getallusers",fetchAllUsers)

export default userdataRouter