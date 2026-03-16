import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminTierGetWithMembers, type AdminTierWithMembers } from "@/lib/api";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import { SearchFilterBar, SearchFilterBarSearch } from "@/components/SearchFilterBar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { ArrowLeft, Users } from "lucide-react";

const PAGE_SIZE = 10;

export default function TierView() {
  const { id } = useParams<{ id: string }>();
  const [tier, setTier] = useState<AdminTierWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const searchQuery = useDebouncedValue(search, 300);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await adminTierGetWithMembers(id, { search: searchQuery || undefined });
      setTier(res.data?.tier ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
      setTier(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [id, searchQuery]);
  useEffect(() => {
    load();
  }, [id, searchQuery]);

  if (!id) {
    return (
      <>
        <PageHeader title="Tier not found" />
        <Link to="/tiers" className="text-primary hover:underline">← Back to tiers</Link>
      </>
    );
  }

  if (loading && !tier) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tier) {
    return (
      <>
        <PageHeader title="Tier not found" />
        <Link to="/tiers" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to tiers
        </Link>
      </>
    );
  }

  const membersTotal = tier.members.length;
  const paginatedMembers = tier.members.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <PageHeader
        title={tier.name}
        description={tier.description || `Members with ${tier.minReferrals}+ active referrals.`}
      >
        <Link to="/tiers" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to tiers
        </Link>
      </PageHeader>

      <div className="bg-card border border-border rounded-xl p-6 max-w-2xl">
        <dl className="grid gap-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Label</dt>
            <dd>{tier.label || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Min referrals</dt>
            <dd>{tier.minReferrals}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Sort order</dt>
            <dd>{tier.sortOrder}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Active</dt>
            <dd>{tier.active !== false ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Members in this tier</dt>
            <dd className="flex items-center gap-1">
              <Users className="w-4 h-4 text-muted-foreground" />
              {tier.memberCount}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Members</h2>
        <SearchFilterBar>
          <SearchFilterBarSearch
            value={search}
            onChange={setSearch}
            placeholder="Search by member ID, email, business, name..."
          />
        </SearchFilterBar>
        <div className="bg-card border border-border rounded-xl overflow-hidden mt-3">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading…</div>
          ) : tier.members.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchQuery ? "No members match your search." : "No members in this tier yet."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-3 font-medium">Member ID</th>
                    <th className="text-left p-3 font-medium">Business</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-right p-3 font-medium">Active referrals</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMembers.map((m) => (
                    <tr key={m.userId} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="p-3 font-mono text-sm">{m.memberId}</td>
                      <td className="p-3">{m.businessName || "—"}</td>
                      <td className="p-3">{m.email}</td>
                      <td className="p-3">{m.name || "—"}</td>
                      <td className="p-3 text-right">{m.activeReferrals}</td>
                      <td className="p-3 text-right">
                        <Link to={`/users/${m.userId}`} className="text-primary hover:underline text-sm">
                          View user
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Pagination page={page} limit={PAGE_SIZE} total={membersTotal} onPageChange={setPage} />
      </div>
    </div>
  );
}
