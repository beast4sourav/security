import {User} from "../model/user.model.js";
import bcryptjs from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail } from "../mailtrap/emails.js";

export const signup = async(req,res) =>{
    const {email, password,name} = req.body;
    try {
        if(!email || !password || !name) {
            throw new Error("Username and password are required")
        }

        const userAlreadyExists = await User.findOne({ email })
        if (userAlreadyExists) {
            return res.status(400).json({success:false, message: "User already exists" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10)
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString(); 

        const user = new User ({
            email,
            password:hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
        })
        await user.save();

        // jwt

        generateTokenAndSetCookie(res, user._id)

        await sendVerificationEmail(user.email, verificationToken);


        res.status(201).json({
            success:true, 
            message: "User created successfully", 
            user:{
                ...user._doc,
                password: undefined, // Exclude password from response
            }
        });
        
    } catch (error) {
        res.status(500).json({success:false, message: error.message});
    }
}

export const verifyEmail = async(req,res)=>{
    const {code} = req.body
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() } // Check if token is still valid
        });

        if(!user){
            return res.status(400).json({success:false, message:"Invalid or expired verification code"})
        }
        user.isVerified = true;
        user.verificationToken = undefined; // Clear the verification token
        user.verificationTokenExpiresAt = undefined; // Clear the expiration time
        await user.save();

        await sendVerificationEmail(user.email, user.name); 


    } catch (error) {
        
    }
}

export const login = async(req,res) =>{
    res.send("Login route")
}
export const logout = async(req,res) =>{
    res.send("Logout route")
}