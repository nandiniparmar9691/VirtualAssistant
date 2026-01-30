import React, { useContext, useEffect } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'

function Home() {
  const {userData, serverUrl, setUserData, getGeminiResponse}=useContext(userDataContext)
  const navigate=useNavigate()
  const handleLogOut=async()=>{
    try {
      const result=await axios.get(`${serverUrl}/api/auth/logout`,
        {withCredentials:true})
        setUserData(null)
        navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log(error)
    }
  }

  const speak =(text)=>{
    const utterence=new SpeechSynthesisUtterance(text)
    window.speechSynthesis.speak(utterence)
  }
useEffect(()=>{
  const SpeechRecognition=window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition= new SpeechRecognition()
  recognition.continuous=true,
  recognition.lang='es-IN'
recognition.onresult = async(e)=>{
const transcript = e.results[e.results.length-1][0].transcript.trim()
console.log("heard :" + transcript)

if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
  
  const data = await getGeminiResponse(transcript)
  console.log(data)

    speak(data.response)
  }
}
recognition.start()
  
},[])

  return (
   
   <div className ='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px] '>
      <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold absolute top-[20px] right-[20px] cursor-pointer bg-white rounded-full text-[19px]' onClick={handleLogOut}>Log Out</button>
      <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold bg-white absolute top-[100px] right-[20px] rounded-full cursor-pointer text-[19px] px-[20px] py-[10px]' onClick={()=>navigate("/customize")} >Customize your Assistant</button>
     <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
<img src={userData?.assistantImage} alt="" className='h-full object-cover'/>
      </div>
      <h1 className='text-white text-[18px] font-semibold'>I'am {userData?.assistantName}</h1>
    </div>
  )
}

export default Home
