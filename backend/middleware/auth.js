import User from "../models/userModel.js";
import jwt from "jsonwebtoken";


const JWT_SECRET =process.env.JWT_SECRET;

export default async function authMiddleware(req,res,next){
    // grab the token
    
    const authHeader = req.headers. authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res. status(401) .json({
            success: false,
            message: "Not authorized or token missing"

        });
    }
    const token = authHeader.split(" ")[1];


    // Ensure JWT_SECRET exists
    
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error("JWT_SECRET is missing in environment variables!");
        return res.status(500).json({
            success: false,
            message: "Internal server configuration error"
        });
    }

    // to verify the token

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select("-password");
        if(!user ) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }
        req.user=user;
        next();
    }

    catch (err) {
        console.error("JWT verification failed:", err);
        return res.status(401).json({
            success: false,
            message: "Token invalid or expired"
        });
    }
}