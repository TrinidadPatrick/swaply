import jwt, { SignOptions } from 'jsonwebtoken';

const secret_key = process.env.JWT_SECRET_KEY

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