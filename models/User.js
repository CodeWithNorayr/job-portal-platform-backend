import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name:{type:String,required:true},
  password:{type:String,required:true},
  email:{type:String,unique:true,required:true},
  image:{type:String,required:true},
  resume:{type:String,required:true}
})

const User = mongoose.models.User || mongoose.model("User",userSchema)

export default User