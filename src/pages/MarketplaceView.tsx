import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { adminMarketplaceGet, adminMarketplaceDelete, type AdminMarketplaceItem } from "@/lib/api";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

export default function MarketplaceView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<AdminMarketplaceItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    adminMarketplaceGet(id)
      .then((r) => setItem(r.data ?? null))
      .catch(() => toast.error("Item not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!item || !confirm("Remove this marketplace item?")) return;
    try {
      await adminMarketplaceDelete(item._id);
      toast.success("Deleted");
      navigate("/marketplace");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!item) {
    return (
      <>
        <PageHeader title="Item not found" />
        <Link to="/marketplace" className="text-primary hover:underline">← Back to marketplace</Link>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={item.businessName}
        description="Marketplace item details."
      >
        <div className="flex gap-2">
          <Link to={`/marketplace/${id}/edit`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium">
            <Pencil className="w-4 h-4" /> Edit
          </Link>
          <button onClick={handleDelete} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </PageHeader>

      <div className="max-w-2xl space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          {(item.logoUrl || item.partnerBannerUrl) && (
            <div className="mb-4">
              <img src={item.logoUrl || item.partnerBannerUrl || ""} alt="" className="max-h-24 object-contain" />
            </div>
          )}
          <dl className="grid gap-3">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Business name</dt>
              <dd>{item.businessName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Name</dt>
              <dd>{item.name || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Region</dt>
              <dd>{item.region || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Source</dt>
              <dd>{item.source || "member"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Sort order</dt>
              <dd>{item.sortOrder ?? 0}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Active</dt>
              <dd>{item.active ? "Yes" : "No"}</dd>
            </div>
          </dl>
        </div>
        <Link to="/marketplace" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to marketplace
        </Link>
      </div>
    </>
  );
}
