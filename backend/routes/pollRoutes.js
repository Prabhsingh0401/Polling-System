import express from "express";
import { getPollStatus, createPoll } from "../controllers/pollController.js";

const router = express.Router();

router.get("/status", getPollStatus);
router.post("/create", createPoll);

export default router;