export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="12" fill="url(#ss-bg)" />
      <path
        d="M12 11.5h11.5a4.5 4.5 0 0 1 4.5 4.5v1.2L12 28.5V11.5Z"
        fill="white"
        fillOpacity="0.92"
      />
      <path
        d="M28 28.5H16.5A4.5 4.5 0 0 1 12 24v-1.2L28 11.5v17Z"
        fill="url(#ss-cyan)"
        fillOpacity="0.95"
      />
      <path
        d="M20.2 8.5 17 20h5.2L19.8 31.5 28 18.2h-5.4L26.2 8.5h-6Z"
        fill="#1b1433"
      />
      <defs>
        <linearGradient id="ss-bg" x1="6" y1="4" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" />
          <stop offset="1" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="ss-cyan" x1="12" y1="12" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67e8f9" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
    </svg>
  )
}
