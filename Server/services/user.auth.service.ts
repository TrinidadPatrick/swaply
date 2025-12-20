import {prisma} from '../lib/prisma'

export const getUserByOtp = async (otpToken: string, id : number) => {
    return prisma.userAuth.findFirst({
        where: {
            userId : id,
            verificationToken : otpToken,
            tokenExpiresAt : {
                gte: new Date()
            }
        }
    })
}