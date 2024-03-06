"use client";

import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type UserData = {
  first_name: string;
  last_name: string;
  email: string;
};

export function Home({
  accessToken,
  setAccessToken,
}: {
  accessToken: any;
  setAccessToken: any;
}) {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [expirationTime, setExpirationTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<string>("");

  useEffect(() => {
    getUser(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (expirationTime !== null) {
      const timer = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const remainingSeconds = expirationTime - now;
        if (remainingSeconds <= 0) {
          setExpirationTime(0);
          return;
        }
        const hours = Math.floor(remainingSeconds / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = remainingSeconds % 60;
        setRemainingTime(
          `${hours < 10 ? "0" + hours : hours}:${
            minutes < 10 ? "0" + minutes : minutes
          }:${seconds < 10 ? "0" + seconds : seconds}`
        );
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [expirationTime]);

  const getUser = async (accessToken: any) => {
    try {
      const response = await fetch("/api/home", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseData = await response.json();
      setUserData(responseData.data);
      setExpirationTime(responseData.exp);
    } catch (error) {
      console.error("Error fetching expiration time:", error);
    }
  };

  const handleResetSessionTime = async () => {
    try {
      const response = await fetch("/api/refresh-token", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        // 토큰 갱신이 성공했을 때 처리
        const responseData = await response.json();
        const newToken = responseData.data;
        sessionStorage.setItem("accessToken", newToken);
        setAccessToken(newToken);
        // 세션 갱신 후 홈 페이지로 이동
        router.push("/");
      } else {
        // 토큰 갱신이 실패했을 때 처리
        console.error("Failed to refresh token:", response.status);
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  };

  const handleLogout = (e: any) => {
    sessionStorage.removeItem("accessToken");
    router.push("/login");
  };

  return (
    <div className="flex items-center min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto space-y-4">
        <div className="space-y-2">
          <h1 className="py-5 text-3xl font-bold">Home Page</h1>
          {userData && (
            <div className="py-5 space-y-2">
              <div>
                <span className="font-semibold">Name:</span>{" "}
                {userData.first_name} {userData.last_name}
              </div>
              <div>
                <span className="font-semibold">ID:</span> {userData.email}
              </div>
              <div>
                <span className="font-semibold">Session Time:</span>{" "}
                {remainingTime !== "" ? remainingTime : "Loading..."}
              </div>
            </div>
          )}
          <div className="py-5 space-y-2">
            <Button
              onClick={handleResetSessionTime}
              className="w-full bg-red-500"
            >
              Reset Session Time
            </Button>
            <Button onClick={handleLogout} className="w-full mt-4 bg-red-500">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
