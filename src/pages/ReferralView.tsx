import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminReferralLinkDetails, type AdminReferralLink } from "@/lib/api";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft, Copy, ExternalLink } from "lucide-react";

export default function ReferralView() {
  const { userId } = useParams<{ userId: string }>();
  const [details, setDetails] = useState<{ link: AdminReferralLink; referrals: Array<{ _id: string; businessName: string; region?: string; status: string; createdAt?: string }> } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    adminReferralLinkDetails(userId)
      .then((r) => setDetails(r.data ?? null))
      .catch(() => toast.error("Referral link not found"))
      .finally(() => setLoading(false));
  }, [userId]);

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Copied to clipboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!details) {
    return (
      <>
        <PageHeader title="Referral link not found" />
        <Link to="/referrals" className="text-primary hover:underline">← Back to referral links</Link>
      </>
    );
  }

  const { link, referrals } = details;

  return (
    <>
      <PageHeader
        title={`Referral – ${link.businessName}`}
        description="Referral link and referred members."
      />

      <div className="max-w-2xl space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <dl className="grid gap-3">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Member ID</dt>
              <dd className="font-mono">{link.memberId}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Business</dt>
              <dd>{link.businessName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Referral code</dt>
              <dd className="font-mono">{link.referralCode}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Join URL</dt>
              <dd className="flex items-center gap-2 flex-wrap">
                <span className="text-sm break-all">{link.joinUrl}</span>
                <button onClick={() => copyUrl(link.joinUrl)} className="p-2 rounded hover:bg-muted" title="Copy"><Copy className="w-4 h-4" /></button>
                <a href={link.joinUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded hover:bg-muted" title="Open"><ExternalLink className="w-4 h-4" /></a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Referral count</dt>
              <dd>{link.referralCount}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-3">Referred members ({referrals.length})</h3>
          {referrals.length === 0 ? (
            <p className="text-muted-foreground text-sm">No referrals yet.</p>
          ) : (
            <ul className="space-y-2">
              {referrals.map((r) => (
                <li key={r._id} className="flex justify-between text-sm">
                  <span>{r.businessName}</span>
                  <span className="text-muted-foreground">{r.region ?? ""} · {r.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link to="/referrals" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to referral links
        </Link>
      </div>
    </>
  );
}
