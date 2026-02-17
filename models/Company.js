import mongoose from "mongoose"

const companySchema = new mongoose.Schema({
  name:{type:String,required:true},
  email:{type:String,unique:true,required:true},
  password:{type:String,required:true},
  image:{type:String,required:true}
},{timestamps:true})

const Company = mongoose.models.Company || mongoose.model("Company",companySchema)

export default Company