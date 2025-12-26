import estimaiteLogo from '@/assets/estimaite-logo-tm.png';

interface EstimAIteLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTM?: boolean;
}

export function EstimAIteLogo({ className = '', size = 'md' }: EstimAIteLogoProps) {
  const sizeConfig = {
    sm: { width: 120, height: 40 },
    md: { width: 180, height: 60 },
    lg: { width: 280, height: 93 },
    xl: { width: 400, height: 133 },
  };

  const config = sizeConfig[size];

  return (
    <img
      src={estimaiteLogo}
      alt="EstimAIte"
      width={config.width}
      height={config.height}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}
