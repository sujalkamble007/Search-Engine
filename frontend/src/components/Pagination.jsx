export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(0, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);
    
    // Adjust start if we're near the end
    if (end - start < maxVisible - 1) {
      start = Math.max(0, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      {/* Previous Button */}
      <button
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg 
                   disabled:opacity-40 disabled:cursor-not-allowed
                   hover:bg-gray-50 hover:border-gray-400 transition-all
                   flex items-center gap-1 text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Prev
      </button>

      {/* First page + ellipsis */}
      {pageNumbers[0] > 0 && (
        <>
          <button
            onClick={() => onPageChange(0)}
            className="w-10 h-10 rounded-lg border border-gray-300 
                       hover:bg-gray-50 transition-all text-sm font-medium"
          >
            1
          </button>
          {pageNumbers[0] > 1 && (
            <span className="px-2 text-gray-400">...</span>
          )}
        </>
      )}

      {/* Page Numbers */}
      {pageNumbers.map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`w-10 h-10 rounded-lg border transition-all text-sm font-medium
            ${pageNum === page
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400"
            }`}
        >
          {pageNum + 1}
        </button>
      ))}

      {/* Last page + ellipsis */}
      {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 2 && (
            <span className="px-2 text-gray-400">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages - 1)}
            className="w-10 h-10 rounded-lg border border-gray-300 
                       hover:bg-gray-50 transition-all text-sm font-medium"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        disabled={page + 1 >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg 
                   disabled:opacity-40 disabled:cursor-not-allowed
                   hover:bg-gray-50 hover:border-gray-400 transition-all
                   flex items-center gap-1 text-sm font-medium"
      >
        Next
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
