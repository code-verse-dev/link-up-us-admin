type Props = {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
};

function getPageNumbers(current: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [];
  const showLeft = current > 2;
  const showRight = current < totalPages - 1;
  pages.push(1);
  if (showLeft) pages.push("ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  for (let i = start; i <= end; i++) {
    if (i !== 1 && i !== totalPages) pages.push(i);
  }
  if (showRight) pages.push("ellipsis");
  if (totalPages > 1) pages.push(totalPages);
  return pages;
}

export default function Pagination({ page, limit, total, onPageChange }: Props) {
  if (total === 0) return null;
  const totalPages = Math.ceil(total / limit);
  const start = page * limit + 1;
  const end = Math.min((page + 1) * limit, total);
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;
  const pageNumbers = getPageNumbers(page + 1, totalPages);

  return (
    <div className="flex items-center gap-3 flex-wrap mt-6">
      <span className="text-sm text-muted-foreground mr-2">
        {start}–{end} of {total}
      </span>
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev}
          className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-50 hover:bg-muted text-sm font-medium"
          aria-label="Previous page"
        >
          Previous
        </button>
        {pageNumbers.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-muted-foreground text-sm" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p - 1)}
              className={`min-w-[2.25rem] px-3 py-1.5 rounded-lg border text-sm font-medium ${
                page + 1 === p
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-muted"
              }`}
              aria-label={`Page ${p}`}
              aria-current={page + 1 === p ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
          className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-50 hover:bg-muted text-sm font-medium"
          aria-label="Next page"
        >
          Next
        </button>
      </nav>
    </div>
  );
}
