import express from "express";
import { postController } from "./post.controller";


const api = express.Router();
api.use("/posts", postController);

const router = express.Router();
router.use("/api", api)

export default router;