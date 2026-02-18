export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 10;
    let start = Math.max(0, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(0, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Decorative dots */}
      <div className="flex items-center gap-1">
        {[...Array(Math.min(totalPages, 5))].map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: i === Math.min(page, 4) ? "var(--accent)" : "var(--border-primary)",
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-0 font-mono text-[13px]">
        {/* Previous */}
        {page > 0 && (
          <button
            onClick={() => onPageChange(page - 1)}
            className="flex items-center gap-1.5 px-3 py-2 transition-opacity hover:opacity-60"
            style={{ color: "var(--accent)" }}
          >
            ← prev
          </button>
        )}

        {/* Page numbers */}
        {pageNumbers.map((pn) => (
          <button
            key={pn}
            onClick={() => onPageChange(pn)}
            className="w-9 h-9 flex items-center justify-center rounded-md transition-colors"
            style={{
              background: pn === page ? "var(--accent-subtle)" : "transparent",
              color: pn === page ? "var(--accent)" : "var(--text-tertiary)",
              fontWeight: pn === page ? 600 : 400,
            }}
            onMouseEnter={(e) => {
              if (pn !== page) e.currentTarget.style.background = "var(--bg-secondary)";
            }}
            onMouseLeave={(e) => {
              if (pn !== page) e.currentTarget.style.background = "transparent";
            }}
          >
            {pn + 1}
          </button>
        ))}

        {/* Next */}
        {page < totalPages - 1 && (
          <button
            onClick={() => onPageChange(page + 1)}
            className="flex items-center gap-1.5 px-3 py-2 transition-opacity hover:opacity-60"
            style={{ color: "var(--accent)" }}
          >
            next →
          </button>
        )}
      </div>
    </div>
  );
}
