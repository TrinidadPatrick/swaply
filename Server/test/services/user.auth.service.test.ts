
import { mockPrisma } from '../__mocks__/prisma';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import nodemailer from 'nodemailer';

const sendMailMock = vi.fn().mockResolvedValue(true);

vi.mock('../../lib/prisma', () => ({
    prisma : mockPrisma
}))

vi.mock('../../helpers/password-util', () => ({
  comparePassword: vi.fn(),
  hashPassword: vi.fn(),
}));

vi.mock('../../helpers/jwt-utils', () => ({
  generateJwtToken: vi.fn(),
}));

vi.mock('../../services/user.service');

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: sendMailMock
    }))
  }
}));

import * as userAuthService from '../../services/user.auth.service'
import * as passwordUtil from '../../helpers/password-util';
import * as jwtUtil from '../../helpers/jwt-utils';
import { AppError } from '../../helpers/AppError';
import { getUserbyEmailUsername } from '../../services/user.service';
import { Role } from '../../generated/prisma/enums';

const mockComparePassword = passwordUtil.comparePassword as unknown as Mock;
const mockHashPassword = passwordUtil.hashPassword as unknown as Mock;
const mockGenerateJwt = jwtUtil.generateJwtToken as unknown as Mock;

describe('Password Update Test', () => {
    beforeEach(()=>{
        vi.clearAllMocks()
    })

    it('should update password with reset', async () => {
        const mock_data = {
            newPassword: 'newhashedpassword',
            action: userAuthService.updatePasswordAction.RESET,
            id: 1
        }
        mockHashPassword.mockResolvedValue('newhashedpassword');
        mockPrisma.userAuth.update.mockResolvedValue({})

        await userAuthService.updatePassword(mock_data)
        expect(mockPrisma.userAuth.update).toHaveBeenCalledWith({
            where: {
                user_id: mock_data.id
            },
            data: {
                password: 'newhashedpassword',
                verification_token: null
            }
        })
    })

    it('should update password with change option successfully', async () => {
        const mock_data = {
            oldPassword: 'testoldpassword',
            newPassword: 'testnewpassword',
            action: userAuthService.updatePasswordAction.UPDATE,
            id: 1
        }

        const mock_user = {
            user_id: 1,
            password: 'testoldpassword'
        }

        mockPrisma.userAuth.findUnique.mockResolvedValue(mock_user)

        mockComparePassword.mockResolvedValue(true);
        mockHashPassword.mockResolvedValue('newhashedpassword');

        await userAuthService.updatePassword(mock_data)
        expect(mockPrisma.userAuth.update).toHaveBeenCalledWith({
            where: {
                user_id: mock_data.id
            },
            data: { password: 'newhashedpassword' },
        })
    })

    it('update password should throw error when user not found', async () => {
        const mock_data = {
            oldPassword: 'testoldpassword',
            newPassword: 'testnewpassword',
            action: userAuthService.updatePasswordAction.UPDATE,
            id: 1
        }

        mockPrisma.userAuth.findUnique.mockResolvedValue(null)

        await expect(userAuthService.updatePassword(mock_data)).rejects.toThrow("User not found")
    })

    it('update password should throw error when old passwor is incorrect', async () => {
        const mock_data = {
            oldPassword: 'testoldpassword',
            newPassword: 'testnewpassword',
            action: userAuthService.updatePasswordAction.UPDATE,
            id: 1
        }

        mockPrisma.userAuth.findUnique.mockResolvedValue({id: 1, password: 'oldPassword'})

        mockComparePassword.mockResolvedValue(false);

        await expect(userAuthService.updatePassword(mock_data)).rejects.toThrow("Old password is incorrect")
    })

})

describe('user Verification Test', () => {
    beforeEach(()=>{
        vi.clearAllMocks()
    })

    it('should mark user auth as verified', async () => {
        mockPrisma.userAuth.update.mockResolvedValue({})

        await userAuthService.markEmailAsVerified(1)
        expect(mockPrisma.userAuth.update).toHaveBeenCalledWith({
            where : {
                id: 1
            },
            data: {
                email_verified: true,
                verification_token: null
            }
        })
    })

})

