import React, { useState, useContext, useEffect, useRef } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } =
    useContext(userDataContext);

  const navigate = useNavigate();

  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const processingRef = useRef(false); // ⭐ blocks mic re-arm while thinking
  const greetedRef = useRef(false); // ⭐ greet only once

  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [ham, setHam] = useState(false);

  /* ================= LOGOUT ================= */
  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      setUserData(null);
      navigate("/signin");
    } catch (err) {
      setUserData(null);
      console.log(err);
    }
  };

  /* ================= SPEECH ================= */
  const startRecognition = () => {
    try {
      recognitionRef.current?.start();
    } catch {}
  };

  const speak = (text) => {
    if (!text) return;

    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();

    const voice =
      voices.find(v => v.name.includes("Google") && v.lang === "en-IN") ||
      voices.find(v => v.lang === "en-IN") ||
      voices.find(v => v.name.includes("Google")) ||
      voices[0];

    const chunks = text.match(/.{1,120}/g) || [];

    isSpeakingRef.current = true;

    const speakChunk = (i) => {
      if (i >= chunks.length) {
        // finished speaking -> allow listening again
        isSpeakingRef.current = false;
        setTimeout(startRecognition, 400);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[i]);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }
      utterance.rate = 0.9;

      utterance.onend = () => speakChunk(i + 1);
      window.speechSynthesis.speak(utterance);
    };

    speakChunk(0);
  };

  /* ================= GREET USER ================= */
  const greetUser = () => {
    if (greetedRef.current) return; // ⭐ only once
    greetedRef.current = true;

    const greeting = `Hello ${userData?.name || "User"}, my name is ${
      userData?.assistantName
    }. What can I help you with?`;

    setAiText(greeting);
    speak(greeting);
  };

  /* ================= COMMAND HANDLER ================= */
  const handleCommand = (data) => {
    const { type, userInput, response } = data;

    setAiText(response);
    speak(response);

    if (type === "google_search_query" || type === "google_search") {
      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(userInput)}`,
        "_blank"
      );
    }

    if (type === "calculator_open") {
      window.open("https://www.google.com/search?q=calculator", "_blank");
    }

    if (type === "instagram_open") {
      window.open("https://www.instagram.com/", "_blank");
    }

    if (type === "facebook_open") {
      window.open("https://www.facebook.com/", "_blank");
    }

    if (type === "weather_show") {
      window.open("https://www.google.com/search?q=weather", "_blank");
    }

    if (
      type === "youtube_search" ||
      type === "youtube_play" ||
      type === "youtube_open"
    ) {
      window.open(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(
          userInput
        )}`,
        "_blank"
      );
    }
  };

  /* ================= SPEECH RECOGNITION ================= */
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    recognition.onresult = async (e) => {
      const transcript = e.results[0][0].transcript.trim();

      if (
        transcript
          .toLowerCase()
          .includes(userData.assistantName.toLowerCase())
      ) {
        recognition.stop();
        processingRef.current = true; // ⭐ hold mic until response is spoken
        setUserText(transcript);
        setAiText("Thinking...");

        try {
          const data = await getGeminiResponse(transcript);
          handleCommand(data);
        } catch (err) {
          setAiText("Sorry, something went wrong. Please try again.");
          speak("Sorry, something went wrong. Please try again.");
      } finally {
          processingRef.current = false;
        }
      }
    };

    recognition.onend = () => {
      // restart ONLY when idle (not speaking, not processing)
      if (!isSpeakingRef.current && !processingRef.current) {
        setTimeout(startRecognition, 400);
      }
    };

    recognition.onerror = () => {
      if (!isSpeakingRef.current && !processingRef.current) {
        setTimeout(startRecognition, 400);
      }
    };

    // ⭐ greet first, then listen
    setTimeout(() => {
      greetUser();
    }, 800);

    return () => recognition.stop();
  }, []);

  /* ================= LOAD VOICES ================= */
  useEffect(() => {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }, []);

  /* ================= UI ================= */
  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#02023d] flex flex-col justify-center items-center gap-[15px] relative">

      <div className="hidden lg:flex absolute top-[20px] right-[20px] gap-4 z-50">
        <button
          onClick={handleLogOut}
          className="bg-white px-6 py-3 rounded-full font-semibold"
        >
          Log Out
        </button>

        <button
          onClick={() => navigate("/customize")}
          className="bg-white px-6 py-3 rounded-full font-semibold"
        >
          Customize Assistant
        </button>
      </div>

      <CgMenuRight
        className="lg:hidden text-white absolute top-[20px] right-[20px]"
        onClick={() => setHam(true)}
      />

      <div
        className={`absolute lg:hidden top-0 w-full h-full bg-black/50 backdrop-blur-lg p-6 z-50 ${
          ham ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <RxCross1
          className="text-white absolute top-5 right-5"
          onClick={() => setHam(false)}
        />

        <button
          className="bg-white rounded-full h-[60px] font-semibold mt-10"
          onClick={handleLogOut}
        >
          Log Out
        </button>

        <button
          className="bg-white rounded-full h-[60px] font-semibold"
          onClick={() => navigate("/customize")}
        >
          Customize Assistant
        </button>
      </div>

      <div className="w-[300px] h-[400px] rounded-3xl overflow-hidden shadow-lg">
        <img
          src={userData?.assistantImage}
          className="h-full w-full object-cover"
        />
      </div>

      <h1 className="text-white font-semibold">
        I'm {userData?.assistantName}
      </h1>

      {!aiText ? (
        <img src={userImg} className="w-[200px]" />
      ) : (
        <img src={aiImg} className="w-[200px]" />
      )}

      <h1 className="text-white text-center px-4">
        {userText || aiText}
      </h1>
    </div>
  );
}

export default Home;
