import {prisma} from '../lib/prisma'

import nodemailer from 'nodemailer';

interface emailProps {
    recipient: string,
    otp : string,
    subject: string,
    header: string,
    validity: number,
    time: string
}

interface updatePasswordProps {
    oldPassword?: string,
    newPassword: string,
    action: updatePasswordAction,
    id: number
}

export enum updatePasswordAction {
    RESET = "RESET",
    UPDATE = "UPDATE"
}

export const upsertOtp = async (otpToken: string,tokenExpiresAt: Date, id : number) => {
    await prisma.userAuth.update({
        where : {
            user_id: id
        },
        data: {
            verification_token: otpToken,
            token_expires_at: tokenExpiresAt
        }
    })
}

// Verify OTP
export const getUserByOtp = async (otpToken: string, id : number) => {
    const user = await prisma.userAuth.findFirst({
        where: {
            user_id : id,
            verification_token : otpToken,
            token_expires_at : {
                gte: new Date()
            }
        }
    })
    return user
}

export const markEmailAsVerified = async (id: number) => {
        await prisma.userAuth.update({
            where : {
                id
            },
            data: {
                email_verified: true,
                verification_token: null
            }
        })
}

export const updatePassword = async ({oldPassword, newPassword, action, id} : updatePasswordProps ) => {
    if(action === updatePasswordAction.RESET){
        await prisma.userAuth.update({
            where: {
                id
            },
            data: {
                password: newPassword,
                verification_token: null
            }
        })
    }
}

export const sendOtp = async ({recipient, otp, subject, header, validity, time} : emailProps) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        }
      });

      const mailOptions = {
        from: 'swaply.support@gmail.com',
        to: recipient,
        subject: subject,
        html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your OTP Code</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  color: #333;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  width: 100%;
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #ffffff;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  overflow: hidden;
              }
              .header {
                  background-color: #007bff;
                  color: #ffffff;
                  padding: 20px;
                  text-align: center;
              }
              .header h1 {
                  margin: 0;
                  font-size: 24px;
              }
              .content {
                  padding: 20px;
                  text-align: center;
              }
              .otp {
                  font-size: 32px;
                  font-weight: bold;
                  color: #007bff;
                  margin: 20px 0;
              }
              .footer {
                  background-color: #f4f4f4;
                  color: #666;
                  padding: 10px;
                  text-align: center;
                  font-size: 14px;
              }
              .footer a {
                  color: #007bff;
                  text-decoration: none;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Your OTP Code</h1>
              </div>
              <div class="content">
                  <p>${header}:</p>
                  <div class="otp">
                      ${otp}
                  </div>
                  <p>This OTP is valid for ${validity} ${time}. Please use it to complete your verification process.</p>
                  <p>If you did not request this OTP, please ignore this email.</p>
              </div>
          </div>
      </body>
      </html>
  `
      };

      try {
        const send = await transporter.sendMail(mailOptions)
        return send
      } catch (error) {
        return error
      }
      
}