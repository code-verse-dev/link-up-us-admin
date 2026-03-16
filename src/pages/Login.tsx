import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ChevronRight } from "lucide-react";
import { adminLogin } from "@/lib/api";
import { toast } from "sonner";
import logoUrl from "@/assets/linkup-logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminLogin(email.trim(), password.trim());
      if (res.status && res.data?.token) {
        localStorage.setItem("admin_token", res.data.token);
        toast.success("Welcome back!");
        navigate("/");
      } else {
        toast.error(res.message || "Login failed");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary py-12 px-4">
      <div className="max-w-md w-full bg-card p-10 rounded-3xl shadow-xl border border-border">
        <div className="text-center mb-8">
          <img src={logoUrl} alt="Link-up.us" className="h-12 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-extrabold text-primary">Link-up.us Admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to the admin portal.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-border focus:border-primary outline-none bg-secondary"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-border focus:border-primary outline-none bg-secondary"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
