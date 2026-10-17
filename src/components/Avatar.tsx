import { useEffect, useState } from 'react';
import { initials } from '@/lib/stages';

// Two harmonious hues (accent 50deg from primary) with saturation 65-80% and
// lightness clamped to 30-36% so white initials always clear WCAG AA (4.5:1).
function getAvatarData(name: string): { fallbackGradient: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstInitial = parts[0]?.[0] ?? '';
  const familyInitial = parts.length > 1 ? parts[parts.length - 1]![0] : firstInitial;
  const fCode = Math.abs((firstInitial.toLowerCase().charCodeAt(0) || 97) - 97);
  const lCode = Math.abs((familyInitial.toLowerCase().charCodeAt(0) || 97) - 97);
  const hue1 = (((lCode * 47) % 360) + 360) % 360;
  const hue2 = (hue1 + 45 + (fCode % 16)) % 360;
  const sat1 = 65 + (fCode % 16);
  const sat2 = 65 + ((fCode + 7) % 16);
  const light1 = 30 + (fCode % 7);
  const light2 = 30 + ((fCode + 3) % 7);
  return {
    fallbackGradient: `linear-gradient(135deg, hsl(${hue1}, ${sat1}%, ${light1}%) 0%, hsl(${hue2}, ${sat2}%, ${light2}%) 100%)`,
  };
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

  const { fallbackGradient } = getAvatarData(name);

  const fallback = (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-1 ring-white/10 dark:ring-white/15 ${cls}`}
      style={{ background: fallbackGradient }}
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
