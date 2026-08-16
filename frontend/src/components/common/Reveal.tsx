import React, { useRef, useLayoutEffect } from 'react';

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Vertical offset to animate from, in px. */
  y?: number;
  /** Horizontal offset to animate from, in px. */
  x?: number;
  /** Scale to animate from. */
  scale?: number;
  /** Seconds. */
  delay?: number;
  /** Seconds. */
  duration?: number;
  /** Root margin for the intersection observer. */
  margin?: string;
  /** Render a different element than a div. */
  as?: keyof JSX.IntrinsicElements;
  style?: React.CSSProperties;
  id?: string;
  onClick?: React.MouseEventHandler;
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
  role?: string;
  tabIndex?: number;
  'aria-hidden'?: boolean;
  'aria-label'?: string;
};

/**
 * Scroll-entrance reveal driven entirely by CSS animation.
 *
 * Replaces framer-motion's `whileInView`, which had two problems here:
 *  - Content stayed at `opacity: 0` until an IntersectionObserver callback fired,
 *    so anything already inside the viewport on load stayed invisible for a beat
 *    and then popped in after the rest of the page had painted.
 *  - Nesting a `whileInView` parent around `whileInView` children multiplied the
 *    two opacities together, so children faded up through a parent that was
 *    itself still fading — reading as a flash rather than a fade.
 *
 * The visibility decision is made in a layout effect (before first paint) from a
 * synchronous `getBoundingClientRect`, so an element that is already on screen
 * animates immediately instead of waiting a frame for the observer. Elements
 * below the fold are marked pending and revealed when scrolled to. The final
 * state is held by `animation-fill-mode: both` rather than a React commit, so
 * there is no window where the animation has ended but the style has not landed.
 */
const Reveal: React.FC<RevealProps> = ({
  children,
  className = '',
  y = 24,
  x = 0,
  scale,
  delay = 0,
  duration = 0.5,
  margin = '0px 0px -80px 0px',
  as = 'div',
  style,
  id,
  ...rest
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No observer support (or a non-browser render): show the content, unanimated.
    if (typeof IntersectionObserver === 'undefined') {
      el.dataset.rv = 'in';
      return;
    }

    // Measured synchronously, before paint. Anything already on screen reveals
    // right away; only off-screen content is hidden pending a scroll.
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < vh && rect.bottom > 0) {
      el.dataset.rv = 'in';
      return;
    }

    el.dataset.rv = 'pending';
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.dataset.rv = 'in';
            io.disconnect();
          }
        }
      },
      { rootMargin: margin }
    );
    io.observe(el);
    return () => io.disconnect();
    // `margin` is a static string at every call site; the observer is set up once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Tag = as as React.ElementType;
  const vars = {
    '--rv-y': `${y}px`,
    '--rv-x': `${x}px`,
    ...(scale !== undefined ? { '--rv-s': `${scale}` } : null),
    '--rv-dur': `${duration}s`,
    '--rv-delay': `${delay}s`,
    ...style,
  } as React.CSSProperties;

  return (
    <Tag ref={ref} id={id} className={`rv ${className}`} style={vars} {...rest}>
      {children}
    </Tag>
  );
};

export default Reveal;
