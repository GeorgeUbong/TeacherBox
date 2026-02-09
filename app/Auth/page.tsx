"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // 1. Add state for inputs and errors
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Reset error on new attempt

    // 2. Add validation logic
    setTimeout(() => {
      if (email === "admin@gmail" && password === "innov8") {
        setLoading(false);
        router.push("/dashboard");
      } else {
        setLoading(false);
        setError("Invalid email or password. Please try again.");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-white">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg
         border border-[#267CD1] space-y-4"
      >
        <h1 className="text-2xl font-bold text-[#267CD1] text-center">Login to BridgeBox</h1>
        <p className="text-sm text-slate-400 text-center">Enter email and password to continue</p>

        {/* 3. Display Error Message */}
        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-900/30 border 
          border-red-500/50 rounded-lg">
            {error}
          </div>
        )}

        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@gmail"
          className="w-full px-4 py-2 rounded-lg bg-white text-black 
          border border-[#267CD1] focus:outline-none focus:ring-2 focus:ring-[#267CD1]"
        />

        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="innov8"
          className="w-full px-4 py-2 rounded-lg bg-white text-black border 
          border-[#267CD1] focus:outline-none focus:ring-2 focus:ring-[#267CD1]"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center 
          gap-2 py-2 rounded-lg bg-[#267CD1] hover:bg-white
       hover:text-[#267CD1] border border-[#267CD1] disabled:opacity-60 transition-colors text-white"
        >
          {loading && (
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {loading ? "Verifying..." : "Login"}
        </button>
      </form>
    </div>
  );
}