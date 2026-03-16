import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { adminUserGet, adminUserBanners, adminUserDelete, adminUserUpdateMemberId, apiUrl, type AdminUser } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft, Pencil, Trash2, Image, CreditCard, X, Calendar } from "lucide-react";

function resolveBannerUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("http")) return url;
  return apiUrl(url.startsWith("/") ? url : `/${url}`);
}

export default function UserView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberIdModal, setMemberIdModal] = useState(false);
  const [newMemberId, setNewMemberId] = useState("");
  const [savingMemberId, setSavingMemberId] = useState(false);

  useEffect(() => {
    if (!id) return;
    adminUserGet(id)
      .then((r) => setUser(r.data ?? null))
      .catch(() => toast.error("User not found"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user?._id) return;
    adminUserBanners(user._id)
      .then((r) => setBannerUrl(r.data?.partnerBannerUrl ?? null))
      .catch(() => setBannerUrl(null));
  }, [user?._id]);

  const handleDelete = async () => {
    if (!user || !confirm("Delete this user?")) return;
    try {
      await adminUserDelete(user._id);
      toast.success("User deleted");
      navigate("/users");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const handleUpdateMemberId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMemberId.trim()) return;
    setSavingMemberId(true);
    try {
      await adminUserUpdateMemberId(user._id, newMemberId.trim());
      toast.success("Member ID updated");
      setMemberIdModal(false);
      setNewMemberId("");
      const r = await adminUserGet(user._id);
      setUser(r.data ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSavingMemberId(false);
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
        title={user.businessName || user.name || user.email}
        description="Member account details."
      >
        <div className="flex gap-2">
          <Link
            to={`/users/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
          >
            <Pencil className="w-4 h-4" /> Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </PageHeader>

      <div className="space-y-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Account</h3>
            <dl className="grid gap-4">
              <div>
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Member ID</dt>
                <dd className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-semibold">{user.memberId || "—"}</span>
                  <button
                    type="button"
                    onClick={() => { setNewMemberId(user.memberId || ""); setMemberIdModal(true); }}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-border hover:bg-muted text-xs font-medium"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Change
                  </button>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Email</dt>
                <dd className="font-medium">{user.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Name</dt>
                <dd>{user.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Business name</dt>
                <dd>{user.businessName || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Join date</dt>
                <dd className="flex items-center gap-1.5 text-muted-foreground">
                  {user.createdAt ? (
                    <>
                      <Calendar className="w-4 h-4" />
                      {format(new Date(user.createdAt), "MMMM d, yyyy")}
                    </>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
            </dl>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Details</h3>
            <dl className="grid gap-4">
              <div>
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Region</dt>
                <dd>{user.region || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Industry</dt>
                <dd>{user.industry || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Status</dt>
                <dd>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${user.status === "active" ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                    {user.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <Image className="w-4 h-4" /> Partner banner
          </h3>
          {bannerUrl ? (
            <img src={resolveBannerUrl(bannerUrl) ?? ""} alt="Banner" className="max-w-full rounded-xl border border-border" />
          ) : (
            <p className="text-muted-foreground text-sm">No banner URL set.</p>
          )}
        </div>

        <Link to="/users" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to users
        </Link>
      </div>

      {memberIdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">Change member ID</h3>
              <button onClick={() => { setMemberIdModal(false); setNewMemberId(""); }} className="p-2 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdateMemberId} className="space-y-3">
              <input
                type="text"
                required
                placeholder="New member ID"
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary"
                value={newMemberId}
                onChange={(e) => setNewMemberId(e.target.value)}
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => { setMemberIdModal(false); setNewMemberId(""); }} className="flex-1 py-2 rounded-lg border border-border">Cancel</button>
                <button type="submit" disabled={savingMemberId} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
