import React, { useEffect, useState } from "react";
import { adminSubscriptionsList, type AdminSubscription } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import { SearchFilterBar, SearchFilterBarSearch, SearchFilterBarSelect } from "@/components/SearchFilterBar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const PAGE_SIZE = 10;

export default function Subscriptions() {
  const [list, setList] = useState<AdminSubscription[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const searchQuery = useDebouncedValue(search, 300);
  const [page, setPage] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminSubscriptionsList({
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        limit: PAGE_SIZE,
        skip: page * PAGE_SIZE,
      });
      setList(res.data?.subscriptions ?? []);
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
  }, [statusFilter, searchQuery, page]);

  return (
    <div className="space-y-4">
      <PageHeader title="Subscriptions" description="View and manage member subscriptions." />
      <SearchFilterBar>
        <SearchFilterBarSearch value={search} onChange={setSearch} placeholder="Search by member, email, business..." />
        <SearchFilterBarSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Status">
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="past_due">Past due</option>
          <option value="canceled">Canceled</option>
        </SearchFilterBarSelect>
      </SearchFilterBar>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-3 font-medium">Member / Email</th>
                  <th className="text-left p-3 font-medium">Plan</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Period end</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((sub) => (
                  <tr key={sub._id} className="border-b border-border last:border-0">
                    <td className="p-3">
                      <div className="font-mono text-sm">{sub.userId?.memberId}</div>
                      <div className="text-sm text-muted-foreground">{sub.userId?.email}</div>
                    </td>
                    <td className="p-3">{sub.planId?.name} – ${((sub.planId?.priceCents ?? 0) / 100).toFixed(2)}/{sub.planId?.interval || "mo"}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${sub.status === "active" ? "bg-green-100 text-green-800" : sub.status === "canceled" ? "bg-muted" : "bg-amber-100 text-amber-800"}`}>
                        {sub.status}
                        {sub.cancelAtPeriodEnd ? " (cancel at end)" : ""}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{sub.currentPeriodEnd ? format(new Date(sub.currentPeriodEnd), "PP") : "—"}</td>
                    <td className="p-3 text-right">
                      <Link to={`/subscriptions/${sub._id}`} className="p-2 rounded-lg hover:bg-muted inline-flex" title="View">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination page={page} limit={PAGE_SIZE} total={total} onPageChange={setPage} />
    </div>
  );
}
