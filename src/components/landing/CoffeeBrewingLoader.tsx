import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CoffeeBrewingLoaderProps {
  onComplete?: () => void;
}

const STAGES = [
  { threshold: 0, label: "Setting up...", description: "Preparing your test" },
  { threshold: 15, label: "Analyzing website...", description: "Understanding your business" },
  { threshold: 30, label: "Generating queries...", description: "Creating buyer questions" },
  { threshold: 50, label: "Testing AI engines...", description: "Querying ChatGPT, Claude, Perplexity" },
  { threshold: 75, label: "Calculating scores...", description: "Computing your FoundIndex" },
  { threshold: 90, label: "Almost done...", description: "Finalizing results" },
];

interface Bean {
  id: number;
  x: number;
  delay: number;
  rotation: number;
}

export const CoffeeBrewingLoader = ({ onComplete }: CoffeeBrewingLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [beans] = useState<Bean[]>([
    { id: 1, x: 15, delay: 0, rotation: -25 },
    { id: 2, x: 70, delay: 0.4, rotation: 15 },
    { id: 3, x: 35, delay: 0.8, rotation: -10 },
    { id: 4, x: 55, delay: 1.2, rotation: 30 },
    { id: 5, x: 25, delay: 1.6, rotation: -35 },
    { id: 6, x: 80, delay: 2.0, rotation: 20 },
    { id: 7, x: 45, delay: 2.4, rotation: -15 },
  ]);

  useEffect(() => {
    const warningTimeout = setTimeout(() => setShowWarning(true), 60000);
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.67;
        if (next >= 100) {
          clearInterval(interval);
          onComplete?.();
          return 100;
        }
        return next;
      });
    }, 1000);
    return () => {
      clearInterval(interval);
      clearTimeout(warningTimeout);
    };
  }, [onComplete]);

  const currentStage = STAGES.slice().reverse().find(stage => progress >= stage.threshold) || STAGES[0];
  const showBeans = progress >= 5;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 space-y-6">
        {showWarning && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">Still brewing your perfect FoundIndex...</p>
                <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1">This can take up to 2 minutes. Please don't close this window!</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Brewing Your Results ☕</h2>
          <p className="text-muted-foreground">Analyzing your website's AI-readiness...</p>
        </div>

        <div className="relative w-80 h-80 mx-auto flex items-center justify-center">
          {/* Steam wisps */}
          {progress > 10 && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-24 flex justify-center gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 opacity-0"
                  style={{
                    animation: `steam ${3 + i * 0.3}s ease-in-out infinite`,
                    animationDelay: `${i * 0.8}s`,
                  }}
                >
                  <div className="w-full h-20 bg-gradient-to-t from-gray-400/40 via-gray-300/20 to-transparent rounded-full blur-sm" />
                </div>
              ))}
            </div>
          )}

          {/* Coffee beans falling and swirling */}
          {showBeans && (
            <div className="absolute inset-0">
              {beans.map((bean) => (
                <div
                  key={bean.id}
                  className="absolute top-10"
                  style={{
                    left: `${bean.x}%`,
                    animation: progress < 75 
                      ? `beanPop 1.2s ease-out ${bean.delay}s forwards, beanSwirl 4s ease-in-out ${bean.delay + 1.2}s infinite`
                      : `beanDance 2s ease-in-out ${bean.delay}s infinite`,
                    animationDelay: `${bean.delay}s`,
                  }}
                >
                  {/* Coffee bean shape */}
                  <div className="relative w-4 h-5">
                    <div 
                      className="absolute inset-0 bg-gradient-to-br from-[#8B6F47] to-[#654321] rounded-full shadow-lg"
                      style={{ transform: `rotate(${bean.rotation}deg)` }}
                    />
                    <div 
                      className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#4a3520]"
                      style={{ transform: `rotate(${bean.rotation}deg)` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Coffee cup with 3D effect */}
          <div className="relative z-10">
            {/* Cup shadow base */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-4 bg-black/20 rounded-full blur-md" />
            
            {/* Cup body - 3D perspective */}
            <svg width="140" height="160" viewBox="0 0 140 160" className="drop-shadow-xl">
              {/* Cup back edge (gives depth) */}
              <ellipse cx="70" cy="45" rx="52" ry="12" fill="#6B5744" opacity="0.3" />
              
              {/* Cup body */}
              <path
                d="M 20 45 Q 18 100 30 140 L 110 140 Q 122 100 120 45 Z"
                fill="url(#cupGradient)"
                stroke="#5D4037"
                strokeWidth="2.5"
              />
              
              {/* Cup top ellipse */}
              <ellipse cx="70" cy="45" rx="50" ry="12" fill="#8B6F47" stroke="#5D4037" strokeWidth="2.5" />
              
              {/* Cup handle */}
              <path
                d="M 120 60 Q 140 60 145 80 Q 145 95 130 100 Q 125 102 120 95"
                fill="none"
                stroke="#5D4037"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 122 65 Q 135 65 138 80 Q 138 90 128 95"
                fill="none"
                stroke="#8B6F47"
                strokeWidth="2"
                opacity="0.6"
              />
              
              {/* Coffee liquid */}
              <defs>
                <clipPath id="cupClip">
                  <path d="M 22 48 Q 20 100 31 138 L 109 138 Q 120 100 118 48 Z" />
                </clipPath>
                <linearGradient id="coffeeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#D2B48C" />
                  <stop offset="50%" stopColor="#A0826D" />
                  <stop offset="100%" stopColor="#704214" />
                </linearGradient>
                <linearGradient id="cupGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A68A64" />
                  <stop offset="50%" stopColor="#8B6F47" />
                  <stop offset="100%" stopColor="#6B5744" />
                </linearGradient>
              </defs>
              
              <g clipPath="url(#cupClip)">
                <rect
                  x="20"
                  y={160 - (progress * 0.9)}
                  width="100"
                  height={progress * 0.9}
                  fill="url(#coffeeGradient)"
                  className="transition-all duration-1000 ease-out"
                />
                {/* Coffee surface reflection */}
                {progress > 20 && (
                  <ellipse
                    cx="70"
                    cy={160 - (progress * 0.9)}
                    rx="45"
                    ry="8"
                    fill="white"
                    opacity={progress > 80 ? "0.25" : "0.15"}
                    className="transition-opacity duration-1000"
                  />
                )}
                {/* Sparkle effect when done */}
                {progress > 90 && (
                  <>
                    <circle cx="50" cy={160 - (progress * 0.9) - 10} r="2" fill="white" opacity="0.8" className="animate-pulse" />
                    <circle cx="90" cy={160 - (progress * 0.9) - 5} r="1.5" fill="white" opacity="0.7" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
                    <circle cx="70" cy={160 - (progress * 0.9) - 15} r="1" fill="white" opacity="0.6" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
                  </>
                )}
              </g>
            </svg>
          </div>
        </div>

        <style>{`
          @keyframes beanPop {
            0% {
              transform: translateY(-50px) scale(0) rotate(0deg);
              opacity: 0;
            }
            60% {
              transform: translateY(140px) scale(1.2) rotate(180deg);
              opacity: 1;
            }
            100% {
              transform: translateY(130px) scale(1) rotate(360deg);
              opacity: 1;
            }
          }

          @keyframes beanSwirl {
            0%, 100% {
              transform: translateY(130px) translateX(0px) rotate(0deg);
            }
            25% {
              transform: translateY(125px) translateX(8px) rotate(90deg);
            }
            50% {
              transform: translateY(135px) translateX(0px) rotate(180deg);
            }
            75% {
              transform: translateY(125px) translateX(-8px) rotate(270deg);
            }
          }

          @keyframes beanDance {
            0%, 100% {
              transform: translateY(130px) translateX(0px) rotate(0deg) scale(1);
            }
            25% {
              transform: translateY(115px) translateX(-12px) rotate(-25deg) scale(1.1);
            }
            50% {
              transform: translateY(125px) translateX(0px) rotate(0deg) scale(1);
            }
            75% {
              transform: translateY(115px) translateX(12px) rotate(25deg) scale(1.1);
            }
          }
        `}</style>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{currentStage.label}</span>
            <span className="text-muted-foreground">{Math.min(Math.round(progress), 100)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">{currentStage.description}</p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground">
              We're fetching your site, analyzing content structure, checking authority signals, and generating your detailed report. This takes 2-3 minutes.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};