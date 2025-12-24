

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import {prisma} from '../lib/prisma'

export interface User {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    verificationToken?: string;
    tokenExpiresAt?: Date;

}

export const getAllUsers = async () => {
    return prisma.user.findMany()
}

export const createUser = async (data : User) => {
    const {firstName, lastName, username, email, password, verificationToken, tokenExpiresAt} = data

    const result = await prisma.$transaction(async (tx) => {

        const user = await tx.user.create({
        data : {first_name : firstName, last_name: lastName, username, email}
    })

    await tx.userAuth.create({
        data: {user_id : user.id, password, verification_token: verificationToken,  token_expires_at: tokenExpiresAt}
    })

    return user
    })

    return result
}

export const getUser = async (id : number | undefined) => {
    const user = await prisma.user.findUnique({
        where : {
            id : id
        }, include : {
            auth : {
                select : {
                    id : true,
                    user_id: true,
                    email_verified: true
                }
            }
        }
    })
    return user

}

export const getUserbyEmailUsername = async (email_username: string) => {
    const user = await prisma.user.findFirst({
        where : {
            OR : [
                {username: email_username},
                {email: email_username}
            ]
        }, select : {
            email: true,
            id: true
        }
    })
    return user
}

export const deleteUser = async (id: number | undefined) => {
        const user = await prisma.user.delete({
            where: {
                id
            }
        })
        return user
}