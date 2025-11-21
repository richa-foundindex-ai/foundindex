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

        <div className="relative w-full h-[450px] mx-auto flex items-center justify-center">
          {/* Steam wisps */}
          {progress > 10 && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-40 h-32 flex justify-center gap-4 z-20">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-3 opacity-0"
                  style={{
                    animation: `steam ${3 + i * 0.3}s ease-in-out infinite`,
                    animationDelay: `${i * 0.8}s`,
                  }}
                >
                  <div className="w-full h-28 bg-gradient-to-t from-gray-400/40 via-gray-300/20 to-transparent rounded-full blur-sm" />
                </div>
              ))}
            </div>
          )}

          {/* Coffee cup with transparent glass effect */}
          <div className="relative z-10">
            {/* Cup shadow base */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-72 h-6 bg-black/20 rounded-full blur-lg" />
            
            {/* Cup SVG - Larger transparent glass */}
            <svg width="320" height="380" viewBox="0 0 320 380" className="drop-shadow-2xl">
              <defs>
                {/* Glass gradient for transparency effect */}
                <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
                  <stop offset="50%" stopColor="rgba(255, 255, 255, 0.15)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.25)" />
                </linearGradient>
                
                {/* Coffee gradient */}
                <linearGradient id="coffeeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#D4A574" />
                  <stop offset="40%" stopColor="#B8865F" />
                  <stop offset="100%" stopColor="#8B5A3C" />
                </linearGradient>
                
                {/* Clip path for coffee inside cup */}
                <clipPath id="cupClip">
                  <path d="M 50 110 Q 48 240 68 340 L 252 340 Q 272 240 270 110 Z" />
                </clipPath>
                
                {/* Glass shine effect */}
                <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
                  <stop offset="50%" stopColor="rgba(255, 255, 255, 0.4)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                </linearGradient>
              </defs>
              
              {/* Coffee liquid inside cup */}
              <g clipPath="url(#cupClip)">
                <rect
                  x="48"
                  y={380 - (progress * 2.4)}
                  width="224"
                  height={progress * 2.4}
                  fill="url(#coffeeGradient)"
                  className="transition-all duration-1000 ease-out"
                />
                
                {/* Coffee beans inside the cup */}
                {showBeans && beans.map((bean) => {
                  const coffeeLevel = 380 - (progress * 2.4);
                  const beanY = Math.max(coffeeLevel + 20, 140);
                  const swirlX = 160 + Math.sin((bean.delay * 2 + progress / 20) * Math.PI) * 40;
                  const swirlY = beanY + Math.sin((bean.delay * 3 + progress / 15) * Math.PI) * 15;
                  
                  return (
                    <g key={bean.id} opacity={progress > 20 ? 1 : 0} className="transition-opacity duration-500">
                      <ellipse
                        cx={swirlX}
                        cy={swirlY}
                        rx="9"
                        ry="11"
                        fill="#6B4423"
                        transform={`rotate(${bean.rotation + progress * 2} ${swirlX} ${swirlY})`}
                      />
                      <line
                        x1={swirlX - 3}
                        y1={swirlY}
                        x2={swirlX + 3}
                        y2={swirlY}
                        stroke="#4A2F1A"
                        strokeWidth="2"
                        strokeLinecap="round"
                        transform={`rotate(${bean.rotation + progress * 2} ${swirlX} ${swirlY})`}
                      />
                    </g>
                  );
                })}
                
                {/* Coffee surface reflection */}
                {progress > 10 && (
                  <ellipse
                    cx="160"
                    cy={380 - (progress * 2.4)}
                    rx="100"
                    ry="18"
                    fill="white"
                    opacity="0.2"
                    className="transition-all duration-1000"
                  />
                )}
                
                {/* Sparkle effect when done */}
                {progress > 90 && (
                  <>
                    <circle cx="120" cy={380 - (progress * 2.4) - 15} r="3" fill="white" opacity="0.9" className="animate-pulse" />
                    <circle cx="200" cy={380 - (progress * 2.4) - 10} r="2.5" fill="white" opacity="0.8" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
                    <circle cx="160" cy={380 - (progress * 2.4) - 20} r="2" fill="white" opacity="0.7" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
                  </>
                )}
              </g>
              
              {/* Transparent glass cup body */}
              <path
                d="M 50 110 Q 48 240 68 340 L 252 340 Q 272 240 270 110 Z"
                fill="url(#glassGradient)"
                stroke="rgba(200, 200, 200, 0.6)"
                strokeWidth="3"
              />
              
              {/* Glass shine highlight */}
              <path
                d="M 70 130 Q 75 180 80 280"
                stroke="url(#shineGradient)"
                strokeWidth="25"
                fill="none"
                opacity="0.6"
              />
              
              {/* Cup rim (top ellipse) */}
              <ellipse 
                cx="160" 
                cy="110" 
                rx="110" 
                ry="22" 
                fill="rgba(255, 255, 255, 0.2)" 
                stroke="rgba(200, 200, 200, 0.6)" 
                strokeWidth="3"
              />
              
              {/* Inner rim shadow for depth */}
              <ellipse 
                cx="160" 
                cy="110" 
                rx="105" 
                ry="18" 
                fill="rgba(0, 0, 0, 0.1)" 
              />
              
              {/* Cup handle */}
              <path
                d="M 270 145 Q 300 145 310 180 Q 310 210 285 230 Q 275 235 270 220"
                fill="url(#glassGradient)"
                stroke="rgba(200, 200, 200, 0.6)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M 274 155 Q 295 155 302 180 Q 302 205 282 220"
                fill="none"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>

        <style>{`
          @keyframes steam {
            0% {
              opacity: 0;
              transform: translateY(0) scale(1);
            }
            20% {
              opacity: 0.6;
            }
            100% {
              opacity: 0;
              transform: translateY(-80px) scale(1.5);
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