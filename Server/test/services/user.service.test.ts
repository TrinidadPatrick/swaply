
import { mockPrisma } from '../__mocks__/prisma';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/prisma', () => ({
    prisma : mockPrisma
}))

import * as userService from '../../services/user.service'

describe('User Service', () => {
    beforeEach(()=>{
        vi.clearAllMocks()
    })

    it('should get all users', async () => {
        const fake_users = [{id: 1, username: 'Patrick'}]
        mockPrisma.user.findMany.mockResolvedValue(fake_users)

        const users = await userService.getAllUsers()
        expect(users).toEqual(fake_users)
        expect(mockPrisma.user.findMany).toHaveBeenCalledTimes(2)
    })

    it('should get user by id', async () => {
        const fake_user = {id: 1, username: 'Patrick'}
        mockPrisma.user.findUnique.mockResolvedValue(fake_user)

        const user = await userService.getUser(1)
        expect(user).toEqual(fake_user)
        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({where: {id : 1}, include : {
            auth : {
                select : {
                    id : true,
                    user_id: true,
                    email_verified: true
                }
            }
        }})
    })

    it('should create a new user', async () => {
        const new_user = {username: 'Patrick', email: 'patrick@gmail.com', firstName: 'Patrick', lastName: 'Trinidad', password: 'testpassword', verificationToken: '112233', tokenExpiresAt: new Date('2025-12-24T10:00:00Z')}
        const {username, email, firstName, lastName, password, verificationToken, tokenExpiresAt} = new_user
        const created_user = {id: 2, username, email, first_name: firstName, last_name: lastName }

        const userCreateSpy = vi.fn()
        const userAuthCreateSpy = vi.fn()

        mockPrisma.user.create.mockResolvedValue(created_user)

        mockPrisma.$transaction.mockImplementation(async (callback) => {
            return callback({
                user: {create: userCreateSpy.mockResolvedValue(created_user)},
                userAuth: { create: userAuthCreateSpy}
            })
        })
        
        const user = await userService.createUser(new_user)
        expect(user).toEqual(created_user);
        expect(userCreateSpy).toHaveBeenCalledWith({
            data: {username, email, first_name: firstName, last_name: lastName}
        })
        expect(userAuthCreateSpy).toHaveBeenCalledWith({
            data: {user_id: user.id, password, verification_token: verificationToken, token_expires_at: expect.any(Date)}
        })
    })

    it('should get user by email or username', async () => {
        const fake_user = {id: 1, username: 'patrick', email: 'patrick@gmail.com'}
        mockPrisma.user.findFirst.mockResolvedValue(fake_user)

        const user = await userService.getUserbyEmailUsername('patrick')
        expect(user).toEqual(fake_user)
        expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
            where : {
            OR : [
                {username: 'patrick'},
                {email: 'patrick'}
            ]
        }, select : {
            email: true,
            id: true
        }
        })
    })

    it('should delete user by id', async () => {
        const deleted_user = {id: 1, username: 'Patrick'}
        mockPrisma.user.delete.mockResolvedValue(deleted_user)

        const user = await userService.deleteUser(1)
        expect(user).toEqual(deleted_user)
        expect(mockPrisma.user.delete).toHaveBeenCalledWith({
            where: {
                id: 1
            }
        })
    })

})

