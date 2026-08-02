/**
 * The Kernly mark.
 *
 * A grain kernel drawn as two parts: an outer husk that is deliberately broken
 * open on the right, and a solid core sitting inside it. The gap is the whole
 * idea of the product rendered as geometry — the chaff is gone, the kernel
 * stays. It reads at 16px because the silhouette is one closed shape and the
 * gap is proportionally large.
 *
 * Built on a 32-unit grid with a 2.5-unit stroke so it aligns to the type
 * baseline at every size the site uses.
 */
export function Mark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Husk: an almond/vesica outline, opened on the trailing edge. */}
      <path
        d="M16 2.5C10 6.5 6.5 11 6.5 16C6.5 21 10 25.5 16 29.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="opacity-45"
      />
      <path
        d="M16 2.5C20.4 5.4 23.6 8.6 25.1 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="opacity-45"
      />
      <path
        d="M25.1 20C23.6 23.4 20.4 26.6 16 29.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="opacity-45"
      />
      {/* Kernel: the part worth keeping. */}
      <ellipse cx="16" cy="16" rx="4.6" ry="6.4" fill="var(--kernel)" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Mark size={26} />
      <span className="text-[19px] font-semibold tracking-[-0.03em]">Kernly</span>
    </span>
  );
}
