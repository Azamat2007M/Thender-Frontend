"use client";

import { GoogleLogin } from '@react-oauth/google';
import { useState, memo, useCallback } from 'react'; 

export const GoogleAuthButton = memo(function GoogleAuthButton() {
  const [error, setError] = useState("");

  const handleGoogleSuccess = useCallback(async (credentialResponse: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Google authentication failed");
      }

      localStorage.setItem("username", data.user.username);

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message);
      console.error("Google Auth Error:", err);
    }
  }, []);

  const handleGoogleError = useCallback(() => {
    setError("Google Sign-In failed. Try again.");
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full my-2">
      {error && (
        <div className="text-red-500 text-xs font-bold mb-2">{error}</div>
      )}
      
      <div className="w-full flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
          theme="outline"
          size="large"
          shape="pill"
          width="360"
        />
      </div>
      
      <div className="relative flex py-3 items-center w-full">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-black uppercase tracking-wider">or</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>
    </div>
  );
});