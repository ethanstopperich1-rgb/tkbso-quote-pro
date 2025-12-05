interface EstimAIteLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTM?: boolean;
}

export function EstimAIteLogo({ className = '', size = 'md', showTM = true }: EstimAIteLogoProps) {
  const sizeConfig = {
    sm: { width: 120, height: 30, fontSize: 18, tmSize: 6, tmDx: 1, tmDy: -10 },
    md: { width: 180, height: 45, fontSize: 28, tmSize: 8, tmDx: 1, tmDy: -16 },
    lg: { width: 280, height: 70, fontSize: 44, tmSize: 10, tmDx: 2, tmDy: -25 },
    xl: { width: 400, height: 100, fontSize: 60, tmSize: 12, tmDx: 2, tmDy: -35 },
  };

  const config = sizeConfig[size];

  return (
    <svg
      width={config.width}
      height={config.height}
      viewBox={`0 0 ${config.width} ${config.height}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <text
        x="50%"
        y="65%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Inter', 'SF Pro Display', 'Helvetica Neue', sans-serif"
        fontWeight="900"
        letterSpacing="-0.04em"
        fontSize={config.fontSize}
      >
        <tspan fill="#0B1C3E">Estim</tspan>
        <tspan fill="#00E5FF">AI</tspan>
        <tspan fill="#0B1C3E">te</tspan>
        {showTM && (
          <tspan
            dx={config.tmDx}
            dy={config.tmDy}
            fontFamily="sans-serif"
            fontWeight="500"
            fontSize={config.tmSize}
            fill="#94A3B8"
          >
            TM
          </tspan>
        )}
      </text>
    </svg>
  );
}
