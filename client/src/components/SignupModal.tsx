import React, { useState } from "react";
import * as z from "zod";
import { SignupSchema } from "../schema";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { API_BACKEND_URL } from "../constants";

interface SignupModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

type SignUpFormData = {
  email: string;
  password: string;
  username: string;
  confirmPassword: string;
};

const signup = async (formData: SignUpFormData) => {
  try {
    const response = await fetch(`${API_BACKEND_URL}/signup`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.error || "Failed to log in.");
      (error as FetchError).response = response; // Attach the response object
      throw error;
    }
    return await response.json();
  } catch (e) {
    const error = e as FetchError;
    throw error;
  }
};

function SignupModal({ onClose, onSwitchToLogin }: SignupModalProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const signUpMutation = useMutation({
    mutationFn: signup,
    onSuccess(data) {
      toast.success(`${data.message}`, {
        position: "top-center",
        duration: 5000,
      });
      onClose();
    },
    onError: (err: FetchError) => {
      if (err.response?.status === 409) {
        toast.error("Username or email is already taken", {
          position: "top-center",
          duration: 3000,
        });
      }
      if (err.response?.status === 400) {
        toast.error(err.message, {
          position: "top-center",
          duration: 3000,
        });
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      SignupSchema.parse(formData);
      setErrors({});
      signUpMutation.mutate(formData);
      // onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path && err.path[0] && !newErrors[err.path[0]]) {
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
      <div className="bg-white px-8 pt-8 pb-4 rounded-lg w-96 sm:w-2/4 md:w-2/4 lg:w-1/3 flex flex-col">
        <h2 className="text-2xl font-semibold mb-4">Signup</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username:
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password:
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>
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
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign Up
            </button>
          </div>
        </form>
        <p className="mt-4  self-center">
          Already have an account?&nbsp;
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}

export default SignupModal;
