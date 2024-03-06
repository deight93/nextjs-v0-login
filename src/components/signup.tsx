"use client";

import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SignupFormData = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

export function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const formData = data as SignupFormData;
    const email = formData.email;

    const isEmailResponse = await fetch(
      `/api/signup?email=${encodeURIComponent(email)}`
    );
    const isEmailResponseData = await isEmailResponse.json();
    const isEmail = await isEmailResponseData.data;

    if (isEmail) {
      alert("아이디 있음");
      return;
    }

    const signupResponse = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (signupResponse.ok && !isEmail) {
      alert("회원가입 성공");
      router.push("/login");
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
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Enter your information to create an account
          </p>
        </div>
        <div className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleOnKeyPress}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First name</Label>
                <Input
                  id="first-name"
                  placeholder="John"
                  required
                  {...register("firstName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input
                  id="last-name"
                  placeholder="Doe"
                  required
                  {...register("lastName")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="example@example.com"
                required
                type="email"
                pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                {...register("email")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                required
                type="password"
                {...register("password")}
              />
            </div>
            <div className="py-4 space-y-2">
              <Button
                className="w-full bg-red-500"
                type="submit"
                onClick={handleButtonClick}
              >
                Sign Up
              </Button>
            </div>
          </form>
        </div>
        <div className="text-center text-sm">
          Already have an account?
          <Link className="underline" href="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
