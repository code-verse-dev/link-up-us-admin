import React, { useEffect, useState, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Link2,
  Award,
  Store,
  Building2,
  Mail,
  PlayCircle,
  LogOut,
  Menu,
  X,
  UserCircle,
} from "lucide-react";
import logoUrl from "@/assets/linkup-logo.png";
import { adminMe, adminAvatarUrl } from "@/lib/api";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [admin, setAdmin] = useState<{ name?: string; email: string; avatarUrl?: string } | null>(null);
  const profileRefMobile = useRef<HTMLDivElement>(null);
  const profileRefDesktop = useRef<HTMLDivElement>(null);

  useEffect(() => {
    adminMe()
      .then((r) => setAdmin(r.data ?? null))
      .catch(() => setAdmin(null));
  }, []);

  useEffect(() => {
    const onAdminUpdated = (e: CustomEvent<{ name?: string; email: string; avatarUrl?: string }>) => {
      setAdmin(e.detail);
    };
    window.addEventListener("admin-updated", onAdminUpdated as EventListener);
    return () => window.removeEventListener("admin-updated", onAdminUpdated as EventListener);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const outsideMobile = !profileRefMobile.current?.contains(target);
      const outsideDesktop = !profileRefDesktop.current?.contains(target);
      if (outsideMobile && outsideDesktop) setProfileOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("admin_token");
    navigate("/login");
  };

  const menu = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/users", label: "Users", icon: Users },
    { path: "/subscriptions", label: "Subscriptions", icon: CreditCard },
    { path: "/invoices", label: "Invoices", icon: FileText },
    { path: "/referrals", label: "Referral Links", icon: Link2 },
    { path: "/tiers", label: "Tiers", icon: Award },
    { path: "/marketplace", label: "Marketplace", icon: Store },
    { path: "/partners", label: "Partners", icon: Building2 },
    { path: "/templates", label: "Email Templates", icon: Mail },
    { path: "/training", label: "Training Library", icon: PlayCircle },
  ];

  return (
    <div className="min-h-screen flex bg-secondary">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <img src={logoUrl} alt="Link-up.us" className="h-8 object-contain" />
        <div className="flex items-center gap-2">
          <div className="relative flex items-center gap-2" ref={profileRefMobile}>
            <button
              id="user-menu-button"
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border-2 border-card shadow-sm focus:outline-none overflow-hidden flex-shrink-0"
              aria-haspopup="true"
              aria-expanded={profileOpen}
            >
              {adminAvatarUrl(admin?.avatarUrl) ? (
                <img src={adminAvatarUrl(admin?.avatarUrl)!} alt="" className="w-full h-full object-cover" />
              ) : (
                <span aria-hidden>{(admin?.name || admin?.email || "A").charAt(0).toUpperCase()}</span>
              )}
            </button>
            {profileOpen && (
              <div id="user-dropdown-menu" className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-card border border-border rounded-lg shadow-xl z-[100] py-2 animate-fade-in" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors" role="menuitem">
                  <UserCircle className="w-5 h-5 mr-2" />
                  Profile
                </Link>
                <button type="button" onClick={() => { setProfileOpen(false); logout(); }} className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors" role="menuitem">
                  <LogOut className="w-5 h-5 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
          <button onClick={() => setMobileOpen((o) => !o)} className="p-2">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground flex flex-col z-40 transform transition-transform lg:translate-x-0 pt-14 lg:pt-0 px-4 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="py-4 flex items-center">
          <img src={logoUrl} alt="Link-up.us" className="h-12 w-auto max-w-[180px] object-contain" />
        </div>
        <nav className="flex-1 overflow-y-auto py-2 space-y-1">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                location.pathname === item.path
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/80"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen pt-14 lg:pt-0">
        <header className="hidden lg:flex sticky top-0 z-30 h-14 border-b border-border bg-card items-center justify-end px-4 lg:px-8 shrink-0">
          <div className="relative flex items-center gap-2" ref={profileRefDesktop}>
            <p className="text-sm font-bold text-foreground hidden sm:block truncate max-w-[140px]">{admin?.name || admin?.email || "Admin"}</p>
            <button
              id="user-menu-button-desktop"
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border-2 border-card shadow-sm focus:outline-none overflow-hidden flex-shrink-0"
              aria-haspopup="true"
              aria-expanded={profileOpen}
            >
              {adminAvatarUrl(admin?.avatarUrl) ? (
                <img src={adminAvatarUrl(admin?.avatarUrl)!} alt="" className="w-full h-full object-cover" />
              ) : (
                <span aria-hidden>{(admin?.name || admin?.email || "A").charAt(0).toUpperCase()}</span>
              )}
            </button>
            {profileOpen && (
              <div id="user-dropdown-menu" className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-card border border-border rounded-lg shadow-xl z-[100] py-2 animate-fade-in" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button-desktop">
                <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors" role="menuitem">
                  <UserCircle className="w-5 h-5 mr-2" />
                  Profile
                </Link>
                <button type="button" onClick={() => { setProfileOpen(false); logout(); }} className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors" role="menuitem">
                  <LogOut className="w-5 h-5 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>
        <div className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
