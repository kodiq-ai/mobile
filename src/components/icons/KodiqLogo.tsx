import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

interface KodiqLogoProps {
  size?: number;
}

/** Kodiq "K" icon — white K with cyan triangle accent */
export function KodiqLogo({ size = 64 }: KodiqLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <G transform="translate(256,256) scale(0.65) translate(-256,-256)">
        <Path
          d="M29 79H150.658V222.556L304.758 79H414.25L262.583 221.745L484 432.619H332.333L150.658 260.676V336.914H29V79Z"
          fill="white"
        />
        <Path
          d="M29 432.621V353.949H221.219L304.758 432.621H29Z"
          fill="white"
        />
        <Path
          d="M170.124 177.948L170.124 79L276.295 79L170.124 177.948Z"
          fill="#49AAC7"
        />
      </G>
    </Svg>
  );
}
