import { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

const ScoreGauge = ({ score, size = 280 }: ScoreGaugeProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate the needle from 0 to the actual score
    const duration = 1000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * eased));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [score]);

  const getScoreColor = (s: number) => {
    if (s < 40) return "#DC2626"; // Red
    if (s < 60) return "#F97316"; // Orange
    if (s < 80) return "#2563EB"; // Blue
    return "#10B981"; // Green
  };

  const getScoreLabel = (s: number) => {
    if (s < 40) return "Needs Work";
    if (s < 60) return "Fair";
    if (s < 80) return "Good";
    return "Excellent";
  };

  // Calculate needle angle (180 degrees = full arc)
  // 0 score = -90deg (left), 100 score = 90deg (right)
  const needleAngle = -90 + (animatedScore / 100) * 180;

  const centerX = size / 2;
  const centerY = size / 2 + 20;
  const radius = size / 2 - 30;
  const needleLength = radius - 20;

  // Create arc paths for each zone
  const createArc = (startAngle: number, endAngle: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  // Zone angles (in SVG coordinate system, -180 is left, 0 is right)
  const zones = [
    { start: -180, end: -108, color: "#FEE2E2", darkColor: "#7F1D1D" }, // Red zone (0-39)
    { start: -108, end: -72, color: "#FFEDD5", darkColor: "#7C2D12" }, // Orange zone (40-59)
    { start: -72, end: -36, color: "#DBEAFE", darkColor: "#1E3A8A" }, // Blue zone (60-79)
    { start: -36, end: 0, color: "#D1FAE5", darkColor: "#064E3B" }, // Green zone (80-100)
  ];

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
        {/* Background arcs for each zone */}
        {zones.map((zone, i) => (
          <path
            key={i}
            d={createArc(zone.start, zone.end)}
            fill="none"
            stroke={zone.color}
            strokeWidth={24}
            strokeLinecap="round"
            className="dark:opacity-30"
          />
        ))}

        {/* Colored progress arc */}
        <path
          d={createArc(-180, -180 + (animatedScore / 100) * 180)}
          fill="none"
          stroke={getScoreColor(animatedScore)}
          strokeWidth={24}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 8px ${getScoreColor(animatedScore)}40)`,
          }}
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = -180 + (tick / 100) * 180;
          const rad = (angle * Math.PI) / 180;
          const innerR = radius - 32;
          const outerR = radius + 8;
          return (
            <g key={tick}>
              <line
                x1={centerX + innerR * Math.cos(rad)}
                y1={centerY + innerR * Math.sin(rad)}
                x2={centerX + outerR * Math.cos(rad)}
                y2={centerY + outerR * Math.sin(rad)}
                stroke="currentColor"
                strokeWidth={2}
                className="text-muted-foreground/40"
              />
              <text
                x={centerX + (radius + 24) * Math.cos(rad)}
                y={centerY + (radius + 24) * Math.sin(rad)}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-xs font-medium"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Needle */}
        <g
          style={{
            transform: `rotate(${needleAngle}deg)`,
            transformOrigin: `${centerX}px ${centerY}px`,
            transition: "transform 0.1s ease-out",
          }}
        >
          <line
            x1={centerX}
            y1={centerY}
            x2={centerX + needleLength}
            y2={centerY}
            stroke={getScoreColor(animatedScore)}
            strokeWidth={4}
            strokeLinecap="round"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={8}
            fill={getScoreColor(animatedScore)}
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={4}
            fill="white"
            className="dark:fill-background"
          />
        </g>
      </svg>

      {/* Score display */}
      <div className="text-center -mt-4">
        <div className="flex items-baseline justify-center gap-1">
          <span
            className="text-5xl font-bold"
            style={{ color: getScoreColor(animatedScore) }}
          >
            {animatedScore}
          </span>
          <span className="text-xl text-muted-foreground">/100</span>
        </div>
        <p
          className="text-lg font-semibold mt-1"
          style={{ color: getScoreColor(animatedScore) }}
        >
          {getScoreLabel(animatedScore)}
        </p>
        <p className="text-sm text-muted-foreground mt-1">AI Visibility Score</p>
      </div>
    </div>
  );
};

export default ScoreGauge;
