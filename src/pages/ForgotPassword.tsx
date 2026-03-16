import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { adminForgotPassword } from "@/lib/api";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResetLink(null);
    try {
      const res = await adminForgotPassword(email);
      setSent(true);
      if (res.data?.resetLink) setResetLink(res.data.resetLink);
      toast.success(res.data?.message || "If that email exists, a reset link was sent.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary py-12 px-4">
        <div className="max-w-md w-full bg-card p-10 rounded-3xl shadow-xl border border-border text-center">
          <p className="text-muted-foreground mb-4">If an admin account exists for that email, you will receive a reset link.</p>
          {resetLink && (
            <p className="text-sm text-muted-foreground mb-4 break-all">
              Dev reset link: <a href={resetLink} className="text-primary underline">{resetLink}</a>
            </p>
          )}
          <Link to="/login" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary py-12 px-4">
      <div className="max-w-md w-full bg-card p-10 rounded-3xl shadow-xl border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-primary">Forgot password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter your admin email to get a reset link.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="email"
              required
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-border focus:border-primary outline-none bg-secondary"
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
        <p className="mt-6 text-center">
          <Link to="/login" className="text-sm text-primary font-medium hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
