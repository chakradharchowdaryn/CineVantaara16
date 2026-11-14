import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface CinematicLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'gold' | 'guest';
}

export const CinematicLogo: React.FC<CinematicLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  variant
}) => {
  const { isGuest } = useAuth();
  const isGuestMode = variant === 'guest' || (variant === undefined && isGuest);

  const sizeMap = {
    sm: { icon: 'w-8 h-8', text: 'text-base', sub: 'text-[9px]', star: 'w-2 h-2' },
    md: { icon: 'w-10 h-10', text: 'text-xl', sub: 'text-[10px]', star: 'w-2.5 h-2.5' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl', sub: 'text-xs', star: 'w-3.5 h-3.5' },
    xl: { icon: 'w-20 h-20', text: 'text-4xl', sub: 'text-sm', star: 'w-4 h-4' }
  }[size];

  return (
    <div className={`flex items-center space-x-3 group cursor-pointer select-none ${className}`}>
      {/* 3D Cinematic Golden Emblem with Ambient Halo */}
      <div
        className={`relative ${sizeMap.icon} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-500`}
      >
        {/* Soft Ambient Theme Glow Halo */}
        <div
          className="absolute -inset-1 rounded-full blur-md opacity-75 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-500"
          style={{ filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))' }}
        />

        {/* 3D Film Reel & Camera Silhouette Emblem */}
        <div className="relative w-full h-full rounded-full overflow-hidden border border-amber-400/60 p-0.5 bg-[#0D0B0A] shadow-xl flex items-center justify-center">
          <img
            src="/brand/logo-master.png"
            alt="CineVantaara"
            className="w-full h-full object-cover rounded-full transform group-hover:rotate-6 transition-transform duration-700 ease-out"
            loading="eager"
          />
        </div>
      </div>

      {/* Brand Typography matching user's image */}
      {showText && (
        <div className="flex flex-col">
          {/* Main Brand Title: "Cine" + "Vantaara" with Lens Flare Star */}
          <div className={`font-cinematic font-black tracking-wider leading-none flex items-center ${sizeMap.text}`}>
            {/* "Cine" in crisp white */}
            <span className="text-white drop-shadow-sm font-black">
              Cine
            </span>

            {/* "Vantaara" in Molten Gold with Star Flare */}
            <span className="relative bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent font-black tracking-wide ml-0.5 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
              Vantaara
              {/* Star Flare on the 'a' */}
              <span className="absolute -top-1.5 right-2 text-amber-300 text-xs animate-pulse opacity-90">✦</span>
            </span>

            {/* Guest Badge if guest */}
            {isGuestMode && (
              <span className="ml-2 text-[9px] font-sans font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 border border-red-500/50 shadow-sm">
                GUEST
              </span>
            )}
          </div>

          {/* Subtitle: "— where stories meet talent —" */}
          <div className="flex items-center space-x-1.5 mt-1">
            <span className="h-[1px] w-3 bg-gradient-to-r from-transparent to-amber-500/60" />
            <span
              className={`font-sans tracking-[0.2em] uppercase font-semibold ${sizeMap.sub} text-amber-200/80`}
            >
              where stories meet talent
            </span>
            <span className="h-[1px] w-3 bg-gradient-to-l from-transparent to-amber-500/60" />
          </div>
        </div>
      )}
    </div>
  );
};
