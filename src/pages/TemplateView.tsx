import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { adminTemplateGet, adminTemplateDelete, type AdminEmailTemplate } from "@/lib/api";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

export default function TemplateView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<AdminEmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    adminTemplateGet(id)
      .then((r) => setTemplate(r.data ?? null))
      .catch(() => toast.error("Template not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!template || !confirm("Delete this template?")) return;
    try {
      await adminTemplateDelete(template._id);
      toast.success("Deleted");
      navigate("/templates");
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
      <PageHeader
        title={template.title}
        description={template.description || "Email template preview."}
      >
        <div className="flex gap-2">
          <Link to={`/templates/${id}/edit`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium">
            <Pencil className="w-4 h-4" /> Edit
          </Link>
          <button onClick={handleDelete} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </PageHeader>

      <div className="max-w-4xl space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <dl className="grid gap-3 mb-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Title</dt>
              <dd>{template.title}</dd>
            </div>
            {template.description && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                <dd>{template.description}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Order</dt>
              <dd>{template.order ?? 0}</dd>
            </div>
          </dl>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">HTML preview</h3>
          <div
            className="border border-border rounded-lg p-4 bg-white min-h-[200px] prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: template.htmlContent || "<p>No content</p>" }}
          />
        </div>
        <Link to="/templates" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to templates
        </Link>
      </div>
    </>
  );
}
