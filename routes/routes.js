import express from "express";
import {
    register,
    login, refreshToken
} from "../controllers/Users.js";

import bodyParser from "body-parser";
import req from "express/lib/request.js";
import res from "express/lib/response.js";




const router = express.Router();
router.use(express.json());

router.post('/register',register)
router.post('/login',login)
router.post('/refreshToken',refreshToken)

export default router;