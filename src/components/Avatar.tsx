import { useEffect, useState } from 'react';
import { initials } from '@/lib/stages';

// Lightness clamped to 30-36% so white initials always clear WCAG AA (4.5:1).
function avatarColor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstInitial = parts[0]?.[0] ?? '';
  const familyInitial = parts.length > 1 ? parts[parts.length - 1]![0] : firstInitial;
  const fCode = Math.abs(firstInitial.toLowerCase().charCodeAt(0) || 97) - 97;
  const lCode = Math.abs(familyInitial.toLowerCase().charCodeAt(0) || 97) - 97;
  const hue = (((lCode * 47) % 360) + 360) % 360;
  const sat = 55 + ((fCode * 7 < 0 ? -(fCode * 7) : fCode * 7) % 21);
  const light = 30 + ((fCode * 5 < 0 ? -(fCode * 5) : fCode * 5) % 7);
  return `hsl(${hue} ${sat}% ${light}%)`;
}

export function Avatar({
  name,
  email,
  size = 'md',
}: {
  name: string;
  email?: string;
  size?: 'md' | 'lg';
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [email]);

  const cls = size === 'lg' ? 'h-12 w-12 text-base' : 'h-10 w-10 text-sm';

  const fallback = (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${cls}`}
      style={{ backgroundColor: avatarColor(name) }}
    >
      {initials(name)}
    </div>
  );

  if (email && !failed) {
    return (
      <img
        src={`https://unavatar.io/${encodeURIComponent(email)}?fallback=false`}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${cls} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return fallback;
}
