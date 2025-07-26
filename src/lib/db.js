import mongoose from "mongoose";

 const connectDB = async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`Database connected ${conn.connection.host}`);
    }catch{
        console.log("Error connecting to database");
        process.exit(1)
    }
}

export default connectDB

