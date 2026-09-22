import genToken from "../config/token.js"
import User from "../models/user.model.js"

import bcrypt from "bcryptjs"
export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields (name, email, password) are required." });
    }

        const existEmial = await User.findOne({ email }).select("_id");
        if (existEmial){
            return res.status(400).json({ message: "Email already exists!" });
        }

        if (password.length < 6){
             return res.status(400).json({ message: "Password must be at least six characters!" });
    } 
    
 const hashedPassword= await bcrypt.hash(password, 10)
 const user= await User.create({
    name, password: hashedPassword, email
 })

 const token=await genToken(user._id)
 res.cookie("token",token,{
    httpOnly:true,
    maxAge:7*24*60*60*1000,
    sameSite:"None",
    secure:true
 })

 const safeUser = await User.findById(user._id).select("-password");
 return res.status(201).json(safeUser)

}catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Sign up failed. Please try again." });
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
