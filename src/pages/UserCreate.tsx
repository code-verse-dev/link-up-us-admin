import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminUserCreate, clustersList, type Cluster } from "@/lib/api";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft } from "lucide-react";

const initialForm = {
  email: "",
  password: "",
  name: "",
  businessName: "",
  region: "",
  industry: "",
  status: "active" as "active" | "inactive",
  memberId: "",
};

export default function UserCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [regions, setRegions] = useState<Cluster[]>([]);

  useEffect(() => {
    clustersList({ active: "true" })
      .then((r) => setRegions(r.data ?? []))
      .catch(() => setRegions([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const password = form.password.trim();
    if (!form.email?.trim() || !password || !form.name?.trim() || !form.businessName?.trim() || !form.region?.trim()) {
      toast.error("Fill all required fields");
      return;
    }
    setSaving(true);
    try {
      const res = await adminUserCreate({
        email: form.email.trim(),
        password,
        name: form.name.trim(),
        businessName: form.businessName.trim(),
        region: form.region,
        industry: form.industry?.trim() || undefined,
        status: form.status,
        memberId: form.memberId?.trim() || undefined,
      });
      toast.success("User created");
      const id = res.data?._id;
      navigate(id ? `/users/${id}` : "/users");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Add user" description="Create a new member account." />

      <div className="max-w-lg space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Email <span className="text-destructive">*</span></label>
              <input
                type="email"
                required
                placeholder="Email"
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Password <span className="text-destructive">*</span></label>
              <input
                type="password"
                required
                placeholder="Password"
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Name <span className="text-destructive">*</span></label>
              <input
                type="text"
                required
                placeholder="Name"
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Business name <span className="text-destructive">*</span></label>
              <input
                type="text"
                required
                placeholder="Business name"
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary"
                value={form.businessName}
                onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Region <span className="text-destructive">*</span></label>
              <select
                required
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary"
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
              >
                <option value="">Select region</option>
                {regions.map((r) => (
                  <option key={r._id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Industry</label>
              <input
                type="text"
                placeholder="Industry"
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary"
                value={form.industry}
                onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Member ID (optional)</label>
              <input
                type="text"
                placeholder="Member ID"
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary"
                value={form.memberId}
                onChange={(e) => setForm((f) => ({ ...f, memberId: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "active" | "inactive" }))}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Link to="/users" className="flex-1 py-2 rounded-lg border border-border text-center">
                Cancel
              </Link>
              <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">
                {saving ? "Creating…" : "Create user"}
              </button>
            </div>
          </form>
        </div>
        <Link to="/users" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to users
        </Link>
      </div>
    </>
  );
}
