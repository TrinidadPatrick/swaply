import { Request, Response } from "express";
import { getUserByOtp, markEmailAsVerified, sendOtp } from "../services/user.auth.service";
import { getUserbyEmailUsername } from "../services/user.service";
import { handleError } from "../helpers/error-handler";

export const c_verifyAccount = async (req : Request, res : Response) => {
    const {userId, otpToken} = req.body
    if (!userId || !otpToken) res.status(500).json({message: "Internal Server Error"}) 

    try {
        const user = await getUserByOtp(otpToken, userId)
        if(user && user.emailVerified) res.status(200).json({message: "User is already verified"})
        if(user){
            await markEmailAsVerified(userId)
            res.status(200).json({message: "User verification success"})
        }else{
            res.status(400).json({message: "Invalid or expired OTP"}) 
        }
    } catch (error) {
        console.log(error)
        handleError(error)
    }
}


export const c_forgotPassword = async (req : Request, res: Response) => {
    const {email_username} = req.body

    try {
        const user = await getUserbyEmailUsername(email_username)
        if(!user) return res.status(404).json({
            message: "User not found"
        })
        const baseEmail = user.email.split("@")[0]
        const return_email = "*****" + baseEmail.slice(baseEmail.length - 3, baseEmail.length) + "@" + user.email.split("@")[1]
        await sendOtp({
            recipient: user.email,
            otp: '212233',
            subject: 'Password Reset OTP',
            header: 'Here is your One-Time Password (OTP) for resetting your password', 
            validity: 2,
            time: 'hours'
        })
        res.status(200).json({message: `OTP sent to ${return_email}`})
    } catch (error) {
        console.log(error)
        handleError(error)
    }
}