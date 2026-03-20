import mongoose from "mongoose";

const userSchema=mongoose.Schema({
    name:{type:String,required:true},
    password:{type:String,required:true},
    District:{type:String,required:true},
    phoneNumber: { type: Number, required: true }
},{minimize:false})

const userModel=mongoose.models.user || mongoose.model("user",userSchema);


export default userModel;