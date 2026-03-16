import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Lock, ChevronRight } from "lucide-react";
import { adminResetPassword } from "@/lib/api";
import { toast } from "sonner";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) toast.error("Missing reset token");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newP = newPassword.trim();
    const conf = confirm.trim();
    if (newP.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newP !== conf) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await adminResetPassword(token, newP);
      setDone(true);
      toast.success("Password reset. You can log in.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary py-12 px-4">
        <div className="max-w-md w-full bg-card p-10 rounded-3xl shadow-xl border border-border text-center">
          <p className="text-muted-foreground mb-4">Your password has been reset.</p>
          <Link to="/login" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-xl font-medium">
            Sign in <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary py-12 px-4">
        <div className="max-w-md w-full bg-card p-10 rounded-3xl shadow-xl border border-border text-center">
          <p className="text-muted-foreground mb-4">Invalid or missing reset token.</p>
          <Link to="/forgot-password" className="text-primary font-medium hover:underline">Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary py-12 px-4">
      <div className="max-w-md w-full bg-card p-10 rounded-3xl shadow-xl border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-primary">Set new password</h1>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="password"
              required
              minLength={6}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-border focus:border-primary outline-none bg-secondary"
              placeholder="New password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="password"
              required
              minLength={6}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-border focus:border-primary outline-none bg-secondary"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Resetting…" : <span className="inline-flex items-center gap-2">Reset password <ChevronRight className="w-5 h-5" /></span>}
          </button>
        </form>
      </div>
    </div>
  );
}
