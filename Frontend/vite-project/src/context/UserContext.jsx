import axios from "axios";
import React, { createContext, useEffect, useState } from "react";

export const userDataContext = createContext();

function UserContext({ children }) {
  const serverUrl = "https://virtualassistant-backend-faia.onrender.com";

  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
      });

      setUserData(result?.data?.user ?? result?.data);
    } catch (error) {
      console.log(
        error?.response?.status,
        error?.response?.data?.message || error?.message
      );
      setUserData(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const getGeminiResponse = async (command) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/user/asktoassistant`,
        { command },
        { withCredentials: true }
      );

      return result?.data;
    } catch (error) {
      console.error(
        "Gemini API error:",
        error?.response?.status,
        error?.response?.data?.message || error?.message
      );

      return {
        response: "Something went wrong. Please try again.",
      };
    }
  };

  useEffect(() => {
    handleCurrentUser();
  }, []);

  const value = {
    serverUrl,
    userData,
    setUserData,
    authLoading,
    backendImage,
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage,
    getGeminiResponse,
  };

  return (
    <div>
      <userDataContext.Provider value={value}>
        {children}
      </userDataContext.Provider>
    </div>
  );
}

export default UserContext;