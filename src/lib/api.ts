const API_BASE =
  (typeof import.meta !== "undefined" && (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL) ||
  "http://localhost:3045";

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

function getToken(): string | null {
  return typeof localStorage !== "undefined" ? localStorage.getItem("admin_token") : null;
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) throw new Error("Empty response");
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Invalid JSON");
  }
}

export interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data: T;
}

// ——— Auth ———
export async function adminLogin(email: string, password: string): Promise<ApiResponse<{ admin: { _id: string; email: string; name?: string }; token: string }>> {
  const res = await fetch(apiUrl("/api/admin/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await parseJson<ApiResponse<{ admin: { _id: string; email: string; name?: string }; token: string }>>(res);
  if (!res.ok) throw new Error(json?.message || "Login failed");
  return json;
}

export async function adminForgotPassword(email: string): Promise<ApiResponse<{ resetLink?: string; message?: string }>> {
  const res = await fetch(apiUrl("/api/admin/auth/forgot-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const json = await parseJson<ApiResponse<{ resetLink?: string; message?: string }>>(res);
  if (!res.ok) throw new Error(json?.message || "Request failed");
  return json;
}

export async function adminResetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
  const res = await fetch(apiUrl("/api/admin/auth/reset-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  const json = await parseJson<ApiResponse<void>>(res);
  if (!res.ok) throw new Error(json?.message || "Reset failed");
  return json;
}

export async function adminChangePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
  const t = getToken();
  const res = await fetch(apiUrl("/api/admin/auth/change-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const json = await parseJson<ApiResponse<void>>(res);
  if (!res.ok) throw new Error(json?.message || "Change password failed");
  return json;
}

export async function adminMe(): Promise<ApiResponse<{ _id: string; email: string; name?: string; avatarUrl?: string }>> {
  const t = getToken();
  const res = await fetch(apiUrl("/api/admin/auth/me"), { headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}) } });
  const json = await parseJson<ApiResponse<{ _id: string; email: string; name?: string; avatarUrl?: string }>>(res);
  if (!res.ok) throw new Error(json?.message || "Unauthorized");
  return json;
}

export async function adminUpdateProfile(data: { name?: string; email?: string; avatarUrl?: string }): Promise<ApiResponse<{ _id: string; email: string; name?: string; avatarUrl?: string }>> {
  const t = getToken();
  const res = await fetch(apiUrl("/api/admin/auth/profile"), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    body: JSON.stringify(data),
  });
  const json = await parseJson<ApiResponse<{ _id: string; email: string; name?: string; avatarUrl?: string }>>(res);
  if (!res.ok) throw new Error(json?.message || "Update failed");
  return json;
}

/** Upload admin avatar (multipart form with "avatar" file). Returns updated admin with avatarUrl. */
export async function adminUploadAvatar(file: File): Promise<ApiResponse<{ _id: string; email: string; name?: string; avatarUrl?: string }>> {
  const t = getToken();
  const form = new FormData();
  form.append("avatar", file);
  const res = await fetch(apiUrl("/api/admin/auth/avatar"), {
    method: "POST",
    headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    body: form,
  });
  const json = await parseJson<ApiResponse<{ _id: string; email: string; name?: string; avatarUrl?: string }>>(res);
  if (!res.ok) throw new Error(json?.message || "Upload failed");
  return json;
}

/** Resolve admin avatar URL for display (prepends API base). */
export function adminAvatarUrl(avatarUrl: string | null | undefined): string | null {
  if (!avatarUrl || !avatarUrl.trim()) return null;
  return apiUrl(avatarUrl.startsWith("/") ? avatarUrl.slice(1) : avatarUrl);
}

// ——— Dashboard ———
export interface DashboardCounts {
  totalUsers: number;
  activeUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalReferrals: number;
  referralLinksCount: number;
  marketplaceCount: number;
  partnersCount: number;
}

export interface DashboardChartPoint {
  date: string;
  users: number;
  subscriptions: number;
}

export async function adminDashboardStats(): Promise<
  ApiResponse<{ counts: DashboardCounts; chartData: DashboardChartPoint[] }>
> {
  const res = await fetch(apiUrl("/api/admin/dashboard/stats"), {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const json = await parseJson<ApiResponse<{ counts: DashboardCounts; chartData: DashboardChartPoint[] }>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed to load dashboard stats");
  return json;
}

// ——— Users ———
export interface AdminUser {
  _id: string;
  memberId: string;
  email: string;
  name: string;
  businessName: string;
  industry?: string;
  region: string;
  status: string;
  createdAt?: string;
  partnerBannerUrl?: string;
}

export async function adminUsersList(params?: { limit?: number; skip?: number; status?: string; search?: string }): Promise<ApiResponse<{ users: AdminUser[]; total: number; limit: number; skip: number }>> {
  const sp = new URLSearchParams();
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.skip != null) sp.set("skip", String(params.skip));
  if (params?.status) sp.set("status", params.status);
  if (params?.search) sp.set("search", params.search);
  const q = sp.toString() ? `?${sp.toString()}` : "";
  const res = await fetch(apiUrl(`/api/admin/users${q}`), { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<{ users: AdminUser[]; total: number; limit: number; skip: number }>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}

export async function adminUserGet(id: string): Promise<ApiResponse<AdminUser>> {
  const res = await fetch(apiUrl(`/api/admin/users/${id}`), { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<AdminUser>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}

export async function adminUserCreate(body: { email: string; password: string; name: string; businessName: string; region: string; industry?: string; status?: string; memberId?: string }): Promise<ApiResponse<AdminUser>> {
  const res = await fetch(apiUrl("/api/admin/users"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  const json = await parseJson<ApiResponse<AdminUser>>(res);
  if (!res.ok) throw new Error(json?.message || "Create failed");
  return json;
}

export async function adminUserUpdate(id: string, body: Partial<AdminUser>): Promise<ApiResponse<AdminUser>> {
  const res = await fetch(apiUrl(`/api/admin/users/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  const json = await parseJson<ApiResponse<AdminUser>>(res);
  if (!res.ok) throw new Error(json?.message || "Update failed");
  return json;
}

export async function adminUserUpdateMemberId(id: string, memberId: string): Promise<ApiResponse<AdminUser>> {
  const res = await fetch(apiUrl(`/api/admin/users/${id}/member-id`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ memberId }),
  });
  const json = await parseJson<ApiResponse<AdminUser>>(res);
  if (!res.ok) throw new Error(json?.message || "Update failed");
  return json;
}

export async function adminUserDelete(id: string): Promise<ApiResponse<{ id: string }>> {
  const res = await fetch(apiUrl(`/api/admin/users/${id}`), { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<{ id: string }>>(res);
  if (!res.ok) throw new Error(json?.message || "Delete failed");
  return json;
}

export async function adminUserBanners(id: string): Promise<ApiResponse<{ partnerBannerUrl: string | null }>> {
  const res = await fetch(apiUrl(`/api/admin/users/${id}/banners`), { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<{ partnerBannerUrl: string | null }>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}

// ——— Subscriptions ———
export interface AdminSubscription {
  _id: string;
  userId: { _id: string; memberId: string; email: string; name: string; businessName: string };
  planId: { _id: string; name: string; priceCents: number; interval?: string };
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd?: boolean;
  stripeSubscriptionId?: string;
  createdAt?: string;
}

export async function adminSubscriptionsList(params?: { status?: string; search?: string; limit?: number; skip?: number }): Promise<ApiResponse<{ subscriptions: AdminSubscription[]; total: number; limit: number; skip: number }>> {
  const sp = new URLSearchParams();
  if (params?.status) sp.set("status", params.status);
  if (params?.search) sp.set("search", params.search);
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.skip != null) sp.set("skip", String(params.skip));
  const q = sp.toString() ? `?${sp.toString()}` : "";
  const res = await fetch(apiUrl(`/api/admin/subscriptions${q}`), { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<{ subscriptions: AdminSubscription[]; total: number; limit: number; skip: number }>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}

export async function adminSubscriptionGet(id: string): Promise<ApiResponse<AdminSubscription>> {
  const res = await fetch(apiUrl(`/api/admin/subscriptions/${id}`), { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<AdminSubscription>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}

export async function adminSubscriptionCancel(id: string, atPeriodEnd?: boolean): Promise<ApiResponse<{ cancelAtPeriodEnd?: boolean; currentPeriodEnd?: string }>> {
  const res = await fetch(apiUrl(`/api/admin/subscriptions/${id}/cancel`), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ atPeriodEnd }),
  });
  const json = await parseJson<ApiResponse<{ cancelAtPeriodEnd?: boolean; currentPeriodEnd?: string }>>(res);
  if (!res.ok) throw new Error(json?.message || "Cancel failed");
  return json;
}

export async function adminSubscriptionExtend(id: string, extendDays: number): Promise<ApiResponse<{ currentPeriodEnd: string }>> {
  const res = await fetch(apiUrl(`/api/admin/subscriptions/${id}/extend`), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ extendDays }),
  });
  const json = await parseJson<ApiResponse<{ currentPeriodEnd: string }>>(res);
  if (!res.ok) throw new Error(json?.message || "Extend failed");
  return json;
}

// ——— Invoices ———
export async function adminInvoicesList(params?: { userId?: string; limit?: number }): Promise<ApiResponse<{ invoices: Array<{ id: string; date: string | null; amount: number | null; status: string; hostedInvoiceUrl?: string; invoicePdf?: string }>; user?: { email: string; businessName: string } }>> {
  const sp = new URLSearchParams();
  if (params?.userId) sp.set("userId", params.userId);
  if (params?.limit != null) sp.set("limit", String(params.limit));
  const q = sp.toString() ? `?${sp.toString()}` : "";
  const res = await fetch(apiUrl(`/api/admin/invoices${q}`), { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<{ invoices: Array<{ id: string; date: string | null; amount: number | null; status: string; hostedInvoiceUrl?: string; invoicePdf?: string }>; user?: { email: string; businessName: string } }>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}

// ——— Referrals ———
export interface AdminReferralLink {
  userId: string;
  memberId: string;
  email: string;
  businessName: string;
  referralCode: string;
  joinUrl: string;
  referralCount: number;
  createdAt?: string;
}

export async function adminReferralLinks(params?: { search?: string; limit?: number; skip?: number }): Promise<ApiResponse<{ links: AdminReferralLink[]; total: number; limit: number; skip: number }>> {
  const sp = new URLSearchParams();
  if (params?.search) sp.set("search", params.search);
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.skip != null) sp.set("skip", String(params.skip));
  const q = sp.toString() ? `?${sp.toString()}` : "";
  const res = await fetch(apiUrl(`/api/admin/referrals/links${q}`), { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<{ links: AdminReferralLink[]; total: number; limit: number; skip: number }>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}

export async function adminReferralLinkDetails(userId: string): Promise<ApiResponse<{ link: AdminReferralLink; referrals: Array<{ _id: string; businessName: string; region?: string; status: string; createdAt?: string }> }>> {
  const res = await fetch(apiUrl(`/api/admin/referrals/links/${userId}`), { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<{ link: AdminReferralLink; referrals: Array<{ _id: string; businessName: string; region?: string; status: string; createdAt?: string }> }>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}

// ——— Marketplace ———
export interface AdminMarketplaceItem {
  _id: string;
  businessName: string;
  name?: string;
  region: string;
  logoUrl?: string;
  partnerBannerUrl?: string;
  databaseSize?: number;
  sortOrder: number;
  active: boolean;
  source: "member" | "partner";
}

export async function adminMarketplaceList(params?: { activeOnly?: boolean; search?: string; limit?: number; skip?: number }): Promise<ApiResponse<{ items: AdminMarketplaceItem[]; total: number; limit: number; skip: number }>> {
  const sp = new URLSearchParams();
  if (params?.activeOnly) sp.set("active", "true");
  if (params?.search) sp.set("search", params.search);
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.skip != null) sp.set("skip", String(params.skip));
  const q = sp.toString() ? `?${sp.toString()}` : "";
  const res = await fetch(apiUrl(`/api/admin/marketplace${q}`), { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<{ items: AdminMarketplaceItem[]; total: number; limit: number; skip: number }>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}

export async function adminMarketplaceGet(id: string): Promise<ApiResponse<AdminMarketplaceItem>> {
  const res = await fetch(apiUrl(`/api/admin/marketplace/${id}`), { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<AdminMarketplaceItem>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}

export async function adminMarketplaceCreate(body: Partial<AdminMarketplaceItem> & { businessName: string }): Promise<ApiResponse<AdminMarketplaceItem>> {
  const res = await fetch(apiUrl("/api/admin/marketplace"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  const json = await parseJson<ApiResponse<AdminMarketplaceItem>>(res);
  if (!res.ok) throw new Error(json?.message || "Create failed");
  return json;
}

export async function adminMarketplaceUpdate(id: string, body: Partial<AdminMarketplaceItem>): Promise<ApiResponse<AdminMarketplaceItem>> {
  const res = await fetch(apiUrl(`/api/admin/marketplace/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  const json = await parseJson<ApiResponse<AdminMarketplaceItem>>(res);
  if (!res.ok) throw new Error(json?.message || "Update failed");
  return json;
}

export async function adminMarketplaceDelete(id: string): Promise<ApiResponse<{ id: string }>> {
  const res = await fetch(apiUrl(`/api/admin/marketplace/${id}`), { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<{ id: string }>>(res);
  if (!res.ok) throw new Error(json?.message || "Delete failed");
  return json;
}

/** Upload image for marketplace item (multipart form field "banner"). Returns { url }. */
export async function adminMarketplaceUploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
  const t = getToken();
  const form = new FormData();
  form.append("banner", file);
  const res = await fetch(apiUrl("/api/admin/marketplace/upload"), {
    method: "POST",
    headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    body: form,
  });
  const json = await parseJson<ApiResponse<{ url: string }>>(res);
  if (!res.ok) throw new Error(json?.message || "Upload failed");
  return json;
}

// ——— Clusters (for region dropdown) ———
export interface Cluster {
  _id: string;
  name: string;
  order?: number;
  active?: boolean;
}

/** Public API: list clusters (regions) for dropdowns */
export async function clustersList(params?: { active?: "true" | "false" }): Promise<ApiResponse<Cluster[]>> {
  const sp = new URLSearchParams();
  if (params?.active) sp.set("active", params.active);
  const q = sp.toString() ? `?${sp.toString()}` : "";
  const res = await fetch(apiUrl(`/api/clusters${q}`));
  const json = await parseJson<ApiResponse<Cluster[]>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}

// ——— Partners ———
export interface AdminPartner {
  _id: string;
  businessName: string;
  name?: string;
  logoUrl: string | null;
  region: string;
  sortOrder?: number;
  active?: boolean;
  createdAt?: string;
}

export async function adminPartnersList(params?: { activeOnly?: boolean; inactiveOnly?: boolean; search?: string; limit?: number; skip?: number }): Promise<ApiResponse<{ partners: AdminPartner[]; total: number; limit: number; skip: number }>> {
  const sp = new URLSearchParams();
  if (params?.inactiveOnly) sp.set("inactive", "true");
  else if (params?.activeOnly === true) sp.set("active", "true");
  else if (params?.activeOnly === false) sp.set("active", "false");
  if (params?.search) sp.set("search", params.search);
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.skip != null) sp.set("skip", String(params.skip));
  const q = sp.toString() ? `?${sp.toString()}` : "";
  const res = await fetch(apiUrl(`/api/admin/partners${q}`), { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<{ partners: AdminPartner[]; total: number; limit: number; skip: number }>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}

export async function adminPartnerGet(id: string): Promise<ApiResponse<AdminPartner>> {
  const res = await fetch(apiUrl(`/api/admin/partners/${id}`), { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<AdminPartner>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}

export async function adminPartnerCreate(body: Partial<AdminPartner> & { businessName: string }): Promise<ApiResponse<AdminPartner>> {
  const res = await fetch(apiUrl("/api/admin/partners"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  const json = await parseJson<ApiResponse<AdminPartner>>(res);
  if (!res.ok) throw new Error(json?.message || "Create failed");
  return json;
}

export async function adminPartnerUpdate(id: string, body: Partial<AdminPartner>): Promise<ApiResponse<AdminPartner>> {
  const res = await fetch(apiUrl(`/api/admin/partners/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  const json = await parseJson<ApiResponse<AdminPartner>>(res);
  if (!res.ok) throw new Error(json?.message || "Update failed");
  return json;
}

export async function adminPartnerDelete(id: string): Promise<ApiResponse<{ id: string }>> {
  const res = await fetch(apiUrl(`/api/admin/partners/${id}`), { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<{ id: string }>>(res);
  if (!res.ok) throw new Error(json?.message || "Delete failed");
  return json;
}

/** Upload logo image for partner (multipart form field "logo"). Returns { url }. */
export async function adminPartnerUploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
  const t = getToken();
  const form = new FormData();
  form.append("logo", file);
  const res = await fetch(apiUrl("/api/admin/partners/upload"), {
    method: "POST",
    headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    body: form,
  });
  const json = await parseJson<ApiResponse<{ url: string }>>(res);
  if (!res.ok) throw new Error(json?.message || "Upload failed");
  return json;
}

// ——— Tiers (referral tiers) ———
export interface AdminTier {
  _id: string;
  name: string;
  label?: string;
  description?: string;
  minReferrals: number;
  sortOrder: number;
  active?: boolean;
}

export interface AdminTierMember {
  userId: string;
  memberId: string;
  email: string;
  businessName: string;
  name?: string;
  activeReferrals: number;
}

export interface AdminTierWithMembers extends AdminTier {
  memberCount: number;
  members: AdminTierMember[];
}

export async function adminTiersList(params?: { active?: "true" | "false" }): Promise<ApiResponse<AdminTier[]>> {
  const sp = new URLSearchParams();
  if (params?.active) sp.set("active", params.active);
  const q = sp.toString() ? `?${sp.toString()}` : "";
  const res = await fetch(apiUrl(`/api/admin/tiers${q}`), { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<AdminTier[]>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}

export async function adminTiersMembers(): Promise<ApiResponse<{ tiers: AdminTierWithMembers[] }>> {
  const res = await fetch(apiUrl("/api/admin/tiers/members"), { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<{ tiers: AdminTierWithMembers[] }>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}

export async function adminTierGetWithMembers(id: string, params?: { search?: string }): Promise<ApiResponse<{ tier: AdminTierWithMembers }>> {
  const sp = new URLSearchParams();
  if (params?.search) sp.set("search", params.search);
  const q = sp.toString() ? `?${sp.toString()}` : "";
  const res = await fetch(apiUrl(`/api/admin/tiers/${id}${q}`), { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<{ tier: AdminTierWithMembers }>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}

export async function adminTierCreate(body: Partial<AdminTier> & { name: string }): Promise<ApiResponse<AdminTier>> {
  const res = await fetch(apiUrl("/api/admin/tiers"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  const json = await parseJson<ApiResponse<AdminTier>>(res);
  if (!res.ok) throw new Error(json?.message || "Create failed");
  return json;
}

export async function adminTierUpdate(id: string, body: Partial<AdminTier>): Promise<ApiResponse<AdminTier>> {
  const res = await fetch(apiUrl(`/api/admin/tiers/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  const json = await parseJson<ApiResponse<AdminTier>>(res);
  if (!res.ok) throw new Error(json?.message || "Update failed");
  return json;
}

export async function adminTierDelete(id: string): Promise<ApiResponse<{ id: string }>> {
  const res = await fetch(apiUrl(`/api/admin/tiers/${id}`), { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<{ id: string }>>(res);
  if (!res.ok) throw new Error(json?.message || "Delete failed");
  return json;
}

// ——— Email Templates ———
export interface AdminEmailTemplate {
  _id: string;
  title: string;
  description?: string;
  previewUrl?: string;
  htmlFile?: string;
  order: number;
  htmlContent?: string;
}

export async function adminTemplatesList(params?: { includeContent?: boolean; search?: string; limit?: number; skip?: number }): Promise<ApiResponse<{ templates: AdminEmailTemplate[]; total: number; limit: number; skip: number }>> {
  const sp = new URLSearchParams();
  if (params?.includeContent) sp.set("includeContent", "1");
  if (params?.search) sp.set("search", params.search);
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.skip != null) sp.set("skip", String(params.skip));
  const q = sp.toString() ? `?${sp.toString()}` : "";
  const res = await fetch(apiUrl(`/api/admin/templates${q}`), { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<{ templates: AdminEmailTemplate[]; total: number; limit: number; skip: number }>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}

export async function adminTemplateGet(id: string): Promise<ApiResponse<AdminEmailTemplate>> {
  const res = await fetch(apiUrl(`/api/admin/templates/${id}`), { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<AdminEmailTemplate>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}

export async function adminTemplateCreate(body: Partial<AdminEmailTemplate> & { title: string }): Promise<ApiResponse<AdminEmailTemplate>> {
  const res = await fetch(apiUrl("/api/admin/templates"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  const json = await parseJson<ApiResponse<AdminEmailTemplate>>(res);
  if (!res.ok) throw new Error(json?.message || "Create failed");
  return json;
}

export async function adminTemplateUpdate(id: string, body: Partial<AdminEmailTemplate>): Promise<ApiResponse<AdminEmailTemplate>> {
  const res = await fetch(apiUrl(`/api/admin/templates/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  const json = await parseJson<ApiResponse<AdminEmailTemplate>>(res);
  if (!res.ok) throw new Error(json?.message || "Update failed");
  return json;
}

export async function adminTemplateDelete(id: string): Promise<ApiResponse<{ id: string }>> {
  const res = await fetch(apiUrl(`/api/admin/templates/${id}`), { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<{ id: string }>>(res);
  if (!res.ok) throw new Error(json?.message || "Delete failed");
  return json;
}

// ——— Training ———
export interface AdminTrainingCourse {
  _id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  order: number;
  active: boolean;
}

export interface AdminTrainingSection {
  _id: string;
  courseId: { _id: string; name: string };
  name: string;
  order: number;
  active: boolean;
}

export interface AdminTrainingVideo {
  _id: string;
  title: string;
  description?: string;
  duration?: string;
  thumbnail?: string;
  videoUrl?: string;
  sectionId?: { _id: string; name: string };
  source: "url" | "upload";
  order: number;
}

export interface AdminTrainingProgress {
  _id: string;
  userId: { _id: string; memberId: string; email: string; businessName: string };
  videoId: { _id: string; title: string; duration?: string };
  progressPercent: number;
  completed: boolean;
  completedAt?: string;
  updatedAt?: string;
}

export async function adminTrainingCoursesList(): Promise<ApiResponse<AdminTrainingCourse[]>> {
  const res = await fetch(apiUrl("/api/admin/training/courses"), { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<AdminTrainingCourse[]>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}

export async function adminTrainingCourseCreate(body: Partial<AdminTrainingCourse> & { name: string }): Promise<ApiResponse<AdminTrainingCourse>> {
  const res = await fetch(apiUrl("/api/admin/training/courses"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  const json = await parseJson<ApiResponse<AdminTrainingCourse>>(res);
  if (!res.ok) throw new Error(json?.message || "Create failed");
  return json;
}

export async function adminTrainingCourseUpdate(id: string, body: Partial<AdminTrainingCourse>): Promise<ApiResponse<AdminTrainingCourse>> {
  const res = await fetch(apiUrl(`/api/admin/training/courses/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  const json = await parseJson<ApiResponse<AdminTrainingCourse>>(res);
  if (!res.ok) throw new Error(json?.message || "Update failed");
  return json;
}

export async function adminTrainingCourseDelete(id: string): Promise<ApiResponse<{ id: string }>> {
  const res = await fetch(apiUrl(`/api/admin/training/courses/${id}`), { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<{ id: string }>>(res);
  if (!res.ok) throw new Error(json?.message || "Delete failed");
  return json;
}

export async function adminTrainingCourseUploadThumbnail(file: File): Promise<ApiResponse<{ url: string }>> {
  const form = new FormData();
  form.append("thumbnail", file);
  const res = await fetch(apiUrl("/api/admin/training/courses/upload-thumbnail"), {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: form,
  });
  const json = await parseJson<ApiResponse<{ url: string }>>(res);
  if (!res.ok) throw new Error(json?.message || "Upload failed");
  return json;
}

export async function adminTrainingSectionsList(courseId?: string): Promise<ApiResponse<AdminTrainingSection[]>> {
  const q = courseId ? `?courseId=${courseId}` : "";
  const res = await fetch(apiUrl(`/api/admin/training/sections${q}`), { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<AdminTrainingSection[]>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}

export async function adminTrainingSectionCreate(body: { courseId: string; name: string; order?: number; active?: boolean }): Promise<ApiResponse<AdminTrainingSection>> {
  const res = await fetch(apiUrl("/api/admin/training/sections"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  const json = await parseJson<ApiResponse<AdminTrainingSection>>(res);
  if (!res.ok) throw new Error(json?.message || "Create failed");
  return json;
}

export async function adminTrainingSectionUpdate(id: string, body: Partial<AdminTrainingSection>): Promise<ApiResponse<AdminTrainingSection>> {
  const res = await fetch(apiUrl(`/api/admin/training/sections/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  const json = await parseJson<ApiResponse<AdminTrainingSection>>(res);
  if (!res.ok) throw new Error(json?.message || "Update failed");
  return json;
}

export async function adminTrainingSectionDelete(id: string): Promise<ApiResponse<{ id: string }>> {
  const res = await fetch(apiUrl(`/api/admin/training/sections/${id}`), { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<{ id: string }>>(res);
  if (!res.ok) throw new Error(json?.message || "Delete failed");
  return json;
}

export async function adminTrainingVideosList(sectionId?: string): Promise<ApiResponse<AdminTrainingVideo[]>> {
  const q = sectionId ? `?sectionId=${sectionId}` : "";
  const res = await fetch(apiUrl(`/api/admin/training/videos${q}`), { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<AdminTrainingVideo[]>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}

export async function adminTrainingVideoCreate(body: Partial<AdminTrainingVideo> & { title: string }): Promise<ApiResponse<AdminTrainingVideo>> {
  const res = await fetch(apiUrl("/api/admin/training/videos"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  const json = await parseJson<ApiResponse<AdminTrainingVideo>>(res);
  if (!res.ok) throw new Error(json?.message || "Create failed");
  return json;
}

export async function adminTrainingVideoUpdate(id: string, body: Partial<AdminTrainingVideo>): Promise<ApiResponse<AdminTrainingVideo>> {
  const res = await fetch(apiUrl(`/api/admin/training/videos/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  const json = await parseJson<ApiResponse<AdminTrainingVideo>>(res);
  if (!res.ok) throw new Error(json?.message || "Update failed");
  return json;
}

export async function adminTrainingVideoDelete(id: string): Promise<ApiResponse<{ id: string }>> {
  const res = await fetch(apiUrl(`/api/admin/training/videos/${id}`), { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<{ id: string }>>(res);
  if (!res.ok) throw new Error(json?.message || "Delete failed");
  return json;
}

export async function adminTrainingVideoUploadVideo(file: File): Promise<ApiResponse<{ url: string }>> {
  const form = new FormData();
  form.append("video", file);
  const res = await fetch(apiUrl("/api/admin/training/videos/upload-video"), {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: form,
  });
  const json = await parseJson<ApiResponse<{ url: string }>>(res);
  if (!res.ok) throw new Error(json?.message || "Upload failed");
  return json;
}

export async function adminTrainingVideoUploadThumbnail(file: File): Promise<ApiResponse<{ url: string }>> {
  const form = new FormData();
  form.append("thumbnail", file);
  const res = await fetch(apiUrl("/api/admin/training/videos/upload-thumbnail"), {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: form,
  });
  const json = await parseJson<ApiResponse<{ url: string }>>(res);
  if (!res.ok) throw new Error(json?.message || "Upload failed");
  return json;
}

export async function adminTrainingProgressList(params?: { userId?: string; videoId?: string; limit?: number; skip?: number }): Promise<ApiResponse<{ progress: AdminTrainingProgress[]; total: number; limit: number; skip: number }>> {
  const sp = new URLSearchParams();
  if (params?.userId) sp.set("userId", params.userId);
  if (params?.videoId) sp.set("videoId", params.videoId);
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.skip != null) sp.set("skip", String(params.skip));
  const q = sp.toString() ? `?${sp.toString()}` : "";
  const res = await fetch(apiUrl(`/api/admin/training/progress${q}`), { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await parseJson<ApiResponse<{ progress: AdminTrainingProgress[]; total: number; limit: number; skip: number }>>(res);
  if (!res.ok) throw new Error(json?.message || "Failed");
  return json;
}
