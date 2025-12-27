import { NextFunction, Request, Response } from "express";
import { verifyJwtToken } from "../helpers/jwt-utils";
import { JwtPayload } from "jsonwebtoken";


const authMiddleware = async ( req : Request, res : Response, next: NextFunction) => {
    const jwt_token = req.headers['authorization']?.split(' ')[1]
    if(!jwt_token) return res.status(401).json({message: "Unauthorized"})
    
    const data : string | JwtPayload = verifyJwtToken(jwt_token)
    if(data){
        req.user = {
            user_id: data.user_id,
            role: data.role,
            iat: data.iat,
            exp: data.exp
        }
        next()
    }else{
        return res.status(401).json({message: "Unauthorized"})
    }
}
export default authMiddleware