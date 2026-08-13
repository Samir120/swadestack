import React from 'react';
import { iconRegistry, type IconProps } from './icons';

interface DynamicLucideIconProps extends IconProps {
  name: string;
}

/**
 * Resolves an admin-configured icon by name from the local icon registry.
 *
 * Previously this did a runtime `import('lucide-react')`, which pulled the whole
 * ~1600-icon barrel into an 867KB async chunk and made icons appear a frame or
 * two after their surrounding content. Icons now resolve synchronously on first
 * render, so nothing pops in late.
 *
 * Names come from the DB (PascalCase, e.g. "ShieldCheck"). Unknown names render
 * nothing — add them to scripts/gen-icons.py and regenerate.
 */
const DynamicLucideIcon: React.FC<DynamicLucideIconProps> = ({ name, ...props }) => {
  const IconComponent = iconRegistry[name];

  if (!IconComponent) {
    if (import.meta.env.DEV && name) {
      console.warn(`[DynamicLucideIcon] Unknown icon "${name}" — add it to scripts/gen-icons.py`);
    }
    return null;
  }

  return <IconComponent {...props} />;
};

export default DynamicLucideIcon;
