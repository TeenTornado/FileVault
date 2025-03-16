import React, { useState } from "react";
import { Globe, ChevronDown, Lock, Mail } from "lucide-react";
import axios from "axios";

interface LoginProps {
  onLoginSuccess: (userId: string, email: string, token: string) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const API_URL = "http://localhost:5000/api";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const endpoint = isSignUp ? "/register" : "/login";
      console.log(`Sending request to: ${API_URL}${endpoint}`);

      const response = await axios.post(`${API_URL}${endpoint}`, {
        email,
        password,
      });

      console.log("Response received:", response.data);

      if (!isSignUp && response.data.token) {
        onLoginSuccess(
          response.data.user_id,
          response.data.email,
          response.data.token
        );
      } else if (isSignUp) {
        setSuccessMessage("Registration successful! You can now log in.");
        setIsSignUp(false);
      }
    } catch (err: any) {
      console.error("Error during authentication:", err);
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 to-blue-100">
      {/* Left side - Visual */}
      <div className="w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 p-12 flex flex-col relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-indigo-300"></div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h1 className="text-5xl font-bold text-white mb-8">
            {isSignUp ? "Join FileVault" : "Welcome Back"}
          </h1>
          <p className="text-blue-100 text-xl mb-16 max-w-md">
            {isSignUp
              ? "Create an account to securely store and manage your important files in one place."
              : "Sign in to access your secure file storage and management system."}
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-xl border border-white border-opacity-20 transform transition-all hover:scale-105">
              <h3 className="text-white font-semibold mb-2">Secure Storage</h3>
              <p className="text-blue-100">
                End-to-end encrypted cloud storage for your files
              </p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-xl border border-white border-opacity-20 transform transition-all hover:scale-105">
              <h3 className="text-white font-semibold mb-2">Easy Access</h3>
              <p className="text-blue-100">
                Access your files from any device, anywhere
              </p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-xl border border-white border-opacity-20 transform transition-all hover:scale-105">
              <h3 className="text-white font-semibold mb-2">Organized Files</h3>
              <p className="text-blue-100">
                Smart organization tools to keep everything in order
              </p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-xl border border-white border-opacity-20 transform transition-all hover:scale-105">
              <h3 className="text-white font-semibold mb-2">File Sharing</h3>
              <p className="text-blue-100">
                Share files securely with custom permissions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login/Registration form */}
      <div className="w-1/2 p-12 flex flex-col">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer">
            <Globe size={18} />
            <span>English</span>
            <ChevronDown size={14} />
          </div>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setSuccessMessage("");
            }}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {isSignUp ? "Already have an account?" : "Need an account?"}
          </button>
        </div>

        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-gray-800">FileVault</h1>
            <p className="text-gray-600">
              {isSignUp
                ? "Create an account to get started"
                : "Sign in to your account"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center">
              <span className="w-full">{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg border border-green-100 flex items-center">
              <span className="w-full">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full p-4 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white bg-opacity-80"
                required
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-4 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white bg-opacity-80"
                required
                disabled={isLoading}
              />
            </div>
            {!isSignUp && (
              <div className="flex justify-end">
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-lg hover:opacity-90 disabled:opacity-50 transform transition-transform hover:scale-[1.01] font-medium"
              disabled={isLoading}
            >
              {isLoading
                ? "Please wait..."
                : isSignUp
                ? "Create account"
                : "Sign in"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            By {isSignUp ? "creating an account" : "signing in"}, you agree to
            our
            <br />
            BATMAN
          </div>
        </div>
      </div>
    </div>
  );
}
