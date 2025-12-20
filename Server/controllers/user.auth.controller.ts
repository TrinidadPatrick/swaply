import { Request, Response } from "express";
import { getUserByOtp } from "../services/user.auth.service";

export const c_verifyToken = async (req : Request, res : Response) => {
    const {userId, otpToken} = req.body
    
    try {
        const user = await getUserByOtp(otpToken, userId)
        if(user){
            res.status(200).json({message: "User verification success", user})
        }else{
            res.status(400).json({message: "Invalid or expired OTP"}) 
        }
    } catch (error) {
        console.log(error)
    }
}