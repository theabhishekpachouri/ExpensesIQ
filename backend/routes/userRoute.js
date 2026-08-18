import express from "express";
import { getCurrentUser, loginUser, registerUser, updatePassword, updateProfile } from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const UserRoute = express.Router();

UserRoute.post("/register", registerUser);
UserRoute.post("/login",loginUser);

// protected routes

UserRoute.get("/me",authMiddleware,getCurrentUser);
UserRoute.put("/profile",authMiddleware,updateProfile);
UserRoute.put("/password",authMiddleware,updatePassword);


export default UserRoute;
