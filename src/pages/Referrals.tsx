import React, { useEffect, useState } from "react";
import { adminReferralLinks, adminReferralLinkDetails, type AdminReferralLink } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Eye, X } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import { SearchFilterBar, SearchFilterBarSearch } from "@/components/SearchFilterBar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const PAGE_SIZE = 10;

export default function Referrals() {
  const [links, setLinks] = useState<AdminReferralLink[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const searchQuery = useDebouncedValue(search, 300);
  const [page, setPage] = useState(0);
  const [details, setDetails] = useState<{ link: AdminReferralLink; referrals: Array<{ _id: string; businessName: string; region?: string; status: string }> } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminReferralLinks({ search: searchQuery || undefined, limit: PAGE_SIZE, skip: page * PAGE_SIZE });
      setLinks(res.data?.links ?? []);
      setTotal(res.data?.total ?? 0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [searchQuery]);
  useEffect(() => {
    load();
  }, [searchQuery, page]);

  return (
    <div className="space-y-4">
      <PageHeader title="Referral Links" description="Manage and copy member referral links." />
      <SearchFilterBar>
        <SearchFilterBarSearch value={search} onChange={setSearch} placeholder="Search by member ID, email, business, code..." />
      </SearchFilterBar>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-3 font-medium">Member ID / Business</th>
                  <th className="text-left p-3 font-medium">Referral code</th>
                  <th className="text-left p-3 font-medium">Join URL</th>
                  <th className="text-left p-3 font-medium">Referrals</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.userId} className="border-b border-border last:border-0">
                    <td className="p-3">
                      <div className="font-mono text-sm">{link.memberId}</div>
                      <div className="text-sm text-muted-foreground">{link.businessName}</div>
                    </td>
                    <td className="p-3 font-mono text-sm">{link.referralCode}</td>
                    <td className="p-3">
                      <span className="text-sm text-muted-foreground truncate max-w-[200px] inline-block" title={link.joinUrl}>{link.joinUrl}</span>
                    </td>
                    <td className="p-3">{link.referralCount}</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await adminReferralLinkDetails(link.userId);
                            if (res.data) setDetails({ link: res.data.link, referrals: res.data.referrals ?? [] });
                          } catch (e) {
                            toast.error(e instanceof Error ? e.message : "Failed to load details");
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-muted inline-flex"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination page={page} limit={PAGE_SIZE} total={total} onPageChange={setPage} />

      {details && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-bold">Referral details – {details.link.businessName}</h3>
              <button onClick={() => setDetails(null)} className="p-2 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 overflow-y-auto">
              <p className="text-sm text-muted-foreground mb-2">Join URL: {details.link.joinUrl}</p>
              <p className="font-medium mb-2">Referred members ({details.referrals.length})</p>
              <ul className="space-y-2">
                {details.referrals.map((r) => (
                  <li key={r._id} className="text-sm flex justify-between">
                    <span>{r.businessName}</span>
                    <span className="text-muted-foreground">{r.region} · {r.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
