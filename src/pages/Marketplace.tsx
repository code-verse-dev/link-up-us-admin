import React, { useEffect, useState } from "react";
import { adminMarketplaceList, type AdminMarketplaceItem } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Plus, Eye } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import { SearchFilterBar, SearchFilterBarSearch } from "@/components/SearchFilterBar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const PAGE_SIZE = 10;

export default function Marketplace() {
  const [items, setItems] = useState<AdminMarketplaceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const searchQuery = useDebouncedValue(search, 300);
  const [page, setPage] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminMarketplaceList({ activeOnly: false, search: searchQuery || undefined, limit: PAGE_SIZE, skip: page * PAGE_SIZE });
      setItems(res.data?.items ?? []);
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
      <PageHeader title="Marketplace" description="Manage member marketplace listings." />
      <SearchFilterBar>
        <SearchFilterBarSearch value={search} onChange={setSearch} placeholder="Search by business, name, region..." />
        <Link to="/marketplace/new" className="h-11 px-4 rounded-lg font-medium inline-flex items-center gap-2 bg-primary text-primary-foreground">
          <Plus className="w-5 h-5" /> Add item
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
                  <th className="text-left p-3 font-medium">Source</th>
                  <th className="text-left p-3 font-medium">Active</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-b border-border last:border-0">
                    <td className="p-3">{item.businessName}</td>
                    <td className="p-3">{item.name || "—"}</td>
                    <td className="p-3">{item.region || "—"}</td>
                    <td className="p-3">{item.source}</td>
                    <td className="p-3">{item.active ? "Yes" : "No"}</td>
                    <td className="p-3 text-right">
                      <Link to={`/marketplace/${item._id}`} className="p-2 rounded-lg hover:bg-muted inline-flex" title="View">
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
