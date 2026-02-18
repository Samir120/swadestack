import React, { useState, useEffect } from 'react';
import type { LucideProps } from 'lucide-react';

interface DynamicLucideIconProps extends LucideProps {
  name: string;
}

// Cache resolved icon components to avoid re-importing
const iconCache = new Map<string, React.FC<LucideProps>>();

/**
 * Dynamically loads a single Lucide icon by name.
 * Unlike `import { icons } from 'lucide-react'` which bundles ALL ~1600 icons,
 * this loads only the icons actually used at runtime.
 */
const DynamicLucideIcon: React.FC<DynamicLucideIconProps> = ({ name, ...props }) => {
  const [IconComponent, setIconComponent] = useState<React.FC<LucideProps> | null>(
    () => iconCache.get(name) || null
  );

  useEffect(() => {
    if (iconCache.has(name)) {
      setIconComponent(() => iconCache.get(name)!);
      return;
    }

    let cancelled = false;

    import('lucide-react').then((mod) => {
      if (cancelled) return;
      const icon = (mod as Record<string, unknown>)[name] as React.FC<LucideProps> | undefined;
      if (icon) {
        iconCache.set(name, icon);
        setIconComponent(() => icon);
      }
    });

    return () => { cancelled = true; };
  }, [name]);

  if (!IconComponent) return null;
  return <IconComponent {...props} />;
};

export default DynamicLucideIcon;
