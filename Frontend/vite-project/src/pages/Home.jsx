import React, { useState, useContext, useEffect, useRef} from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from "axios"
function Home() {
  const {userData, serverUrl, setUserData, getGeminiResponse}=useContext(userDataContext)
  const navigate=useNavigate()
  
  const recognitionRef = useRef(null)
  const isRecognizingRef = useRef(false)
  const isSpeakingRef = useRef(false)
 const [listening,setListening]=useState(false)

  const synth=window.speechSynthesis
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

const startRecognition = ()=>{
  try{
    recognitionRef.current?.start();
    setListening(true);
  }
  catch (error){
    if(!error.message.includes("start")){
      console.error("Recognition error:", error);
    }
  }
  };








  const speak =(text)=>{
    const utterence=new SpeechSynthesisUtterance(text)
    isSpeakingRef.current=true
    utterence.onend = () => {
  isSpeakingRef.current = false
  startRecognition()
}
     synth.speak(utterence)
  }


const handleCommand =(data)=>{
  const {type,userInput, response}=data
speak(response);

if(type ==='google_search'){
  const query = encodeURIComponent(userInput);
  window.open(`http://www.google.com/search?q=${query}`,
  '_blank');
}
if (type === 'calculator_open'){
  window.open(`https://www.google.com/search?q=calculator`,
    '_blank');
}
if(type ==="instagram_open"){
  window.open(`http://www.instagram.com/`, '_blank')
}
 if(type ==="facebook_open"){
  window.open(`http://www.facebook.com/`, '_blank');
}
if(type ==="weather_show"){
  window.open(`https://www.google.com/search?q=weather`, '_blank')
}
if(type === 'youtube_search' || type ==='youtube_play'){
  const query = encodeURIComponent(userInput);
  window.open(`http://www.youtube.com/results?search_query=$
    {query}`, 'blank');

}
 
}







useEffect(()=>{
  const SpeechRecognition=window.SpeechRecognition || window.webkitSpeechRecognition
  
  const recognition= new SpeechRecognition()
  recognition.continuous=true,
  recognition.lang='en-IN'


  recognitionRef.current=recognition

const isRecognizingRef={current:false}

const safeRecognition=()=>{
  if(!isSpeakingRef.current && !isRecognizingRef.current){
  try{
       recognition.start();
       console.log("Recognition requested to start");
  }catch(err){
 if(err.name !== "InvalidStateError"){
  console.error("start error:",err);
 }
  }
}

}

recognition.onstart=()=>{
  console.log("Recognition started");
  isRecognizingRef.current =true;
  setListening(true);
}

recognition.onend=()=>{
  console.log("Recognition ended");
  isRecognizingRef.current =false;
  setListening(false);
}

if(!isSpeakingRef.current)
{
setTimeout(()=>{
  safeRecognition();
},1000);
}
 
recognition.onerror=(event)=>{
  console.log("Recognition error:", event.error);
  isRecognizingRef.current=false;
  setListening(false);
  if(event.error !== "aborted && !isSpeakingRef.current"){
    setTimeout(()=>{
      safeRecognition();

    },1000);
  }
};


recognition.onresult = async(e)=>{
const transcript = e.results[e.results.length-1][0].transcript.trim()
console.log("heard :" + transcript)

if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
  recognition.stop()
  isRecognizingRef.current=false
  setListening(false)
  const data = await getGeminiResponse(transcript)


    handleCommand(data)
  }
}

const fallback=setInterval(()=>{
    if(!isSpeakingRef.current && !isRecognizingRef.current){
      safeRecognition()}
},10000)
safeRecognition()
return()=>{
  recognition.stop()
  setListening(false)
 isRecognizingRef.current=false
  clearInterval(fallback)
}
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

export default Home;
