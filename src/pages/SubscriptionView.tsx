import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminSubscriptionGet, adminSubscriptionCancel, adminSubscriptionExtend, type AdminSubscription } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft, CalendarPlus, XCircle } from "lucide-react";

export default function SubscriptionView() {
  const { id } = useParams<{ id: string }>();
  const [sub, setSub] = useState<AdminSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [extendDays, setExtendDays] = useState(30);
  const [showExtend, setShowExtend] = useState(false);

  useEffect(() => {
    if (!id) return;
    adminSubscriptionGet(id)
      .then((r) => setSub(r.data ?? null))
      .catch(() => toast.error("Subscription not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async (atPeriodEnd: boolean) => {
    if (!id || !confirm(atPeriodEnd ? "Cancel at period end?" : "Cancel immediately?")) return;
    setSaving(true);
    try {
      await adminSubscriptionCancel(id, atPeriodEnd);
      toast.success(atPeriodEnd ? "Set to cancel at period end" : "Subscription canceled");
      const r = await adminSubscriptionGet(id);
      setSub(r.data ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleExtend = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await adminSubscriptionExtend(id, extendDays);
      toast.success("Period extended");
      setShowExtend(false);
      const r = await adminSubscriptionGet(id);
      setSub(r.data ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
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
  if (!sub) {
    return (
      <>
        <PageHeader title="Subscription not found" />
        <Link to="/subscriptions" className="text-primary hover:underline">← Back to subscriptions</Link>
      </>
    );
  }

  const user = sub.userId as { _id: string; memberId: string; email: string; name: string; businessName: string } | undefined;
  const plan = sub.planId as { name: string; priceCents?: number; interval?: string } | undefined;

  return (
    <>
      <PageHeader
        title={`Subscription – ${user?.businessName || user?.email || sub._id}`}
        description="Subscription details and actions."
      />

      <div className="max-w-2xl space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <dl className="grid gap-3">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Member / Email</dt>
              <dd>
                <div className="font-mono text-sm">{user?.memberId}</div>
                <div className="text-sm text-muted-foreground">{user?.email}</div>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Plan</dt>
              <dd>{plan ? `${plan.name} – $${((plan.priceCents ?? 0) / 100).toFixed(2)}/${plan.interval || "mo"}` : "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd>
                <span className={`px-2 py-0.5 rounded text-xs ${sub.status === "active" ? "bg-green-100 text-green-800" : sub.status === "canceled" ? "bg-muted" : "bg-amber-100 text-amber-800"}`}>
                  {sub.status}
                  {sub.cancelAtPeriodEnd ? " (cancel at end)" : ""}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Current period end</dt>
              <dd className="text-sm">{sub.currentPeriodEnd ? format(new Date(sub.currentPeriodEnd), "PP") : "—"}</dd>
            </div>
          </dl>
        </div>

        {sub.status === "active" && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowExtend(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted"
              >
                <CalendarPlus className="w-4 h-4" /> Extend period
              </button>
              <button onClick={() => handleCancel(true)} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted">
                <XCircle className="w-4 h-4" /> Cancel at period end
              </button>
              <button onClick={() => handleCancel(false)} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20">
                Cancel immediately
              </button>
            </div>
            {showExtend && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Extend current period (days, no new charge)</p>
                <div className="flex gap-2">
                  <input type="number" min={1} max={365} value={extendDays} onChange={(e) => setExtendDays(parseInt(e.target.value, 10) || 30)} className="w-24 px-3 py-2 rounded-lg border border-border" />
                  <button onClick={handleExtend} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">Extend</button>
                  <button onClick={() => setShowExtend(false)} className="px-4 py-2 rounded-lg border border-border">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        <Link to="/subscriptions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to subscriptions
        </Link>
      </div>
    </>
  );
}
