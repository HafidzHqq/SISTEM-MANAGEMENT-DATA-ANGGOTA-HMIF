import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';

const BottomBar = ({
  items = [],
  activeHref,
  ease = 'power3.easeOut',
  baseColor = '#9df76b',
  pillColor = 'rgba(255, 255, 255, 0.08)',
  hoveredPillTextColor = '#003f17',
  pillTextColor = '#ffffff',
  className = '',
  initialLoadAnimation = false
}) => {
  const resolvedPillTextColor = pillTextColor ?? '#ffffff';
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const location = useLocation();
  const currentPath = activeHref || location.pathname;

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, i) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        if (w === 0 || h === 0) return;

        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        tlRefs.current[i]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.4, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 0.4, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: h + 12, opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 0.4, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[i] = tl;

        // Check if currently active and seek to end
        const isActive = items[i]?.href === currentPath || items[i]?.isActive;
        if (isActive) {
          tl.progress(1);
        } else {
          tl.progress(0);
        }
      });
    };

    // Run layout after short timeout to ensure rects are calculated
    const timer = setTimeout(layout, 50);

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, [items, currentPath, ease]);

  // Handle click animations or active state changes
  useEffect(() => {
    items.forEach((item, i) => {
      const isActive = item.href === currentPath || item.isActive;
      const tl = tlRefs.current[i];
      if (!tl) return;

      if (isActive) {
        gsap.to(tl, { progress: 1, duration: 0.35, ease: 'power2.out' });
      } else {
        gsap.to(tl, { progress: 0, duration: 0.25, ease: 'power2.out' });
      }
    });
  }, [currentPath, items]);

  const cssVars = {
    ['--base']: baseColor,
    ['--pill-bg']: pillColor,
    ['--hover-text']: hoveredPillTextColor,
    ['--pill-text']: resolvedPillTextColor,
    ['--nav-h']: '42px',
    ['--pill-pad-x']: '18px',
    ['--pill-gap']: '6px'
  };

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1c5e22] border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.16)] flex items-center justify-center py-2 px-3"
      style={{ margin: 0, paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
    >
      <nav
        className={`w-full flex items-center justify-center ${className}`}
        aria-label="Primary"
        style={cssVars}
      >
        <div
          className="relative flex items-center rounded-full w-full justify-around"
          style={{
            height: 'var(--nav-h)',
          }}
        >
          <ul
            role="menubar"
            className="list-none flex items-stretch m-0 p-[3px] h-full w-full justify-around"
            style={{ gap: 'var(--pill-gap)' }}
          >
            {items.map((item, i) => {
              const isActive = item.href === currentPath || item.isActive;

              const pillStyle = {
                background: 'var(--pill-bg)',
                color: 'var(--pill-text)',
                paddingLeft: 'var(--pill-pad-x)',
                paddingRight: 'var(--pill-pad-x)',
                height: '100%',
                flex: 1,
                maxWidth: '120px'
              };

              const PillContent = (
                <>
                  <span
                    className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none"
                    style={{
                      background: 'var(--base, #fff)',
                      willChange: 'transform'
                    }}
                    aria-hidden="true"
                    ref={el => {
                      circleRefs.current[i] = el;
                    }}
                  />
                  <span className="label-stack relative inline-block leading-[1] z-[2]">
                    <span
                      className="pill-label relative z-[2] inline-block leading-[1] text-[12px] font-bold uppercase tracking-[0.05em]"
                      style={{ willChange: 'transform' }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="pill-label-hover absolute left-0 top-0 z-[3] inline-block text-[12px] font-extrabold uppercase tracking-[0.05em]"
                      style={{
                        color: 'var(--hover-text)',
                        willChange: 'transform, opacity'
                      }}
                      aria-hidden="true"
                    >
                      {item.label}
                    </span>
                  </span>
                  {isActive && (
                    <span
                      className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-1.5 h-1.5 rounded-full z-[4]"
                      style={{ background: 'var(--base, #fff)' }}
                      aria-hidden="true"
                    />
                  )}
                </>
              );

              const basePillClasses =
                'relative overflow-hidden inline-flex items-center justify-center no-underline rounded-full box-border font-semibold whitespace-nowrap cursor-pointer px-0 select-none';

              return (
                <li key={item.href || item.label} role="none" className="flex h-full flex-1 justify-center">
                  {item.onClick ? (
                    <button
                      role="menuitem"
                      onClick={(e) => {
                        e.preventDefault();
                        item.onClick();
                      }}
                      className={basePillClasses}
                      style={pillStyle}
                      aria-label={item.label}
                    >
                      {PillContent}
                    </button>
                  ) : (
                    <Link
                      role="menuitem"
                      to={item.href}
                      className={basePillClasses}
                      style={pillStyle}
                      aria-label={item.label}
                    >
                      {PillContent}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default BottomBar;
