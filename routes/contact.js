import express from "express"
import { contactUsController } from "../controllers/contactus.js"

const router = express.Router()

router.post("/contact", contactUsController)

export default router
