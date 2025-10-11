import mongoose from "mongoose";


const schema = new mongoose.Schema({
  name:{
    type:String,
    required:[true,'name is required'],
    trim:true,
    maxLength:[30,'name can not be more than 30 characters'],
  },
  email:{
    type:String,
    required:[true,'email is required'],
    trim:true,
    unique:true
  },
  profileImg:{
    type:String,
      default:""
  },
  publicId:{
      type:String,
      default:""
  },
  password:{
    type:String,
    required:[true,'password is required'],
  },
  role:{
    type:String,
    required:[true,'role is required'],
    default:'user'
  }
},{timestamps:true})


export const User = mongoose.model('User',schema)