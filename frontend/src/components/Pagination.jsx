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

  // Google-style colored letters for the logo
  const letters = [
    { ch: "M", color: "#4285f4" },
    { ch: "y", color: "#ea4335" },
    { ch: "S", color: "#fbbc05" },
    { ch: "e", color: "#4285f4" },
    { ch: "a", color: "#34a853" },
    { ch: "r", color: "#ea4335" },
    { ch: "c", color: "#4285f4" },
    { ch: "h", color: "#fbbc05" },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Google-style logo letters as dots */}
      <div className="flex items-end gap-[3px]">
        {letters.map(({ ch, color }, i) => (
          <span key={i} className="text-xl font-bold" style={{ color }}>
            {ch}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-0">
        {/* Previous */}
        {page > 0 && (
          <button
            onClick={() => onPageChange(page - 1)}
            className="flex items-center gap-1 px-4 py-2 text-sm text-[#1a73e8] hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
        )}

        {/* Page numbers */}
        {pageNumbers.map((pn) => (
          <button
            key={pn}
            onClick={() => onPageChange(pn)}
            className={`w-10 h-10 flex items-center justify-center text-sm rounded-full transition-colors
              ${pn === page
                ? "text-gray-900 font-bold underline decoration-[#1a73e8] decoration-2 underline-offset-4"
                : "text-[#1a73e8] hover:underline"
              }`}
          >
            {pn + 1}
          </button>
        ))}

        {/* Next */}
        {page < totalPages - 1 && (
          <button
            onClick={() => onPageChange(page + 1)}
            className="flex items-center gap-1 px-4 py-2 text-sm text-[#1a73e8] hover:underline"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
