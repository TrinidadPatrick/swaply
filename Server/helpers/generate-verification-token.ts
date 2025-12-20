export const generateVerificationToken = () => {
    const otp = Math.floor(Math.random() * 90000) + 10000

    return String(otp);
}