import React, { useEffect, useState } from "react";
import { adminInvoicesList } from "@/lib/api";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import { SearchFilterBar, SearchFilterBarSearch } from "@/components/SearchFilterBar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const PAGE_SIZE = 10;

export default function Invoices() {
  const [invoices, setInvoices] = useState<Array<{ id: string; date: string | null; amount: number | null; status: string; hostedInvoiceUrl?: string; invoicePdf?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const searchQuery = useDebouncedValue(search, 300);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminInvoicesList({ userId: searchQuery || undefined, limit: 500 });
      setInvoices(res.data?.invoices ?? []);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [searchQuery]);
  useEffect(() => {
    load();
  }, [searchQuery]);

  const total = invoices.length;
  const paginatedInvoices = invoices.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <PageHeader title="Invoices" description="View Stripe invoices and PDF links." />
      <SearchFilterBar>
        <SearchFilterBarSearch
          value={search}
          onChange={setSearch}
          placeholder="Filter by user ID..."
        />
      </SearchFilterBar>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading…</div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No invoices. Stripe may not be configured or no invoices exist.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Link</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border last:border-0">
                    <td className="p-3 text-sm">{inv.date ? format(new Date(inv.date), "PP") : "—"}</td>
                    <td className="p-3">{inv.amount != null ? `$${inv.amount.toFixed(2)}` : "—"}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded text-xs bg-muted">{inv.status}</span></td>
                    <td className="p-3 text-right">
                      {inv.hostedInvoiceUrl && (
                        <a href={inv.hostedInvoiceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary text-sm">
                          View <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination page={page} limit={PAGE_SIZE} total={total} onPageChange={setPage} />
    </div>
  );
}
