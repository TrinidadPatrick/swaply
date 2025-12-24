import { Request, Response } from "express";
import { createUser, deleteUser, getAllUsers, getUser } from "../services/user.service.js";
import { generateVerificationToken } from "../helpers/generate-verification-token.js";
import { hashPassword } from "../helpers/password-util.js";
import { handleError } from "../helpers/error-handler.js";
import { sendOtp } from "../services/user.auth.service.js";

interface User {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    verificationToken?: string;
    tokenExpiresAt?: Date;
}

export const c_getUser = async ( req: Request, res: Response) => {
    const id = req.params.id
    try {
        const user = await getUser(Number(id))
        if(user){
            return res.status(200).json({message : "Fetched user successfully", user})
        }
        res.status(404).json({message : "User not found", user})
    } catch (error) {
        console.log(error)
        const {message, status} = handleError(error)
        res.status(status).json({message: message})
    }
}


export const c_getAllUsers = async (req : Request, res : Response) => {
    try {
        const users = await getAllUsers()
        res.status(200).json({message : "Fetched users successful", users})
    } catch (error) {
        console.log(error)
    }
}

export const c_createUser = async ( req: any, res: any) => {
    const data : User = req.body

    const now = new Date()
    now.setHours(now.getHours() + 2)

    const verificationToken = generateVerificationToken()
    
    data.tokenExpiresAt = now
    data.verificationToken = verificationToken

    const password = await hashPassword(data.password)
    data.password = password

    try {
        const user = await createUser(data)
        const email = await sendOtp({
            recipient: user.email,
            otp: verificationToken,
            subject: 'Account Verification OTP',
            header: 'Here is your One-Time Password (OTP) for verifying your account', 
            validity: 2,
            time: 'hours'
        })
        res.json({message: "User created successfully", user})
    } catch (error : any) {
        const {status, message} = handleError(error)
        res.status(status).json({message: message})
    }
}

export const c_deleteUser = async (req: any, res: any) => {
    const id = req.params.id
    if(id){
        try {
            const user = await deleteUser(Number(id))
            res.json({message: "User deleted successfully", user})
        } catch (error) {
            const {status, message} = handleError(error)
            res.status(status).json({message: message})
        }
    }
}