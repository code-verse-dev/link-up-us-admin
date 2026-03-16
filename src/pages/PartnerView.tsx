import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { adminPartnerGet, adminPartnerDelete, apiUrl, type AdminPartner } from "@/lib/api";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

function resolveLogoUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  if (url.startsWith("http")) return url;
  return apiUrl(url.startsWith("/") ? url.slice(1) : url);
}

export default function PartnerView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<AdminPartner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    adminPartnerGet(id)
      .then((r) => setPartner(r.data ?? null))
      .catch(() => toast.error("Partner not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!partner || !confirm("Delete this partner?")) return;
    try {
      await adminPartnerDelete(partner._id);
      toast.success("Partner deleted");
      navigate("/partners");
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
  if (!partner) {
    return (
      <>
        <PageHeader title="Partner not found" />
        <Link to="/partners" className="text-primary hover:underline">← Back to partners</Link>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={partner.businessName}
        description="Partner details."
      >
        <div className="flex gap-2">
          <Link to={`/partners/${id}/edit`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium">
            <Pencil className="w-4 h-4" /> Edit
          </Link>
          <button onClick={handleDelete} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </PageHeader>

      <div className="max-w-2xl space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          {partner.logoUrl && (
            <div className="mb-4">
              <img src={resolveLogoUrl(partner.logoUrl) ?? ""} alt="" className="max-h-20 object-contain" />
            </div>
          )}
          <dl className="grid gap-3">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Business name</dt>
              <dd>{partner.businessName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Name</dt>
              <dd>{partner.name || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Region</dt>
              <dd>{partner.region || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Active</dt>
              <dd>{partner.active !== false ? "Yes" : "No"}</dd>
            </div>
          </dl>
        </div>
        <Link to="/partners" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to partners
        </Link>
      </div>
    </>
  );
}
