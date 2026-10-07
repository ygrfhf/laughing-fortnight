import type { LucideIcon } from "lucide-react";

interface IconProps {
  icon: LucideIcon;
  /**
   * Leave out when the icon sits next to text that says the same thing (decorative).
   * Provide it only when the icon stands alone and must be announced.
   */
  label?: string;
  size?: string | number;
}

export function Icon({ icon: IconComponent, label, size = "1.25em" }: IconProps) {
  if (label) {
    return <IconComponent role="img" aria-label={label} focusable="false" size={size} className="lf-icon" />;
  }
  return <IconComponent aria-hidden="true" focusable="false" size={size} className="lf-icon" />;
}
