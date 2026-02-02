import genToken from "../config/token.js"
import User from "../models/user.model.js"

import bcrypt from "bcryptjs"
export const signUp = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);   // 👈 ADD THIS

    const { name, email, password } = req.body;

        const existEmial=await User.findOne({email})
        if(existEmial){
            return res.status(400).json({message:"email already exist!"})
        }

        if(password.length<6){
             return res.status(400).json({message:"password must be atleast six characters!"})
        
    } 
   
 const hashedPassword= await bcrypt.hash(password, 10)  //password ko hash karenge directly db m store mhi karwaynge
 const user= await User.create({
    name,password:hashedPassword,email
 })

 const token=await genToken(user._id)
 res.cookie("token",token,{
    httpOnly:true,
    maxAge:7*24*60*60*1000,
    sameSite:"None",
    secure:true
 })
 return res.status(201).json(user)

}catch (error) {
    return res.status(500).json({message:`sign up error ${error}`})
        
    }
}

export const Login = async (req, res)=>{
    try {
        const{email, password}= req.body
        const user =await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"email does not exist!"})
        }
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({message:"incorrect password"})
        }

 

 const token=await genToken(user._id)
 res.cookie("token",token,{
    httpOnly:true,
    maxAge:7*24*60*60*1000,
    sameSite:"None",
    secure:true
 })
 return res.status(200).json(user)

}catch (error) {
    return res.status(500).json({message:`Login error ${error}`})
        
    }
}

export const logout= async (req,res)=>
{
try {
    res.clearCookie("token")
    return res.status(200).json({message:"log out successfully"})
} catch (error) {
     return res.status(500).json({message:`logout error ${error}`})
}
}
