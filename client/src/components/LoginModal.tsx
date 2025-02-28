import React, { useState } from "react";
import * as z from "zod";
import { LoginSchema } from "../schema";
import { API_BACKEND_URL } from "../constants";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "../context/SessionContext";

interface LoginModalProps {
  onClose: () => void;
  onSwitchToSignup: () => void;
}

type LoginFormData = {
  email: string;
  password: string;
};

const authenticate = async (formData: LoginFormData) => {
  try {
    const response = await fetch(`${API_BACKEND_URL}/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to log in.");
    }
    return await response.json();
  } catch (e) {
    const error = e as Error;
    throw new Error(error.message);
  }
};

function LoginModal({ onClose, onSwitchToSignup }: LoginModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { updateSession } = useSession();
  const loginMutation = useMutation({
    mutationFn: authenticate,
    onSuccess(data) {
      updateSession({ token: data.token, uname: data.uname });
      onClose();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      LoginSchema.parse(formData);
      setErrors({});
      loginMutation.mutate(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path && err.path[0]) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        console.error("Unknown error:", error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end sm:items-center z-20 pb-4">
      <div className="bg-white px-8 pt-10 rounded-lg w-96 h-96 sm:w-2/4 md:w-2/4 lg:w-1/3 flex flex-col">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email:
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password:
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          {loginMutation.isError && (
            <p className="text-red-500 text-sm mt-2">
              {loginMutation.error instanceof Error
                ? loginMutation.error.message
                : "Login failed."}
            </p>
          )}
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className={`px-4 py-2 text-sm font-medium text-white ${
                loginMutation.isPending ? "bg-indigo-300" : "bg-indigo-600"
              } rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
        <p className="mt-4 self-center">
          Don't have an account?&nbsp;
          <button
            onClick={onSwitchToSignup}
            className="text-blue-600 hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginModal;
