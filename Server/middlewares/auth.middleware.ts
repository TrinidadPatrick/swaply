import { NextFunction, Request, Response } from "express";


const authMiddleware = async ( req : Request, res : Response, next: NextFunction) => {
    console.log("Passed")
    next()
}
export default authMiddleware