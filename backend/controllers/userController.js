import User from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



const JWT_SECRET = process.env.JWT_SECRET;

const ToKEN_EXPIRES ='12h';

const createToken = (userId) =>{
    return jwt.sign({ id:userId},JWT_SECRET,{expiresIn:ToKEN_EXPIRES});
}


// register user

export async function registerUser(req,res) {
    // console.log("REQ.BODY : ",req.body); // check karne
    const {name,email,password} = req.body;
    if(!name || !email || !password){
        return res.status(400).json({
            success:false,
            message:"All feilds are .required "
        });
    }

    if(!validator.isEmail(email)){
        return res.status(400).json({
            success:false,
            message:"Invalid Email "
        });
    }

    if(password.length<8){
        return res.status(400).json({
            success:false,
            message:"Password must be atleast of 8 charaters "
        });
    }

    try{
        if(await User.findOne({email})){
            return res.status(409).json({
                success:false,
                message:"User already present for this email "
            });
        }
        const hashed = await bcrypt.hash(password,10);
        const user = await User.create({name,email,password:hashed});
        const token = createToken(user._id);
        res.status(201).json({
            success:true,
            token,
            user:{id:user._id, name:user.name, email:user.email}
           });
    }
    catch(err){
        console.error(err);
        res.status(500).json({
            success:false,
            Message:"Server Error"
        });
    } 
}

// login user 

export async function loginUser(req,res){
    const {email,password}=req.body;
    if(!email || !password){
        returnres.status(400).json({
            success:false,
            message:"Both of fields are required "
        });
    }
    try{
        const user=await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success:false,
                message:"Invalid email or password  (User is not found) "
            });
        }
        const match =await bcrypt.compare(password,user.password);
        if(!match){
            return res.status(401).json({
                success:false,
                message:"Invalid email or password  "
            });
        }
        const token = createToken(user._id);
        res.json({
            success:true,
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email
            }
        });

    }
    catch(error){
        console.error(err);
        res.status(500).json({
            success:false,
            Message:"Server Error"
        });
    } 
} 

// get login user details 

export async function getCurrentUser(req,res){
    try{
        const user=await User.findById(req.user.id).select("user email");
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found "
            });
        }
        res.json({success:true,user});
    }
    catch(error){
        console.error(err);
        res.status(500).json({
            success:false,
            Message:"Server Error"
        });
    } 
}


// update user profile

export async function updateProfile(req,res){
    const {name,email} = req.body;
     if(!name || !email || !validator.isEmail(email)){
        return res.status(400).json({
            success:false,
            message:"valid name or email  are required "
        });
    }

    try{
        const exists = await User.findOne({email,_id:{$ne:req.user.id}});
        if(exists){
            return res.status(409).json({
                success:false,
                message:"Email is already used "
            });
        }
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {name,email},
            {new:true, runValidators:true, select:"name email"}
        );
        res.json({
            success:true,
            user
        });
   }
   catch(error){
        console.error(err);
        res.status(500).json({
            success:false,
            Message:"Server Error"
        });
    } 
}

// change password 

export async function updatePassword(req,res){
    const { currentPassword, newPassword }= req.body;
    if(!currentPassword || !newPassword || newPassword.length < 8){
        return res.status(400).json({
            success:false,
            message:"PAssword Invalid or too short "
        })
    }
    try{
        const user = await User.findById(req.user.id).select("password");
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found "
            });
        }
        const match = await bcrypt.compare(currentPassword, user.password);
        if(!match){
            return res.status(401).json({
                success:false,
                messsage:"Current password is incorrect "
            });
        }
        user.password=await bcrypt.hash(newPassword,10);
        await user.save();
        res.json({
            success:true,
            message:"Password changed "
        });
    }
      catch(error){
        console.error(err);
        res.status(500).json({
            success:false,
            Message:"Server Error"
        });
    } 
}

