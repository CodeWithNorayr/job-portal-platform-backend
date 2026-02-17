import mongoose from "mongoose";

const connectDB = async () => {
  try {
      await mongoose.connect(process.env.MONGODB_URI).then(()=>{
      console.log("MONGODB IS CONNECTED")
    })
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1)
  }
}

export default connectDB