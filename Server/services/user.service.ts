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
    const user = await prisma.user.create({
        data : {first_name : firstName, last_name: lastName, username, email}
    })

    await prisma.userAuth.create({
        data: {userId : user.id, password, verificationToken, tokenExpiresAt}
    })

    return user
}

export const getUser = async (id : number | undefined) => {
    const user = await prisma.user.findUnique({
        where : {
            id : id
        }
    })
    return user

}