export default function ProcessingOverlay({ text = 'Processando...' }) {
  return (
    <div
      className="
        fixed inset-0 z-50 grid place-items-center
        bg-black/30 dark:bg-black/50 backdrop-blur-sm
      "
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div
        className="
          card flex items-center gap-3
          bg-white dark:bg-slate-900
          border border-slate-200 dark:border-slate-700
          text-slate-700 dark:text-slate-200
        "
      >
        <svg
          className="h-5 w-5 animate-spin text-slate-700 dark:text-slate-200"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
          />
        </svg>
        <span>{text}</span>
      </div>
    </div>
  )
}

