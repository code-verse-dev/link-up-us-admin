import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Mail, User, Lock, Camera } from "lucide-react";
import { adminMe, adminUpdateProfile, adminChangePassword, adminUploadAvatar, adminAvatarUrl } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { toast } from "sonner";

type Tab = "account" | "password";

export default function Profile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam === "password" ? "password" : "account"
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const t = searchParams.get("tab");
    setActiveTab(t === "password" ? "password" : "account");
  }, [searchParams]);

  useEffect(() => {
    adminMe()
      .then((res) => {
        if (res.data) {
          setName(res.data.name ?? "");
          setEmail(res.data.email ?? "");
          setAvatarUrl(res.data.avatarUrl ?? null);
        }
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const setTab = (tab: Tab) => {
    setActiveTab(tab);
    setSearchParams(tab === "password" ? { tab: "password" } : {});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    const em = email.trim();
    if (!n || !em) {
      toast.error("Name and email are required");
      return;
    }
    setSaving(true);
    try {
      await adminUpdateProfile({ name: n, email: em });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please choose an image file (PNG, JPG, GIF, WebP)");
      return;
    }
    setUploadingAvatar(true);
    try {
      const res = await adminUploadAvatar(file);
      if (res.data?.avatarUrl) {
        setAvatarUrl(res.data.avatarUrl);
        toast.success("Profile photo updated");
        window.dispatchEvent(new CustomEvent("admin-updated", { detail: res.data }));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cur = currentPassword.trim();
    const newP = newPassword.trim();
    const conf = confirmPassword.trim();
    if (newP.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newP !== conf) {
      toast.error("New passwords do not match");
      return;
    }
    setPasswordLoading(true);
    try {
      await adminChangePassword(cur, newP);
      toast.success("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabClass = (tab: Tab) =>
    `px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
      activeTab === tab
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your admin account details and security."
      />
      <div className="max-w-xl space-y-6">
        <div className="flex gap-2 p-1 rounded-xl bg-muted/50 border border-border w-fit">
          <button
            type="button"
            onClick={() => setTab("account")}
            className={tabClass("account")}
          >
            Account
          </button>
          <button
            type="button"
            onClick={() => setTab("password")}
            className={tabClass("password")}
          >
            Change password
          </button>
        </div>

        {activeTab === "account" && (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h2 className="text-lg font-semibold">Account details</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Update your name, email, and profile photo.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl overflow-hidden border-2 border-border">
                    {adminAvatarUrl(avatarUrl) ? (
                      <img src={adminAvatarUrl(avatarUrl)!} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      (name || email || "A").charAt(0).toUpperCase()
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleAvatarChange}
                      disabled={uploadingAvatar}
                    />
                  </label>
                </div>
                <div>
                  <p className="font-medium text-foreground">Profile photo</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {uploadingAvatar ? "Uploading…" : "Click the camera icon to change your photo."}
                  </p>
                </div>
              </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-secondary focus:border-primary outline-none"
                    placeholder="Your name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-secondary focus:border-primary outline-none"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </form>
            </div>
          </div>
        )}

        {activeTab === "password" && (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h2 className="text-lg font-semibold">Change password</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Set a new password for your admin account.</p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border focus:border-primary outline-none bg-secondary"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border focus:border-primary outline-none bg-secondary"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border focus:border-primary outline-none bg-secondary"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                {passwordLoading ? "Updating…" : "Update password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
