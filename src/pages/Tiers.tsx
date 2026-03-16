import React, { useEffect, useState } from "react";
import {
  adminTiersMembers,
  adminTierCreate,
  adminTierUpdate,
  adminTierDelete,
  type AdminTier,
  type AdminTierWithMembers,
} from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Plus, X, Pencil, Trash2, Users, Eye } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import { SearchFilterBar, SearchFilterBarSearch } from "@/components/SearchFilterBar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const PAGE_SIZE = 10;

export default function Tiers() {
  const [tiers, setTiers] = useState<AdminTierWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const searchQuery = useDebouncedValue(search, 300);
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<AdminTierWithMembers | null>(null);
  const [form, setForm] = useState<Partial<AdminTier> & { name: string }>({
    name: "",
    label: "",
    description: "",
    minReferrals: 0,
    sortOrder: 0,
    active: true,
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminTiersMembers();
      setTiers(res.data?.tiers ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const displayTiers = searchQuery.trim()
    ? tiers.filter((t) => {
        const q = searchQuery.toLowerCase();
        return (
          (t.name && t.name.toLowerCase().includes(q)) ||
          (t.label && t.label.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          String(t.minReferrals).includes(q)
        );
      })
    : tiers;
  const totalTiers = displayTiers.length;
  const paginatedTiers = displayTiers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await adminTierUpdate(editing._id, form);
        toast.success("Tier updated");
      } else {
        await adminTierCreate(form);
        toast.success("Tier created");
      }
      setModal(null);
      setEditing(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tier? Members will not be removed; they will fall into the next tier.")) return;
    setDeletingId(id);
    try {
      await adminTierDelete(id);
      toast.success("Tier deleted");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (t: AdminTierWithMembers) => {
    setEditing(t);
    setForm({
      name: t.name,
      label: t.label ?? "",
      description: t.description ?? "",
      minReferrals: t.minReferrals,
      sortOrder: t.sortOrder,
      active: t.active !== false,
    });
    setModal("edit");
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      label: "",
      description: "",
      minReferrals: 0,
      sortOrder: tiers.length,
      active: true,
    });
    setModal("add");
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tier system"
        description="Manage referral tiers and see which members are in each tier (based on active referral count)."
      />
      <SearchFilterBar>
        <SearchFilterBarSearch
          value={search}
          onChange={setSearch}
          placeholder="Search by name, label, description, min referrals..."
        />
        <button
          onClick={openAdd}
          className="h-11 px-4 rounded-lg font-medium inline-flex items-center gap-2 bg-primary text-primary-foreground"
        >
          <Plus className="w-5 h-5" /> Add tier
        </button>
      </SearchFilterBar>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Label</th>
                  <th className="text-left p-3 font-medium">Min referrals</th>
                  <th className="text-left p-3 font-medium">Sort order</th>
                  <th className="text-left p-3 font-medium">Active</th>
                  <th className="text-left p-3 font-medium">Members</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTiers.map((t) => (
                  <tr key={t._id} className={`border-b border-border last:border-0 hover:bg-muted/20 ${t.active === false ? "opacity-60" : ""}`}>
                    <td className="p-3 font-medium">
                      <Link to={`/tiers/${t._id}`} className="text-primary hover:underline">
                        {t.name}
                      </Link>
                    </td>
                    <td className="p-3">{t.label || "—"}</td>
                    <td className="p-3">{t.minReferrals}</td>
                    <td className="p-3">{t.sortOrder}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${t.active !== false ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                        {t.active !== false ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-3">
                      <Link to={`/tiers/${t._id}`} className="inline-flex items-center gap-1 hover:underline">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {t.memberCount}
                      </Link>
                    </td>
                    <td className="p-3 text-right flex items-center justify-end gap-1">
                      <Link to={`/tiers/${t._id}`} className="p-2 rounded-lg hover:bg-muted" title="View members">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button type="button" onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-muted" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(t._id)}
                        disabled={deletingId === t._id}
                        className="p-2 rounded-lg hover:bg-red-100 text-red-600 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && displayTiers.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery ? "No tiers match your search." : "No tiers yet. Add one to get started."}
          </div>
        )}
      </div>
      <Pagination page={page} limit={PAGE_SIZE} total={totalTiers} onPageChange={setPage} />

      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">{editing ? "Edit tier" : "Add tier"}</h3>
              <button type="button" onClick={() => { setModal(null); setEditing(null); }} className="p-2 hover:bg-muted rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Label</label>
                <input
                  type="text"
                  value={form.label ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={form.description ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 min-h-[60px]"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Min referrals</label>
                <input
                  type="number"
                  min={0}
                  value={form.minReferrals ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, minReferrals: parseInt(e.target.value, 10) || 0 }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sort order</label>
                <input
                  type="number"
                  value={form.sortOrder ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.active !== false}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="rounded border-border"
                />
                <span className="text-sm">Active</span>
              </label>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setModal(null); setEditing(null); }}
                  className="flex-1 py-2 rounded-lg border border-border"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">
                  {saving ? "Saving…" : editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
