import React, { useEffect, useState } from "react";
import { adminUsersList, type AdminUser } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Plus, Eye } from "lucide-react";
import { format } from "date-fns";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import { SearchFilterBar, SearchFilterBarSearch, SearchFilterBarSelect } from "@/components/SearchFilterBar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function Users() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const searchQuery = useDebouncedValue(search, 300);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const limit = 10;

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminUsersList({ limit, skip: page * limit, status: statusFilter || undefined, search: searchQuery || undefined });
      setUsers(res.data?.users ?? []);
      setTotal(res.data?.total ?? 0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [searchQuery]);
  useEffect(() => {
    load();
  }, [page, statusFilter, searchQuery]);

  return (
    <div className="space-y-4">
      <PageHeader title="Users" description="Manage member accounts, status, and member IDs." />
      <SearchFilterBar>
        <SearchFilterBarSearch value={search} onChange={setSearch} placeholder="Search by email, name, business, member ID..." />
        <SearchFilterBarSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Status">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </SearchFilterBarSelect>
        <Link to="/users/new" className="h-11 px-4 rounded-lg font-medium inline-flex items-center gap-2 bg-primary text-primary-foreground">
          <Plus className="w-5 h-5" /> Add user
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
                  <th className="text-left p-3 font-medium">Member ID</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Business</th>
                  <th className="text-left p-3 font-medium">Region</th>
                  <th className="text-left p-3 font-medium">Join date</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-border last:border-0">
                    <td className="p-3 font-mono text-sm">{u.memberId}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.businessName}</td>
                    <td className="p-3">{u.region}</td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "—"}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.status === "active" ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link to={`/users/${u._id}`} className="p-2 rounded-lg hover:bg-muted inline-flex" title="View">
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

      <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
    </div>
  );
}
