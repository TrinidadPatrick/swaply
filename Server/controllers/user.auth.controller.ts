import { NextFunction, Request, Response } from "express";
import { getUserByOtp, markEmailAsVerified, sendOtp, updatePassword, updatePasswordAction, upsertOtp, validateCredentials } from "../services/user.auth.service.js";
import { getUserbyEmailUsername } from "../services/user.service.js";
import { handleError } from "../helpers/error-handler.js";
import { generateVerificationToken } from "../helpers/generate-verification-token.js";

export const c_verifyAccount = async (req : Request, res : Response) => {
    const {userId, otpToken} = req.body
    if (!userId || !otpToken) res.status(500).json({message: "Internal Server Error"}) 

    try {
        const user = await getUserByOtp(otpToken, userId)
        if(user && user.email_verified) return res.status(200).json({message: "User is already verified"})
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

export const c_login = async (req : Request, res : Response, next: NextFunction) => {
    const {email_username, password} = req.body

    try {
        const authData = await validateCredentials(email_username, password)

        return res.status(200).json({message: `Login successfull`, data: authData})
    } catch (error: any) {
        next(error)
    }
}

export const c_forgotPassword = async (req : Request, res: Response) => {
    const {email_username} = req.body

    try {
        // Get the user info if existing
        const user = await getUserbyEmailUsername(email_username)

        if(!user) return res.status(404).json({
            message: "User not found"
        })

        const baseEmail = user.email.split("@")[0]
        const return_email = "*****" + baseEmail.slice(baseEmail.length - 3, baseEmail.length) + "@" + user.email.split("@")[1]

        const otp = generateVerificationToken()
        const now = new Date()
        const tokenExpiresAt = new Date(now.setHours(now.getHours() + 2))

        // Update user otp in db
        await upsertOtp(otp, tokenExpiresAt, user.id)

        // Send the otp in the email of user
        await sendOtp({
            recipient: user.email,
            otp: otp,
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

export const c_resetPassword = async (req : Request, res: Response) => {
    const {user_id, otp_token, new_password} = req.body
    if (!user_id || !otp_token || !new_password) return res.status(400).json({message: "Your request is wrong; fix your data and try again"}) 

    try {
        const user = await getUserByOtp(otp_token, user_id)
        if(user){
            await updatePassword({
                newPassword : new_password,
                action: updatePasswordAction.RESET,
                id: user_id
            })
            res.status(200).json({message: "Password reset successfull"})
        }else{
            res.status(400).json({message: "Invalid or expired OTP"}) 
        }
    } catch (error) {
        console.log(error)
        handleError(error)
    }
}

