import crypto from "crypto"
import userModel from "../model/userMOdel.js"
import { otpModel } from "../model/otpModel.js"
import transporter from "../utils/nodemailer.js"

export const generateOtp = async (req, res) => {
    try {
        const { userId } = req
        const user = await userModel.findById(userId)
        if (user) {
            const otp = crypto.randomInt(100000, 999999).toString()
            const createdAt = new Date()
            const expireAt = new Date(createdAt.getTime() + 5 * 60 * 1000)
            const mailOptions = {
                from: "priyankaad99@gmail.com",
                to: user.email,
                subject: "THE CHAT APP OTP",
                text: `Hey user this is the otp of chat app -${otp} Do not share your OTP with anyone.
                OTP valid for 5 mins.`
            }
            let isCreated = await otpModel.findOne({ userId })
            if (isCreated) {
                let now = new Date()
                let prevCreatedAt = isCreated.createdAt
                if (now - prevCreatedAt < 30000) {
                    return res.status(400).send({ error: "Wait for 30 sec before creating new OTP" })
                }
                else {
                    transporter.sendMail(mailOptions)
                    await otpModel.updateOne({ userId }, {
                        $set: {
                            otp,
                            createdAt,
                            expireAt
                        }
                    })
                    return res.status(200).send({ message: "OTP sent to the user email " })
                }
            }
            else {
                const otpData = new otpModel({ userId: user._id, otp, createdAt, expireAt })
                await Promise.all([transporter.sendMail(mailOptions), otpData.save()])
                return res.status(200).send({ message: "OTP sent to the user email" })
            }
        }
        else {
            return res.status(400).send({ error: "User not found" })
        }
    } catch (error) {
        res.status(500).send({ error: "Something went wrong", errorMessage: error.message })
    }
}

export const verifyOtp = async (req, res) => {
    try {
        const userId = req.userId
        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(400).send({ error: "User not found" })
        }
        else {
            let userOtpId = user._id
            const otpData = await otpModel.findOne({ userId: userOtpId })
            const now = new Date
            if (now > otpData.expireAt) {
                return res.status(400).send({ error: "OTP is expired, Generate again" })
            }
            else {
                let { userOtp } = req.body
                if (userOtp === otpData.otp) {
                    return res.status(200).send({ message: "OTP verified successfully" })
                }
                else {
                    return res.status(400).send({ error: "OTP is not matching, Try it again!" })
                }
            }
        }
    } catch (err) {
        res.status(500).send({ error: "Something went wrong", errorMessage: err.message })
    }
}