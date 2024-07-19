import { config } from "dotenv";
import mongoose from "mongoose";
config()

 const url = process.env.Mongo_Url

 const dbConnect = async()=>{
    try {
        await mongoose.connect(url)
        console.log("Database Connected");
    } catch (err) {
        console.log(err.msg);
    }
 }
 export default dbConnect