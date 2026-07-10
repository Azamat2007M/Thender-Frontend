"use client";

import { GoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
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
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Google authentication failed");
      }

      Cookies.set("access_token", data.access_token, { 
        expires: 1, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: "lax" 
      });
      
      Cookies.set("username", data.user.username, { expires: 1 });

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message);
      console.error("Google Auth Error:", err);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full my-2">
      {error && (
        <div className="text-red-500 text-xs font-bold mb-2">{error}</div>
      )}
      
      <div className="w-full flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={useCallback(() => setError("Google Sign-In failed. Try again."), [])}
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