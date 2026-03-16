import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  CreditCard,
  Link2,
  Store,
  Wallet,
  FileText,
} from "lucide-react";
import { adminDashboardStats, adminMe } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { format } from "date-fns";

export default function Dashboard() {
  const [counts, setCounts] = useState<{
    totalUsers: number;
    activeUsers: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalReferrals: number;
    referralLinksCount: number;
    marketplaceCount: number;
    partnersCount: number;
  } | null>(null);
  const [chartData, setChartData] = useState<{ date: string; users: number; subscriptions: number }[]>([]);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    adminMe()
      .then((r) => {
        if (!cancelled) setAdminName(r.data?.name || r.data?.email || "Admin");
      })
      .catch(() => {
        if (!cancelled) setAdminName("Admin");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    adminDashboardStats()
      .then((r) => {
        if (!cancelled && r.data) {
          setCounts(r.data.counts);
          setChartData(r.data.chartData || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCounts(null);
          setChartData([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statsGrid = [
    { label: "Users", value: String(counts?.activeUsers ?? "—"), icon: Users, color: "text-blue-600", bg: "bg-blue-50", path: "/users" },
    { label: "Subscriptions", value: String(counts?.activeSubscriptions ?? "—"), icon: CreditCard, color: "text-primary", bg: "bg-primary/10", path: "/subscriptions" },
    { label: "Referrals", value: String(counts?.totalReferrals ?? "—"), icon: Link2, color: "text-green-600", bg: "bg-green-50", path: "/referrals" },
    { label: "Marketplace", value: String(counts?.marketplaceCount ?? "—"), icon: Store, color: "text-amber-600", bg: "bg-amber-50", path: "/marketplace" },
  ];

  const formatChartDate = (dateStr: string) => {
    try {
      // dateStr is YYYY-MM
      const [y, m] = dateStr.split("-").map(Number);
      const d = new Date(y, (m || 1) - 1, 1);
      return format(d, "MMM");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader title="Dashboard" description="Overview of your platform." />

      {/* Single overview row: key counts only */}
      <div className="bg-card rounded-3xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            Platform overview
          </h3>
          <div className="flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
            <div className="w-2 h-2 rounded-full mr-2 bg-green-500 animate-pulse" />
            Admin active
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Active users</p>
            <p className="text-2xl font-black text-foreground">{counts?.activeUsers ?? "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Active subscriptions</p>
            <p className="text-2xl font-black text-primary">{counts?.activeSubscriptions ?? "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Referrals</p>
            <p className="text-2xl font-black text-foreground">{counts?.totalReferrals ?? "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Partners</p>
            <p className="text-2xl font-black text-foreground">{counts?.partnersCount ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Welcome + This month snapshot (no repeated counts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-primary rounded-[3rem] p-10 text-primary-foreground shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-2">
              Welcome back, {adminName?.split(" ")[0] || adminName || "Admin"}!
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-lg">
              Manage users, subscriptions, and content from the sidebar. Charts below show monthly signups.
            </p>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        </div>
        {(() => {
          const lastMonth = chartData.length > 0 ? chartData[chartData.length - 1] : null;
          const thisMonthLabel = lastMonth ? formatChartDate(lastMonth.date) : null;
          return (
            <div className="bg-primary rounded-[3rem] p-8 text-primary-foreground flex flex-col justify-between border-4 border-primary/20">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="w-5 h-5 text-primary-foreground/80" />
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-primary-foreground/80">
                    This month
                  </p>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-primary-foreground/60 mb-3">
                  {thisMonthLabel ?? "Last 12 months"}
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-primary-foreground/80">New users</span>
                    <span className="font-black text-xl">{lastMonth?.users ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-primary-foreground/80">New subscriptions</span>
                    <span className="font-black text-xl">{lastMonth?.subscriptions ?? 0}</span>
                  </div>
                </div>
                {chartData.length > 0 && (
                  <p className="text-xs text-primary-foreground/50 mt-4 pt-4 border-t border-white/20">
                    Total in last 12 months: {chartData.reduce((a, d) => a + d.users, 0)} users, {chartData.reduce((a, d) => a + d.subscriptions, 0)} subs
                  </p>
                )}
              </div>
              <Link
                to="/users"
                className="mt-6 w-full bg-white/20 text-primary-foreground py-3 rounded-xl text-sm font-bold border border-white/20 hover:bg-white/30 transition-all flex items-center justify-center"
              >
                <FileText className="w-4 h-4 mr-2" /> View all sections
              </Link>
            </div>
          );
        })()}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card rounded-3xl border border-border shadow-sm p-6">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">
            New users
          </h3>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatChartDate}
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(v) => formatChartDate(v)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [value, "Users"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#usersGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No user signups in the last 12 months
              </div>
            )}
          </div>
        </div>
        <div className="bg-card rounded-3xl border border-border shadow-sm p-6">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">
            New subscriptions
          </h3>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatChartDate}
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(v) => formatChartDate(v)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [value, "Subscriptions"]}
                  />
                  <Bar dataKey="subscriptions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No new subscriptions in the last 12 months
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {statsGrid.map((stat, i) => (
          <Link
            key={i}
            to={stat.path}
            className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-xl transition-all flex items-center group"
          >
            <div
              className={`${stat.bg} ${stat.color} p-4 rounded-xl mr-4 group-hover:scale-110 transition-transform`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
