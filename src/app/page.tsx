"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home } from "@/components/home";

export default function HomePage() {
  const pathname = usePathname();
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("accessToken");
    }
    return null;
  });
  const [isLogin, setIsLogin] = useState(!!accessToken);

  useEffect(() => {
    // 사용자 로그인 상태 확인
    if (!accessToken || isTokenExpired(accessToken)) {
      router.push("/login"); // 로그인 페이지로 리디렉션
    } else if (!isLogin && pathname !== "/signup") {
      setIsLogin(true);
    }
  }, [accessToken, isLogin, router, pathname]);

  const isTokenExpired = (token: any) => {
    if (!token) return true;

    const parts = token.split(".");
    if (parts.length !== 3) {
      // 토큰이 유효하지 않은 형식일 때 처리
      console.error("Invalid token format:", token);
      return true;
    }

    try {
      const decodedToken = JSON.parse(atob(parts[1]));
      return decodedToken.exp * 1000 < Date.now();
    } catch (error) {
      console.error("Error decoding token:", error);
      return true;
    }
  };

  return <Home accessToken={accessToken} setAccessToken={setAccessToken} />;
}
