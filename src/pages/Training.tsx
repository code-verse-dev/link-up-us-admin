import React, { useEffect, useState, useRef } from "react";
import {
  adminTrainingCoursesList,
  adminTrainingCourseCreate,
  adminTrainingCourseUpdate,
  adminTrainingCourseDelete,
  adminTrainingCourseUploadThumbnail,
  adminTrainingSectionsList,
  adminTrainingSectionCreate,
  adminTrainingSectionUpdate,
  adminTrainingSectionDelete,
  adminTrainingVideosList,
  adminTrainingVideoCreate,
  adminTrainingVideoUpdate,
  adminTrainingVideoDelete,
  adminTrainingVideoUploadVideo,
  adminTrainingVideoUploadThumbnail,
  adminTrainingProgressList,
  apiUrl,
  type AdminTrainingCourse,
  type AdminTrainingSection,
  type AdminTrainingVideo,
  type AdminTrainingProgress,
} from "@/lib/api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, ChevronDown, ChevronRight, PlayCircle, ImagePlus, Video, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import PageHeader from "@/components/PageHeader";

function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  if (url.startsWith("http")) return url;
  return apiUrl(url.startsWith("/") ? url.slice(1) : url);
}

export default function Training() {
  const [courses, setCourses] = useState<AdminTrainingCourse[]>([]);
  const [sections, setSections] = useState<AdminTrainingSection[]>([]);
  const [videos, setVideos] = useState<AdminTrainingVideo[]>([]);
  const [progress, setProgress] = useState<AdminTrainingProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"courses" | "lessons" | "videos" | "progress">("courses");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [modal, setModal] = useState<"course" | "lesson" | "video" | null>(null);
  const [editingCourse, setEditingCourse] = useState<AdminTrainingCourse | null>(null);
  const [editingSection, setEditingSection] = useState<AdminTrainingSection | null>(null);
  const [editingVideo, setEditingVideo] = useState<AdminTrainingVideo | null>(null);
  const [formCourse, setFormCourse] = useState<Partial<AdminTrainingCourse> & { name: string }>({ name: "", description: "", thumbnail: "", order: 0, active: true });
  const [formSection, setFormSection] = useState<{ courseId: string; name: string; order: number; active: boolean }>({ courseId: "", name: "", order: 0, active: true });
  const [formVideo, setFormVideo] = useState<Partial<AdminTrainingVideo> & { title: string }>({ title: "", description: "", duration: "", thumbnail: "", videoUrl: "", sectionId: undefined, order: 0, source: "url" });
  const [saving, setSaving] = useState(false);
  const [uploadingCourseThumb, setUploadingCourseThumb] = useState(false);
  const [uploadingVideoFile, setUploadingVideoFile] = useState(false);
  const [uploadingVideoThumb, setUploadingVideoThumb] = useState(false);
  const courseThumbRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const videoThumbRef = useRef<HTMLInputElement>(null);

  const loadCourses = async () => {
    const res = await adminTrainingCoursesList();
    setCourses(res.data ?? []);
  };
  const loadSections = async () => {
    const res = await adminTrainingSectionsList();
    setSections(res.data ?? []);
  };
  const loadVideos = async () => {
    const res = await adminTrainingVideosList();
    setVideos(res.data ?? []);
  };
  const loadProgress = async () => {
    const res = await adminTrainingProgressList({ limit: 100 });
    setProgress(res.data?.progress ?? []);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([loadCourses(), loadSections(), loadVideos(), loadProgress()])
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const saveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCourse.name?.trim()) return;
    setSaving(true);
    try {
      if (editingCourse) await adminTrainingCourseUpdate(editingCourse._id, formCourse);
      else await adminTrainingCourseCreate(formCourse);
      toast.success(editingCourse ? "Updated" : "Created");
      setModal(null);
      setEditingCourse(null);
      loadCourses();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const saveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSection.courseId || !formSection.name?.trim()) return;
    setSaving(true);
    try {
      if (editingSection) await adminTrainingSectionUpdate(editingSection._id, formSection);
      else await adminTrainingSectionCreate(formSection);
      toast.success(editingSection ? "Updated" : "Created");
      setModal(null);
      setEditingSection(null);
      loadSections();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const saveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVideo.title?.trim()) return;
    setSaving(true);
    try {
      if (editingVideo) await adminTrainingVideoUpdate(editingVideo._id, formVideo);
      else await adminTrainingVideoCreate(formVideo);
      toast.success(editingVideo ? "Updated" : "Created");
      setModal(null);
      setEditingVideo(null);
      loadVideos();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCourseThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) { toast.error("Choose an image"); return; }
    setUploadingCourseThumb(true);
    try {
      const res = await adminTrainingCourseUploadThumbnail(file);
      if (res.data?.url) {
        setFormCourse((f) => ({ ...f, thumbnail: res.data!.url }));
        toast.success("Thumbnail uploaded");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingCourseThumb(false);
      e.target.value = "";
    }
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("video/")) { toast.error("Choose a video (MP4, WebM)"); return; }
    setUploadingVideoFile(true);
    try {
      const res = await adminTrainingVideoUploadVideo(file);
      if (res.data?.url) {
        setFormVideo((f) => ({ ...f, videoUrl: res.data!.url, source: "upload" }));
        toast.success("Video uploaded – will stream for members");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingVideoFile(false);
      e.target.value = "";
    }
  };

  const handleVideoThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) { toast.error("Choose an image"); return; }
    setUploadingVideoThumb(true);
    try {
      const res = await adminTrainingVideoUploadThumbnail(file);
      if (res.data?.url) {
        setFormVideo((f) => ({ ...f, thumbnail: res.data!.url }));
        toast.success("Thumbnail uploaded");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingVideoThumb(false);
      e.target.value = "";
    }
  };

  const deleteCourse = async (id: string) => {
    if (!confirm("Delete course and its lessons?")) return;
    try {
      await adminTrainingCourseDelete(id);
      toast.success("Deleted");
      loadCourses();
      loadSections();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const deleteSection = async (id: string) => {
    if (!confirm("Delete lesson?")) return;
    try {
      await adminTrainingSectionDelete(id);
      toast.success("Deleted");
      loadSections();
      loadVideos();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm("Delete video?")) return;
    try {
      await adminTrainingVideoDelete(id);
      toast.success("Deleted");
      loadVideos();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const getCourseName = (courseId: unknown) => (courseId as { name?: string })?.name ?? "—";
  const getSectionName = (sectionId: unknown) => (sectionId as { name?: string })?.name ?? "—";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Training Library" description="Manage courses, lessons, videos, and view progress. Uploaded videos are streamed to save bandwidth." />
      <div className="flex gap-2 border-b border-border">
        {(["courses", "lessons", "videos", "progress"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 rounded-t-lg font-medium ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
          >
            {t === "lessons" ? "Lessons" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ——— Courses ——— */}
      {tab === "courses" && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => { setModal("course"); setEditingCourse(null); setFormCourse({ name: "", description: "", thumbnail: "", order: 0, active: true }); }}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium"
            >
              <Plus className="w-5 h-5" /> Add course
            </button>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="divide-y divide-border">
              {courses.map((c) => (
                <div key={c._id} className="flex items-center gap-4 p-4 hover:bg-muted/30">
                  <button type="button" onClick={() => setExpandedCourse(expandedCourse === c._id ? null : c._id)} className="p-1 rounded hover:bg-muted">
                    {expandedCourse === c._id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                  <div className="w-14 h-14 rounded-lg border border-border bg-muted/50 overflow-hidden flex-shrink-0">
                    {c.thumbnail ? (
                      <img src={resolveMediaUrl(c.thumbnail) ?? ""} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <PlayCircle className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{c.name}</p>
                    {c.description && <p className="text-sm text-muted-foreground truncate">{c.description}</p>}
                    {!c.active && <span className="text-xs text-amber-600">Inactive</span>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button type="button" onClick={() => { setEditingCourse(c); setFormCourse({ name: c.name, description: c.description ?? "", thumbnail: c.thumbnail ?? "", order: c.order ?? 0, active: c.active !== false }); setModal("course"); }} className="p-2 rounded-lg border border-border hover:bg-muted" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => deleteCourse(c._id)} className="p-2 rounded-lg border border-border hover:bg-destructive/10 text-destructive" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {courses.length === 0 && <div className="p-8 text-center text-muted-foreground">No courses yet. Add one to get started.</div>}
          </div>
        </>
      )}

      {/* ——— Lessons ——— */}
      {tab === "lessons" && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => { setModal("lesson"); setEditingSection(null); setFormSection({ courseId: courses[0]?._id ?? "", name: "", order: 0, active: true }); }}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium"
            >
              <Plus className="w-5 h-5" /> Add lesson
            </button>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-3 font-medium w-20">Order</th>
                  <th className="text-left p-3 font-medium">Course</th>
                  <th className="text-left p-3 font-medium">Lesson name</th>
                  <th className="text-left p-3 font-medium w-24">Active</th>
                  <th className="text-right p-3 font-medium w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((s) => (
                  <tr key={s._id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="p-3 text-muted-foreground">{s.order ?? 0}</td>
                    <td className="p-3">{getCourseName(s.courseId)}</td>
                    <td className="p-3 font-medium">{s.name}</td>
                    <td className="p-3">{s.active !== false ? "Yes" : "No"}</td>
                    <td className="p-3 text-right">
                      <button type="button" onClick={() => { setEditingSection(s); setFormSection({ courseId: (s.courseId as { _id: string })._id, name: s.name, order: s.order ?? 0, active: s.active !== false }); setModal("lesson"); }} className="p-2 rounded-lg hover:bg-muted inline-flex" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button type="button" onClick={() => deleteSection(s._id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive inline-flex" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sections.length === 0 && <div className="p-8 text-center text-muted-foreground">No lessons yet. Add a lesson to a course.</div>}
          </div>
        </>
      )}

      {/* ——— Videos ——— */}
      {tab === "videos" && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => { setModal("video"); setEditingVideo(null); setFormVideo({ title: "", description: "", duration: "", thumbnail: "", videoUrl: "", sectionId: undefined, order: 0, source: "url" }); }}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium"
            >
              <Plus className="w-5 h-5" /> Add video
            </button>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-3 font-medium w-24">Thumbnail</th>
                  <th className="text-left p-3 font-medium">Title</th>
                  <th className="text-left p-3 font-medium">Lesson</th>
                  <th className="text-left p-3 font-medium w-20">Duration</th>
                  <th className="text-left p-3 font-medium w-24">Source</th>
                  <th className="text-left p-3 font-medium w-16">Order</th>
                  <th className="text-right p-3 font-medium w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => (
                  <tr key={v._id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="p-3">
                      <div className="w-16 h-10 rounded border border-border bg-muted/50 overflow-hidden">
                        {v.thumbnail ? (
                          <img src={resolveMediaUrl(v.thumbnail) ?? ""} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Video className="w-5 h-5" /></div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-medium">{v.title}</td>
                    <td className="p-3 text-muted-foreground">{getSectionName(v.sectionId)}</td>
                    <td className="p-3 text-sm">{v.duration || "—"}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${v.source === "upload" ? "bg-blue-100 text-blue-800" : "bg-muted text-muted-foreground"}`}>
                        {v.source === "upload" ? <Video className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                        {v.source === "upload" ? "Upload" : "URL"}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{v.order ?? 0}</td>
                    <td className="p-3 text-right">
                      <button type="button" onClick={() => { setEditingVideo(v); setFormVideo({ ...v, sectionId: (v.sectionId as { _id: string })?._id }); setModal("video"); }} className="p-2 rounded-lg hover:bg-muted inline-flex" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button type="button" onClick={() => deleteVideo(v._id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive inline-flex" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {videos.length === 0 && <div className="p-8 text-center text-muted-foreground">No videos yet. Add a video (upload file or paste link) with optional thumbnail.</div>}
          </div>
        </>
      )}

      {/* ——— Progress ——— */}
      {tab === "progress" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-3 font-medium">Member / Business</th>
                <th className="text-left p-3 font-medium">Video</th>
                <th className="text-left p-3 font-medium w-24">Progress</th>
                <th className="text-left p-3 font-medium w-24">Completed</th>
                <th className="text-left p-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {progress.map((p) => (
                <tr key={p._id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="p-3">
                    <div className="font-mono text-sm">{(p.userId as { memberId?: string })?.memberId}</div>
                    <div className="text-sm text-muted-foreground">{(p.userId as { businessName?: string })?.businessName}</div>
                  </td>
                  <td className="p-3">{(p.videoId as { title?: string })?.title}</td>
                  <td className="p-3">{p.progressPercent}%</td>
                  <td className="p-3">{p.completed ? "Yes" : "No"}</td>
                  <td className="p-3 text-sm text-muted-foreground">{(p as { updatedAt?: string }).updatedAt ? format(new Date((p as { updatedAt: string }).updatedAt), "PPp") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {progress.length === 0 && <div className="p-8 text-center text-muted-foreground">No progress records yet.</div>}
        </div>
      )}

      {/* ——— Course modal ——— */}
      {modal === "course" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">{editingCourse ? "Edit course" : "Add course"}</h3>
              <button type="button" onClick={() => { setModal(null); setEditingCourse(null); }} className="p-2 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={saveCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Thumbnail</label>
                <div className="flex gap-2 items-center flex-wrap">
                  <input type="file" accept="image/*" className="hidden" ref={courseThumbRef} onChange={handleCourseThumbUpload} disabled={uploadingCourseThumb} />
                  <button type="button" onClick={() => courseThumbRef.current?.click()} disabled={uploadingCourseThumb} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium disabled:opacity-50">
                    <ImagePlus className="w-4 h-4" /> {uploadingCourseThumb ? "Uploading…" : "Upload thumbnail"}
                  </button>
                  <input placeholder="Or paste image URL" className="flex-1 min-w-[140px] px-4 py-2 rounded-lg border border-border bg-secondary text-sm" value={formCourse.thumbnail ?? ""} onChange={(e) => setFormCourse((f) => ({ ...f, thumbnail: e.target.value }))} />
                </div>
                {formCourse.thumbnail && (
                  <div className="mt-2">
                    <img src={resolveMediaUrl(formCourse.thumbnail) ?? ""} alt="Preview" className="max-h-28 rounded-lg border border-border object-contain" />
                  </div>
                )}
              </div>
              <input required placeholder="Course name" className="w-full px-4 py-2 rounded-lg border border-border bg-secondary" value={formCourse.name} onChange={(e) => setFormCourse((f) => ({ ...f, name: e.target.value }))} />
              <input placeholder="Description" className="w-full px-4 py-2 rounded-lg border border-border bg-secondary" value={formCourse.description ?? ""} onChange={(e) => setFormCourse((f) => ({ ...f, description: e.target.value }))} />
              <input type="number" placeholder="Order" className="w-full px-4 py-2 rounded-lg border border-border bg-secondary" value={formCourse.order ?? 0} onChange={(e) => setFormCourse((f) => ({ ...f, order: Number(e.target.value) || 0 }))} />
              <label className="flex items-center gap-2"><input type="checkbox" checked={formCourse.active !== false} onChange={(e) => setFormCourse((f) => ({ ...f, active: e.target.checked }))} /> Active</label>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setModal(null); setEditingCourse(null); }} className="flex-1 py-2 rounded-lg border border-border">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ——— Lesson modal ——— */}
      {modal === "lesson" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">{editingSection ? "Edit lesson" : "Add lesson"}</h3>
              <button type="button" onClick={() => { setModal(null); setEditingSection(null); }} className="p-2 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={saveSection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Course</label>
                <select required className="w-full px-4 py-2 rounded-lg border border-border bg-secondary" value={formSection.courseId} onChange={(e) => setFormSection((f) => ({ ...f, courseId: e.target.value }))}>
                  <option value="">Select course</option>
                  {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <input required placeholder="Lesson name" className="w-full px-4 py-2 rounded-lg border border-border bg-secondary" value={formSection.name} onChange={(e) => setFormSection((f) => ({ ...f, name: e.target.value }))} />
              <input type="number" placeholder="Order" className="w-full px-4 py-2 rounded-lg border border-border bg-secondary" value={formSection.order} onChange={(e) => setFormSection((f) => ({ ...f, order: Number(e.target.value) || 0 }))} />
              <label className="flex items-center gap-2"><input type="checkbox" checked={formSection.active} onChange={(e) => setFormSection((f) => ({ ...f, active: e.target.checked }))} /> Active</label>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setModal(null); setEditingSection(null); }} className="flex-1 py-2 rounded-lg border border-border">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ——— Video modal ——— */}
      {modal === "video" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">{editingVideo ? "Edit video" : "Add video"}</h3>
              <button type="button" onClick={() => { setModal(null); setEditingVideo(null); }} className="p-2 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={saveVideo} className="space-y-4">
              <input required placeholder="Title" className="w-full px-4 py-2 rounded-lg border border-border bg-secondary" value={formVideo.title} onChange={(e) => setFormVideo((f) => ({ ...f, title: e.target.value }))} />
              <input placeholder="Description" className="w-full px-4 py-2 rounded-lg border border-border bg-secondary" value={formVideo.description ?? ""} onChange={(e) => setFormVideo((f) => ({ ...f, description: e.target.value }))} />
              <input placeholder="Duration (e.g. 5:30)" className="w-full px-4 py-2 rounded-lg border border-border bg-secondary" value={formVideo.duration ?? ""} onChange={(e) => setFormVideo((f) => ({ ...f, duration: e.target.value }))} />

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Video (upload or link)</label>
                <div className="flex gap-2 flex-wrap items-center">
                  <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" ref={videoFileRef} onChange={handleVideoFileUpload} disabled={uploadingVideoFile} />
                  <button type="button" onClick={() => videoFileRef.current?.click()} disabled={uploadingVideoFile} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium disabled:opacity-50">
                    <Video className="w-4 h-4" /> {uploadingVideoFile ? "Uploading…" : "Upload video"}
                  </button>
                  <span className="text-sm text-muted-foreground">or paste URL</span>
                </div>
                <input placeholder="Video URL (YouTube, Vimeo, or direct link)" className="w-full mt-2 px-4 py-2 rounded-lg border border-border bg-secondary text-sm" value={formVideo.videoUrl ?? ""} onChange={(e) => { const v = e.target.value; setFormVideo((f) => ({ ...f, videoUrl: v, source: v.startsWith("http") || v.startsWith("/") ? "url" : f.source })); }} />
                <p className="text-xs text-muted-foreground mt-1">Uploaded videos are streamed (no full download).</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Thumbnail</label>
                <div className="flex gap-2 flex-wrap items-center">
                  <input type="file" accept="image/*" className="hidden" ref={videoThumbRef} onChange={handleVideoThumbUpload} disabled={uploadingVideoThumb} />
                  <button type="button" onClick={() => videoThumbRef.current?.click()} disabled={uploadingVideoThumb} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium disabled:opacity-50">
                    <ImagePlus className="w-4 h-4" /> {uploadingVideoThumb ? "Uploading…" : "Upload thumbnail"}
                  </button>
                  <input placeholder="Or paste image URL" className="flex-1 min-w-[140px] px-4 py-2 rounded-lg border border-border bg-secondary text-sm" value={formVideo.thumbnail ?? ""} onChange={(e) => setFormVideo((f) => ({ ...f, thumbnail: e.target.value }))} />
                </div>
                {formVideo.thumbnail && (
                  <div className="mt-2">
                    <img src={resolveMediaUrl(formVideo.thumbnail) ?? ""} alt="Preview" className="max-h-24 rounded-lg border border-border object-contain" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Lesson</label>
                <select className="w-full px-4 py-2 rounded-lg border border-border bg-secondary" value={(formVideo.sectionId as string) ?? ""} onChange={(e) => setFormVideo((f) => ({ ...f, sectionId: e.target.value || undefined }))}>
                  <option value="">No lesson</option>
                  {sections.map((s) => <option key={s._id} value={s._id}>{s.name} ({getCourseName(s.courseId)})</option>)}
                </select>
              </div>
              <input type="number" placeholder="Order" className="w-full px-4 py-2 rounded-lg border border-border bg-secondary" value={formVideo.order ?? 0} onChange={(e) => setFormVideo((f) => ({ ...f, order: Number(e.target.value) || 0 }))} />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setModal(null); setEditingVideo(null); }} className="flex-1 py-2 rounded-lg border border-border">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
