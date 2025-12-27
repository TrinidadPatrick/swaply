import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { AppError } from './AppError';

const secret_key = process.env.JWT_SECRET_KEY
const refresh_secret_key = process.env.JWT_REFRESH_SECRET_KEY

interface JwtProps {
    payload: {},
    expire_at: SignOptions["expiresIn"]
}


export const generateJwtToken = ({payload, expire_at} : JwtProps) => {
    if(!secret_key) throw new Error("JWT secret key is missing. Cannot generate token.");

    const options: SignOptions = {
    expiresIn: expire_at,
    };

    return jwt.sign(payload, secret_key, options);
}

export const verifyJwtToken = (token : string) => {
    if(!secret_key) throw new Error("JWT secret key is missing. Cannot Verify.");

    try {
        const decoded = jwt.verify(token, secret_key) as JwtPayload
        return decoded
    } catch (error) {
        throw new AppError("Unauthorized", 401)
    }
}

export const generateRefreshToken = ({payload, expire_at} : JwtProps) => {
    if(!refresh_secret_key) throw new Error("JWT refresh secret key is missing. Cannot generate refresh token.");

    const options: SignOptions = {
    expiresIn: expire_at,
    };

    return jwt.sign(payload, refresh_secret_key, options);
}

export const verifyJwtRefreshToken = (token : string) => {
    if(!refresh_secret_key) throw new Error("JWT refresh secret key is missing. Cannot Verify.");

    try {
        const decoded = jwt.verify(token, refresh_secret_key)
        return decoded
    } catch (error) {
        throw new AppError("Unauthorized", 401)
    }
}