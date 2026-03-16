import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { adminTemplateGet, adminTemplateUpdate, type AdminEmailTemplate } from "@/lib/api";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft } from "lucide-react";

export default function TemplateEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<AdminEmailTemplate | null>(null);
  const [form, setForm] = useState<Partial<AdminEmailTemplate> & { title: string }>({ title: "", description: "", order: 0, htmlContent: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    adminTemplateGet(id)
      .then((r) => {
        const t = r.data;
        if (t) {
          setTemplate(t);
          setForm({ title: t.title, description: t.description ?? "", order: t.order ?? 0, htmlContent: t.htmlContent ?? "" });
        }
      })
      .catch(() => toast.error("Template not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !form.title?.trim()) return;
    setSaving(true);
    try {
      await adminTemplateUpdate(id, form);
      toast.success("Template updated");
      navigate(`/templates/${id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!template) {
    return (
      <>
        <PageHeader title="Template not found" />
        <Link to="/templates" className="text-primary hover:underline">← Back to templates</Link>
      </>
    );
  }

  return (
    <>
      <PageHeader title={`Edit ${template.title}`} description="Update email template." />

      <div className="max-w-4xl space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Title</label>
              <input required className="w-full px-4 py-2 rounded-lg border border-border bg-secondary" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
              <input className="w-full px-4 py-2 rounded-lg border border-border bg-secondary" value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Order</label>
              <input type="number" className="w-full px-4 py-2 rounded-lg border border-border bg-secondary" value={form.order ?? 0} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">HTML content</label>
              <textarea rows={12} className="w-full px-4 py-2 rounded-lg border border-border bg-secondary font-mono text-sm" value={form.htmlContent ?? ""} onChange={(e) => setForm((f) => ({ ...f, htmlContent: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-2">
              <Link to={`/templates/${id}`} className="flex-1 py-2 rounded-lg border border-border text-center">Cancel</Link>
              <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">Save</button>
            </div>
          </form>
        </div>
        <Link to="/templates" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to templates
        </Link>
      </div>
    </>
  );
}
