import React, { useState } from "react";
import { Lock } from "lucide-react";
import { adminChangePassword } from "@/lib/api";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cur = currentPassword.trim();
    const newP = newPassword.trim();
    const conf = confirm.trim();
    if (newP.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newP !== conf) {
      toast.error("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await adminChangePassword(cur, newP);
      toast.success("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Change Password" description="Set a new password for your admin account." />
      <div className="max-w-md">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border focus:border-primary outline-none bg-secondary"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="password"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border focus:border-primary outline-none bg-secondary"
                placeholder="New password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="password"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border focus:border-primary outline-none bg-secondary"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
