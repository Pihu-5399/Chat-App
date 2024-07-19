import express from 'express'
import cors from "cors";
import { config } from 'dotenv';
import dbConnect from './db/dbConnect.js';
import userRouter from './routers/userRouter.js';
import { otpRouter } from './routers/otpRouter.js';
import msgRouter from './routers/messageRouter.js';
import cookieParser from "cookie-parser"

const app = express()

//MIDDLEWARE
app.use(express.json())
app.use(cors())
app.use(cookieParser())
config("./.env")

//Routers
app.use("/user", userRouter)
app.use("/otp", otpRouter)
app.use("/msg", msgRouter)

//PORT AND HOSTNAME
const PORT = process.env.PORT
const hostname = process.env.hostname
// console.log(process.env);

//listen method
app.listen(PORT, hostname, () => {
    console.log(`Server is running at http://${hostname}:${PORT}`);
    dbConnect()
})