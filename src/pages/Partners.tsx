import React, { useEffect, useState } from "react";
import { adminPartnersList, type AdminPartner } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Plus, Eye, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import { SearchFilterBar, SearchFilterBarSearch, SearchFilterBarSelect } from "@/components/SearchFilterBar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const PAGE_SIZE = 10;

type StatusFilter = "all" | "active" | "inactive";

export default function Partners() {
  const [partners, setPartners] = useState<AdminPartner[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const searchQuery = useDebouncedValue(search, 300);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminPartnersList({
        activeOnly: statusFilter === "active" ? true : statusFilter === "all" ? false : undefined,
        inactiveOnly: statusFilter === "inactive",
        search: searchQuery || undefined,
        limit: PAGE_SIZE,
        skip: page * PAGE_SIZE,
      });
      setPartners(res.data?.partners ?? []);
      setTotal(res.data?.total ?? 0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [searchQuery, statusFilter]);
  useEffect(() => {
    load();
  }, [searchQuery, statusFilter, page]);

  return (
    <div className="space-y-4">
      <PageHeader title="Partners" description="Manage partner listings and details." />
      <SearchFilterBar>
        <SearchFilterBarSearch value={search} onChange={setSearch} placeholder="Search by business, name, region..." />
        <SearchFilterBarSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} aria-label="Filter by status">
          <option value="all">All partners</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </SearchFilterBarSelect>
        <Link to="/partners/new" className="h-11 px-4 rounded-lg font-medium inline-flex items-center gap-2 bg-primary text-primary-foreground">
          <Plus className="w-5 h-5" /> Add partner
        </Link>
      </SearchFilterBar>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-3 font-medium">Business</th>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Region</th>
                  <th className="text-left p-3 font-medium">Active</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p._id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="p-3 font-medium">{p.businessName}</td>
                    <td className="p-3">{p.name || "—"}</td>
                    <td className="p-3">{p.region || "—"}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${p.active !== false ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                        {p.active !== false ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link to={`/partners/${p._id}`} className="p-2 rounded-lg hover:bg-muted inline-flex" title="View">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && partners.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            {statusFilter !== "all" || searchQuery ? "No partners match your filters." : "No partners yet. Add one to get started."}
          </div>
        )}
      </div>
      <Pagination page={page} limit={PAGE_SIZE} total={total} onPageChange={setPage} />
    </div>
  );
}
