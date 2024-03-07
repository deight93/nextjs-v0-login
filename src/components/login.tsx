"use client";

import Link from "next/link";

import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type LoginFormData = {
  email: string;
  password: string;
};

export function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const formData = data as LoginFormData;

    const loginResponse = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const loginResponseData = await loginResponse.json();
    const accessToken = await loginResponseData.data;
    const exp = await loginResponseData.exp;
    const error = await loginResponseData.error;

    if (loginResponse.ok) {
      sessionStorage.setItem("accessToken", accessToken);
      router.push("/");
    } else if (error === "INVALID_PASSWORD") {
      alert("아이디 또는 패스워드를 확인하세요.");
    } else if (error === "ALREADY_LOGIN") {
      alert("로그인중입니다.");
    }
  };

  const handleButtonClick = (e: any) => {
    handleSubmit(e);
  };

  const handleOnKeyPress = (e: any) => {
    if (e.key !== "Enter") return;
    handleButtonClick(e);
  };

  return (
    <div className="flex items-center min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Enter your email below to login to your account
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleOnKeyPress}>
          <div className="py-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="example@example.com"
                required
                type="email"
                {...register("email")}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                required
                type="password"
                {...register("password")}
              />
            </div>
            <div className="space-y-4">
              <Button className="w-full bg-red-500">Login</Button>
            </div>
          </div>
        </form>
        <div className="text-center text-sm">
          Dont have an account?
          <Link className="underline" href="/signup">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
