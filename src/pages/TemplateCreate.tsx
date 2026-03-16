import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminTemplateCreate, type AdminEmailTemplate } from "@/lib/api";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft, Code, Eye } from "lucide-react";

export default function TemplateCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<AdminEmailTemplate> & { title: string }>({ title: "", description: "", order: 0, htmlContent: "" });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      toast.error("Title required");
      return;
    }
    setSaving(true);
    try {
      const res = await adminTemplateCreate(form);
      toast.success("Template created");
      const id = res.data?._id;
      navigate(id ? `/templates/${id}` : "/templates");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Add template" description="Create a new email template with HTML." />

      <div className="max-w-4xl space-y-6">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="p-4 space-y-4 border-b border-border">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Title</label>
                <input required placeholder="Template title" className="w-full px-4 py-2 rounded-lg border border-border bg-secondary" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                <input placeholder="Optional description" className="w-full px-4 py-2 rounded-lg border border-border bg-secondary" value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Order</label>
                <input type="number" className="w-32 px-4 py-2 rounded-lg border border-border bg-secondary" value={form.order ?? 0} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="p-4 border-b border-border">
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => setActiveTab("edit")} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${activeTab === "edit" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <Code className="w-4 h-4" /> HTML
                </button>
                <button type="button" onClick={() => setActiveTab("preview")} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${activeTab === "preview" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <Eye className="w-4 h-4" /> Preview
                </button>
              </div>
              {activeTab === "edit" ? (
                <textarea
                  className="w-full min-h-[320px] p-4 rounded-lg border border-border bg-secondary font-mono text-sm resize-y"
                  placeholder="<html>...</html>"
                  value={form.htmlContent ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, htmlContent: e.target.value }))}
                  spellCheck={false}
                />
              ) : (
                <div className="min-h-[320px] overflow-auto rounded-lg border border-border bg-white p-4">
                  <iframe title="Preview" srcDoc={form.htmlContent || "<p>No content</p>"} className="w-full min-h-[300px] border-0" sandbox="allow-same-origin" />
                </div>
              )}
            </div>
            <div className="p-4 flex gap-2">
              <Link to="/templates" className="flex-1 py-2 rounded-lg border border-border text-center">Cancel</Link>
              <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">Create template</button>
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
