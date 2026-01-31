import uploadOnCloudinary from "../config/cloudinary.js"
import User from "../models/user.model.js"
import moment from "moment"
import geminiResponse from "../gemini.js";


export const getCurrentUser =async (req,res)=>{
    try {
        const userId=req.userId
        const user=await User.findById(userId).select("-password")
        if(!user){
            return res.status(400).json({message:"user not find"})
        }
                    return res.status(200).json({user})
    } catch (error) {
                    return res.status(400).json({message:"get current user error"})
        
    }
}

export const updateAssistant =async(req,res)=>{
    try{
        const {assistantName, imageUrl}=req.body
        let assistantImage;
        if(req.file){
            assistantImage=await uploadOnCloudinary(req.file.path)
        }else{
            assistantImage=imageUrl
        }

        const user =await User.findByIdAndUpdate(req.userId,{
            assistantName,assistantImage
        } ,{new:true}).select("-password")
        return res.status(200).json(user)
    } catch (error){
         return res.status(400).json({message:"Update assistant error"})

    }
}

export const askToAssistant =async(req, res)=>{
    try {
        const{command}=req.body
        const user=await User.findById(req.userId);
        const userName=user.name
        const assistantName= user.assistantName
       const result = await geminiResponse(command, assistantName, userName)

// 🟢 ADD THIS CHECK
if (!result || typeof result !== "string") {
  return res.status(200).json({
    type: "general",
    userInput: command,
    response: "Sorry, I am a bit busy right now. Please try again in a few seconds."
  })
}

const jsonMatch = result.match(/{[\s\S]*}/)

        
       if (!jsonMatch) {
  return res.json({
    type: "general",
    userInput: command,
    response: result   // speak whatever Gemini said
  })
}

const gemResult=JSON.parse(jsonMatch[0])
     const type=gemResult.type
     switch(type){
        case 'get_date':
            return res.json({
                type,
                userInput:gemResult.userInput,
                response:`current date is ${moment().format("YYYY-MM-DD")}`
            });
            case 'get_time':
              return res.json({
                type,
                userInput:gemResult.userInput,
                response:`current time is ${moment().format("hh:mm A")}`
            });

  case 'get_day':
              return res.json({
                type,
                userInput:gemResult.userInput,
                response:`today is ${moment().format("dddd")}`
            });
              case 'get_month':
              return res.json({
                type,
                userInput:gemResult.userInput,
                response:`current time is ${moment().format("MMM")}`
            });
 case'google_search':
 case'youtube_search':
 case'youtube_play':
 case'general':
 case'calculator_open':
 case'instagram_open':
 case'facebook_open':
 case'weather-show':
return res.json({
    type,
    userInput:gemResult.userInput,
    response:gemResult.response
})

 default:
        return res.json({
          type: "general",
          userInput: command,
          response: "Sorry, I couldn't understand that."
        })
    


     }
    } catch (error) {
    console.error(error)
    return res.status(500).json({
      type: "general",
      response: "Ask assistant error"
    })
  }
}