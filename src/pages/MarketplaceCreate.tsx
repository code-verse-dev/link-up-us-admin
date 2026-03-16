import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  adminMarketplaceCreate,
  adminMarketplaceUploadImage,
  clustersList,
  apiUrl,
  type AdminMarketplaceItem,
  type Cluster,
} from "@/lib/api";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft, ImagePlus } from "lucide-react";

const initialForm: Partial<AdminMarketplaceItem> & { businessName: string } = {
  businessName: "",
  name: "",
  region: "",
  logoUrl: "",
  sortOrder: 0,
  active: true,
  source: "member",
};

export default function MarketplaceCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [regions, setRegions] = useState<Cluster[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    clustersList({ active: "true" })
      .then((r) => setRegions(r.data ?? []))
      .catch(() => setRegions([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName?.trim()) {
      toast.error("Business name required");
      return;
    }
    setSaving(true);
    try {
      const res = await adminMarketplaceCreate(form);
      toast.success("Marketplace item created");
      const id = res.data?._id;
      navigate(id ? `/marketplace/${id}` : "/marketplace");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please choose an image (PNG, JPG, GIF, WebP)");
      return;
    }
    setUploadingImage(true);
    try {
      const res = await adminMarketplaceUploadImage(file);
      if (res.data?.url) {
        setForm((f) => ({ ...f, logoUrl: res.data!.url }));
        toast.success("Image uploaded");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const resolveImageUrl = (url: string | null | undefined) => {
    if (!url?.trim()) return null;
    if (url.startsWith("http")) return url;
    return apiUrl(url.startsWith("/") ? url.slice(1) : url);
  };

  return (
    <>
      <PageHeader title="Add marketplace item" description="Create a new marketplace listing with business details and image." />

      <div className="max-w-lg space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Business name <span className="text-destructive">*</span></label>
              <input
                required
                placeholder="Business name"
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary"
                value={form.businessName}
                onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
              <input
                placeholder="Name"
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary"
                value={form.name ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Region</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary"
                value={form.region ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
              >
                <option value="">Select region</option>
                {regions.map((r) => (
                  <option key={r._id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Image</label>
              <div className="flex gap-2 flex-wrap items-center">
                <input type="file" accept="image/*" className="hidden" ref={imageInputRef} onChange={handleImageUpload} disabled={uploadingImage} />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium disabled:opacity-50"
                >
                  <ImagePlus className="w-4 h-4" /> {uploadingImage ? "Uploading…" : "Upload image"}
                </button>
              </div>
              {form.logoUrl && (
                <div className="mt-2">
                  <img src={resolveImageUrl(form.logoUrl) ?? ""} alt="Preview" className="max-h-24 rounded-lg border border-border object-contain" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Sort order</label>
              <input
                type="number"
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary"
                value={form.sortOrder ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Source</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary"
                value={form.source ?? "member"}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value as "member" | "partner" }))}
              >
                <option value="member">Member</option>
                <option value="partner">Partner</option>
              </select>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.active !== false} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
              Active
            </label>
            <div className="flex gap-2 pt-2">
              <Link to="/marketplace" className="flex-1 py-2 rounded-lg border border-border text-center">
                Cancel
              </Link>
              <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">
                {saving ? "Creating…" : "Create"}
              </button>
            </div>
          </form>
        </div>
        <Link to="/marketplace" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to marketplace
        </Link>
      </div>
    </>
  );
}
