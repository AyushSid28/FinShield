const DownloadIcon = () => (
  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M10 3.5V11" strokeLinecap="round" />
    <path d="M6.8 8.8L10 12l3.2-3.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 14.5h12" strokeLinecap="round" />
  </svg>
);

export default function Navbar({ canDownload, onDownload }) {
  return (
    <header className="relative z-10 flex items-center justify-between gap-4 py-8 md:py-10">
      <div className="flex items-center gap-4">
        <img
          src="/shield-logo.svg"
          alt="FinShield"
          className="h-12 w-12 md:h-[58px] md:w-[58px]"
        />
      </div>

      <button
        type="button"
        className="icon-button"
        onClick={onDownload}
        disabled={!canDownload}
      >
        <DownloadIcon />
        <span>Download</span>
      </button>
    </header>
  );
}