describe('OTP Test', () => {
    beforeEach(()=>{
        vi.clearAllMocks()
    })

    it('should get user by otp and user id', async () => {
        const fake_user_auth = {user_id: 1, verification_token: '112233', token_expires_at: new Date('2025-12-24T10:00:00Z')}
        mockPrisma.userAuth.findFirst.mockResolvedValue(fake_user_auth)

        const user_auth = await userAuthService.getUserByOtp('112233', 1)
        expect(user_auth).toEqual(fake_user_auth)
        expect(mockPrisma.userAuth.findFirst).toHaveBeenCalledWith({
        where: {
            user_id : 1,
            verification_token : '112233',
            token_expires_at : {
                gte: expect.any(Date)
            }
        }
    })
    })

    it('should error if otp is invalid or expired', async () => {
        const fake_user_auth = null
        mockPrisma.userAuth.findFirst.mockResolvedValue(fake_user_auth)

        const user_auth = await userAuthService.getUserByOtp('112233', 1)
        expect(user_auth).toEqual(fake_user_auth)
        expect(mockPrisma.userAuth.findFirst).toHaveBeenCalledWith({
        where: {
            user_id : 1,
            verification_token : '112233',
            token_expires_at : {
                gte: expect.any(Date)
            }
        }
    })
    })

    it('should update otp of user', async () => {
        const fake_user_auth = {user_id: 1, verification_token: '112233', token_expires_at: new Date('2025-12-24T10:00:00Z')}
        mockPrisma.userAuth.update.mockResolvedValue(fake_user_auth)

        await userAuthService.upsertOtp('112233', new Date('2025-12-24T10:00:00Z'), 1)
        expect(mockPrisma.userAuth.update).toHaveBeenCalledWith({
        where : {
            user_id: 1
        },
        data: {
            verification_token: '112233',
            token_expires_at: expect.any(Date)
        }
    })
    })

})

describe('Email Sending Test', () => {
    beforeEach(()=>{
        vi.clearAllMocks()
    })

    it('should send email with correct parameters', async () => {
        await userAuthService.sendOtp({
            recipient: 'testrecipient',
            otp : '112233',
            subject : 'testsubject',
            header: 'testheader',
            validity: 10,
            time: 'minutes'
        })

        expect(nodemailer.createTransport).toHaveBeenCalled();
        expect(sendMailMock).toHaveBeenCalledWith({
            from: 'swaply.support@gmail.com',
            to: 'testrecipient',
            subject: 'testsubject',
            html: expect.stringContaining('112233')
        })
    })

})

describe('User Login Test', () => {
    beforeEach(()=>{
        vi.clearAllMocks()
    })

    it('should throw error when no username or password', async () => {
        await expect(userAuthService.validateCredentials('', 'newPassword')).rejects.toThrowError(new AppError("Email and password are required", 400))
    })

    it('should throw 401 if user does not exist', async () => {
        vi.mocked(getUserbyEmailUsername).mockResolvedValue(null)

        await expect(userAuthService.validateCredentials('test@example.com', 'password123'))
        .rejects.toThrowError(new AppError("Invalid email or password", 401));
    });

    it('should throw 401 if password does not match', async () => {
        const mockUser = { id: 1, email: 'testemail', role: Role.USER, auth: { password: 'hashed_password', user_id: 1 } };
        vi.mocked(getUserbyEmailUsername).mockResolvedValue(mockUser)

        mockComparePassword.mockResolvedValue(false)

        await expect(userAuthService.validateCredentials('test@example.com', 'wrong_password'))
        .rejects.toThrowError(new AppError("Invalid email or password", 401));
    });

    it('should return userid and token if login successfull', async () => {
        const mockUser = { id: 1, email: 'testemail', role: Role.USER, auth: { password: 'hashed_password', user_id: 1 } };

        vi.mocked(getUserbyEmailUsername).mockResolvedValue(mockUser)
        mockComparePassword.mockResolvedValue(true)
        mockGenerateJwt.mockReturnValue('jwttoken')

        const result = await userAuthService.validateCredentials('test@example.com', 'correct_password');

        expect(result).toEqual({
            user_id: 1,
            jwt_token: 'jwttoken'
        })
        expect(mockGenerateJwt).toHaveBeenCalledTimes(1)
    });

})