import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';

// Import icons
import iconDashboard from '../assets/icon-dashboard.png';
import iconHistory from '../assets/icon-history.png';
import iconProfile from '../assets/icon-profile.png';
import iconKegiatan from '../assets/icon-kegiatan.png';
import iconArchive from '../assets/icon-archive.png';

const BottomBar = ({
  items = [],
  activeHref,
  baseColor = '#1c5e22',
  pillColor = '#ffffff',
  pillTextColor = '#1c5e22',
  activeTextColor = '#1c5e22',
  inactiveTextColor = 'rgba(255, 255, 255, 0.6)'
}) => {
  const containerRef = useRef(null);
  const activePillRef = useRef(null);
  const itemRefs = useRef([]);
  const location = useLocation();
  const currentPath = activeHref || location.pathname;

  useEffect(() => {
    // Find the active item index (either matching href or explicitly marked isActive)
    const activeIndex = items.findIndex(item => item.href === currentPath || item.isActive);
    if (activeIndex === -1 || !activePillRef.current || !itemRefs.current[activeIndex]) {
      // If no match, hide the pill indicator
      gsap.to(activePillRef.current, { scale: 0, duration: 0.2 });
      return;
    }

    const activeEl = itemRefs.current[activeIndex];
    const containerEl = containerRef.current;
    
    if (!activeEl || !containerEl) return;

    // Get position of active item relative to the container
    const activeRect = activeEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();

    const left = activeRect.left - containerRect.left;
    const width = activeRect.width;
    const height = activeRect.height;

    // Animate the active pill background to the new position
    gsap.to(activePillRef.current, {
      x: left,
      width: width,
      height: height,
      scale: 1,
      duration: 0.3,
      ease: 'power3.out',
      overwrite: 'auto'
    });
  }, [currentPath, items]);

  // Helper to resolve icon based on label/path
  const getIcon = (label) => {
    const l = label.toLowerCase();
    if (l.includes('dashboard') || l.includes('overview') || l.includes('log')) return iconDashboard;
    if (l.includes('anggota') || l.includes('admin') || l.includes('profile') || l.includes('profil')) {
      if (l.includes('anggota') && !l.includes('dashboard')) return iconProfile;
      return iconProfile;
    }
    if (l.includes('history') || l.includes('riwayat')) return iconHistory;
    if (l.includes('acara') || l.includes('kegiatan')) return iconKegiatan;
    if (l.includes('laporan') || l.includes('report')) return iconArchive;
    if (l.includes('audit') || l.includes('logs')) return iconArchive;
    return iconDashboard;
  };

  return (
    <div 
      ref={containerRef}
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1c5e22] border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.16)] px-2"
      style={{ margin: 0, paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="relative flex justify-around items-center w-full h-[52px] py-1">
        {/* Sliding active indicator */}
        <div 
          ref={activePillRef}
          className="absolute left-0 rounded-xl bg-white ring-1 ring-white/5 pointer-events-none"
          style={{ 
            height: '44px',
            scale: 0,
            transformOrigin: 'center',
            willChange: 'transform, width'
          }}
        />

        {items.map((item, index) => {
          const isActive = item.href === currentPath || item.isActive;
          
          const handleClick = (e) => {
            if (item.onClick) {
              e.preventDefault();
              item.onClick();
            }
          };

          const Component = item.onClick ? 'button' : Link;
          const componentProps = item.onClick 
            ? { onClick: handleClick, type: 'button' } 
            : { to: item.href || '#' };
          
          return (
            <Component
              key={item.href || item.label}
              ref={el => { itemRefs.current[index] = el; }}
              className="relative flex-1 flex flex-col items-center justify-center py-1 z-10 select-none outline-none h-full"
              {...componentProps}
            >
              <img 
                src={getIcon(item.label)} 
                alt={item.label} 
                className={`h-4.5 w-4.5 object-contain transition-all duration-300 ${
                  isActive 
                    ? 'scale-110' 
                    : 'brightness-[10] opacity-60'
                }`}
                style={isActive ? { filter: 'invert(24%) sepia(85%) saturate(547%) hue-rotate(82deg) brightness(91%) contrast(92%)' } : {}}
              />
              <span 
                className={`text-[0.58rem] font-bold tracking-[0.08em] uppercase transition-colors duration-300 mt-0.5 ${
                  isActive 
                    ? 'text-[#1c5e22] font-extrabold' 
                    : 'text-white/60'
                }`}
              >
                {item.label}
              </span>
            </Component>
          );
        })}
      </div>
    </div>
  );
};

export default BottomBar;
