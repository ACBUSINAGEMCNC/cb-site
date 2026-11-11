export default function GearIcon({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M10.3 2h3.4l.55 2.2a8 8 0 0 1 1.6.67l1.96-1.15 2.4 2.4-1.15 1.96c.3.5.52 1.03.67 1.6L22 10.3v3.4l-2.27.55a8 8 0 0 1-.67 1.6l1.15 1.96-2.4 2.4-1.96-1.15a8 8 0 0 1-1.6.67L13.7 22h-3.4l-.55-2.27a8 8 0 0 1-1.6-.67l-1.96 1.15-2.4-2.4 1.15-1.96a8 8 0 0 1-.67-1.6L2 13.7v-3.4l2.27-.55c.15-.57.37-1.1.67-1.6L3.8 6.19l2.4-2.4 1.96 1.15a8 8 0 0 1 1.6-.67L10.3 2Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.15" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}
