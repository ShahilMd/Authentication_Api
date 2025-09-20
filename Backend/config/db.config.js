import mongoose from "mongoose";

const connectDB = async() => {
  try {
    const db = await mongoose.connect(process.env.DB_URL).then(() => console.log(
      "Database connected")
    )
  } catch (error) {
    console.log('error',error.message || 'failed to connect database');
    
  }
}

export default connectDB;