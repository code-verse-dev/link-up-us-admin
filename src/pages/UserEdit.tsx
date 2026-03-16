import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { adminUserGet, adminUserUpdate, adminUserUpdateMemberId, type AdminUser } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft, Calendar } from "lucide-react";

export default function UserEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ email: "", name: "", businessName: "", region: "", industry: "", status: "active" as "active" | "inactive", memberId: "" });
  const [memberIdForm, setMemberIdForm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    adminUserGet(id)
      .then((r) => {
        const u = r.data;
        if (u) {
          setUser(u);
          setForm({
            email: u.email,
            name: u.name ?? "",
            businessName: u.businessName ?? "",
            region: u.region ?? "",
            industry: u.industry ?? "",
            status: (u.status as "active" | "inactive") || "active",
            memberId: u.memberId ?? "",
          });
          setMemberIdForm(u.memberId ?? "");
        }
      })
      .catch(() => toast.error("User not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      await adminUserUpdate(id, {
        name: form.name,
        businessName: form.businessName,
        email: form.email,
        region: form.region,
        industry: form.industry || undefined,
        status: form.status,
      });
      toast.success("User updated");
      navigate(`/users/${id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleMemberIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !memberIdForm.trim()) return;
    setSaving(true);
    try {
      await adminUserUpdateMemberId(id, memberIdForm.trim());
      toast.success("Member ID updated");
      setForm((f) => ({ ...f, memberId: memberIdForm.trim() }));
      if (user) setUser({ ...user, memberId: memberIdForm.trim() });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return (
      <>
        <PageHeader title="User not found" />
        <Link to="/users" className="text-primary hover:underline">← Back to users</Link>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Edit ${user.businessName || user.name || user.email}`}
        description="Update member account details."
      />

      <div className="max-w-2xl space-y-6">
        {user.createdAt && (
          <div className="bg-muted/50 border border-border rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            Join date: {format(new Date(user.createdAt), "MMMM d, yyyy")}
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Account details</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-secondary focus:border-primary outline-none"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-secondary focus:border-primary outline-none"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Business name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-secondary focus:border-primary outline-none"
                value={form.businessName}
                onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Region</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-secondary focus:border-primary outline-none"
                  value={form.region}
                  onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Industry</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-secondary focus:border-primary outline-none"
                  value={form.industry}
                  onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Status</label>
              <select
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-secondary focus:border-primary outline-none"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "active" | "inactive" }))}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Link to={`/users/${id}`} className="flex-1 py-2.5 rounded-lg border border-border text-center font-medium hover:bg-muted">
                Cancel
              </Link>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50">
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Member ID</h3>
          <form onSubmit={handleMemberIdSubmit} className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-secondary font-mono focus:border-primary outline-none"
              value={memberIdForm}
              onChange={(e) => setMemberIdForm(e.target.value)}
              placeholder="Member ID"
            />
            <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50">
              Update ID
            </button>
          </form>
        </div>

        <Link to="/users" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to users
        </Link>
      </div>
    </>
  );
}
