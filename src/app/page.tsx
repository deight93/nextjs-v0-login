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
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    return decodedToken.exp * 1000 < Date.now();
  };

  return <Home accessToken={accessToken} setAccessToken={setAccessToken} />;
}
