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

export const CoffeeBrewingLoader = ({ onComplete }: CoffeeBrewingLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Show warning banner after 60 seconds
    const warningTimeout = setTimeout(() => {
      setShowWarning(true);
    }, 60000);

    // Update progress every 1.5 seconds to reach 100% in ~150 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.67; // ~150 seconds total
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

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 space-y-6">
        {/* Warning Banner */}
        {showWarning && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                  Still brewing your perfect FoundIndex...
                </p>
                <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1">
                  This can take up to 2 minutes. Please don't close this window!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Brewing Your Results ☕</h2>
          <p className="text-muted-foreground">
            Testing your website across 15 AI queries...
          </p>
        </div>

        {/* Coffee Cup Animation */}
        <div className="relative w-64 h-64 mx-auto">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              {/* Inner shadow for depth */}
              <filter id="cupDepth">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                <feOffset dx="0" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              {/* Clip path for coffee fill */}
              <clipPath id="cupClip">
                <path d="M 50 60 L 60 180 Q 100 188 140 180 L 150 60 Q 100 65 50 60 Z" />
              </clipPath>
            </defs>
            
            {/* Cup Body with consistent outline */}
            <g filter="url(#cupDepth)">
              {/* Cup body background */}
              <path 
                d="M 50 60 L 60 180 Q 100 188 140 180 L 150 60 Q 100 65 50 60 Z"
                fill="url(#cupGradient)"
                stroke="#5D4037"
                strokeWidth="3"
                className="animate-[shimmer_3s_ease-in-out_infinite]"
              />
              
              {/* Rim highlight */}
              <ellipse cx="100" cy="60" rx="50" ry="8" 
                fill="url(#rimShine)" 
                opacity="0.7"
              />
            </g>
            
            {/* Coffee fill */}
            <g clipPath="url(#cupClip)">
              <rect 
                x="50" 
                y={200 - (progress * 1.2)} 
                width="100" 
                height={progress * 1.2}
                fill="url(#coffeeGradient)"
                className="transition-all duration-1000 ease-in-out"
              />
              
              {/* Coffee Surface Bubbles */}
              {progress > 0 && (
                <g>
                  <circle cx="75" cy={200 - (progress * 1.2)} r="3" fill="#A0826D" opacity="0.8" 
                    className="animate-[pulse_1.5s_ease-in-out_infinite]" />
                  <circle cx="115" cy={200 - (progress * 1.2) + 5} r="2" fill="#A0826D" opacity="0.8"
                    className="animate-[pulse_1.8s_ease-in-out_infinite_0.3s]" />
                  <circle cx="90" cy={200 - (progress * 1.2) + 8} r="2.5" fill="#A0826D" opacity="0.8"
                    className="animate-[pulse_2s_ease-in-out_infinite_0.6s]" />
                  <circle cx="105" cy={200 - (progress * 1.2) + 10} r="2" fill="#A0826D" opacity="0.8"
                    className="animate-[pulse_1.6s_ease-in-out_infinite_0.9s]" />
                  <circle cx="80" cy={200 - (progress * 1.2) + 3} r="2.5" fill="#A0826D" opacity="0.8"
                    className="animate-[pulse_2.2s_ease-in-out_infinite_1.2s]" />
                </g>
              )}
              
              {/* Coffee Beans - Organic, asymmetric dancing */}
              {progress >= 5 && (
                <g>
                  <ellipse cx="65" cy={200 - (progress * 1.2 * 0.12)} rx="3" ry="4" fill="#5C4033" 
                    className="animate-bean-dance-1" />
                  <ellipse cx="125" cy={200 - (progress * 1.2 * 0.38)} rx="2.5" ry="3.5" fill="#5C4033"
                    className="animate-bean-dance-2" />
                  <ellipse cx="85" cy={200 - (progress * 1.2 * 0.22)} rx="3" ry="4" fill="#5C4033"
                    className="animate-bean-dance-3" />
                  <ellipse cx="70" cy={200 - (progress * 1.2 * 0.45)} rx="2" ry="3" fill="#5C4033"
                    className="animate-bean-dance-4" />
                  <ellipse cx="110" cy={200 - (progress * 1.2 * 0.08)} rx="2.5" ry="3.5" fill="#5C4033"
                    className="animate-bean-dance-5" />
                  <ellipse cx="135" cy={200 - (progress * 1.2 * 0.30)} rx="3" ry="4" fill="#5C4033"
                    className="animate-bean-dance-6" />
                  <ellipse cx="95" cy={200 - (progress * 1.2 * 0.18)} rx="2" ry="3" fill="#5C4033"
                    className="animate-bean-dance-7" />
                  <ellipse cx="78" cy={200 - (progress * 1.2 * 0.42)} rx="2.5" ry="3.5" fill="#5C4033"
                    className="animate-bean-dance-8" />
                  <ellipse cx="118" cy={200 - (progress * 1.2 * 0.25)} rx="3" ry="4" fill="#5C4033"
                    className="animate-bean-dance-9" />
                  <ellipse cx="140" cy={200 - (progress * 1.2 * 0.35)} rx="2.5" ry="3.5" fill="#5C4033"
                    className="animate-bean-dance-10" />
                </g>
              )}
            </g>
            
            {/* Cup Handle - Properly attached with visible connection points */}
            <g>
              {/* Main handle curve */}
              <path 
                d="M 150 90 Q 175 90 175 120 Q 175 150 150 150"
                fill="none"
                stroke="#5D4037"
                strokeWidth="3"
                strokeLinecap="round"
              />
              
              {/* Inner handle curve for depth */}
              <path 
                d="M 150 95 Q 170 95 170 120 Q 170 145 150 145"
                fill="none"
                stroke="#7D5037"
                strokeWidth="1.5"
                opacity="0.6"
              />
              
              {/* Upper attachment point */}
              <circle cx="150" cy="90" r="3" fill="#5D4037" />
              
              {/* Lower attachment point */}
              <circle cx="150" cy="150" r="3" fill="#5D4037" />
            </g>
            
            {/* Gradients */}
            <defs>
              <linearGradient id="cupGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f3f4f6" />
              </linearGradient>
              
              <linearGradient id="coffeeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6F4E37" />
                <stop offset="50%" stopColor="#8B6F47" />
                <stop offset="100%" stopColor="#6F4E37" />
              </linearGradient>
              
              <radialGradient id="rimShine">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
                <stop offset="70%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>

          {/* Steam Animation - starts immediately */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2">
            <div className="relative">
              {/* Steam wisp 1 - starts immediately */}
              <div className="absolute w-2 h-12 bg-gradient-to-t from-gray-400 to-transparent opacity-70 rounded-full blur-sm" 
                   style={{ left: "-16px", animation: "steam-rise 3s ease-in-out infinite" }} />
              {/* Steam wisp 2 */}
              <div className="absolute w-2.5 h-16 bg-gradient-to-t from-gray-300 to-transparent opacity-60 rounded-full blur-sm" 
                   style={{ left: "-4px", animation: "steam-rise 2.5s ease-in-out infinite 0.5s" }} />
              {/* Steam wisp 3 */}
              <div className="absolute w-2 h-14 bg-gradient-to-t from-gray-400 to-transparent opacity-75 rounded-full blur-sm" 
                   style={{ left: "8px", animation: "steam-rise 2.8s ease-in-out infinite 1s" }} />
              {/* Steam wisp 4 - Intensifies at 75% */}
              {progress > 75 && (
                <div className="absolute w-1.5 h-10 bg-gradient-to-t from-gray-300 to-transparent opacity-65 rounded-full blur-sm" 
                     style={{ left: "16px", animation: "steam-rise 3.2s ease-in-out infinite 1.5s" }} />
              )}
            </div>
          </div>

          {/* Coffee Beans */}
          <div className="absolute top-2 left-2 text-2xl animate-bounce">🫘</div>
          <div className="absolute top-4 right-2 text-xl animate-bounce delay-300">🫘</div>
        </div>
        
        <style>{`
          @keyframes steam-rise {
            0% {
              transform: translateY(0) translateX(0) scale(1);
              opacity: 0;
            }
            30% {
              transform: translateY(-15px) translateX(3px) scale(1.1);
              opacity: 0.7;
            }
            70% {
              transform: translateY(-30px) translateX(-2px) scale(1.3);
              opacity: 0.4;
            }
            100% {
              transform: translateY(-40px) translateX(1px) scale(1.5);
              opacity: 0;
            }
          }
          
          @keyframes shimmer {
            0%, 100% {
              box-shadow: 0 0 5px rgba(139, 69, 19, 0.3);
            }
            50% {
              box-shadow: 0 0 15px rgba(139, 69, 19, 0.6), 0 0 25px rgba(139, 69, 19, 0.4);
            }
          }
          
          @keyframes bean-dance {
            0% {
              transform: translateY(0) translateX(0) rotate(0deg) scale(1);
              opacity: 0;
            }
            5% {
              opacity: 1;
              transform: translateY(0) translateX(0) rotate(15deg) scale(1.1);
            }
            15% {
              transform: translateY(-20px) translateX(8px) rotate(90deg) scale(0.9);
            }
            25% {
              transform: translateY(-45px) translateX(-12px) rotate(180deg) scale(1.2);
            }
            35% {
              transform: translateY(-75px) translateX(18px) rotate(270deg) scale(0.85);
            }
            45% {
              /* Pop up high */
              transform: translateY(-110px) translateX(-8px) rotate(360deg) scale(1.6);
              opacity: 1;
            }
            50% {
              /* Peak explosion */
              transform: translateY(-125px) translateX(5px) rotate(390deg) scale(1.8);
              opacity: 0.7;
            }
            60% {
              transform: translateY(-95px) translateX(-15px) rotate(480deg) scale(1.1);
              opacity: 0.9;
            }
            70% {
              transform: translateY(-60px) translateX(10px) rotate(540deg) scale(0.7);
            }
            80% {
              transform: translateY(-30px) translateX(-5px) rotate(630deg) scale(1.15);
            }
            90% {
              transform: translateY(-10px) translateX(3px) rotate(700deg) scale(0.95);
            }
            100% {
              transform: translateY(0) translateX(0) rotate(720deg) scale(1);
              opacity: 1;
            }
          }
          
          /* Staggered bean animations with 0.1-0.2s delays */
          .animate-bean-dance-1 {
            animation: bean-dance 3.8s ease-in-out infinite;
          }
          
          .animate-bean-dance-2 {
            animation: bean-dance 4.2s ease-in-out infinite 0.1s;
          }
          
          .animate-bean-dance-3 {
            animation: bean-dance 3.6s ease-in-out infinite 0.2s;
          }
          
          .animate-bean-dance-4 {
            animation: bean-dance 4.5s ease-in-out infinite 0.15s;
          }
          
          .animate-bean-dance-5 {
            animation: bean-dance 3.9s ease-in-out infinite 0.25s;
          }
          
          .animate-bean-dance-6 {
            animation: bean-dance 4.1s ease-in-out infinite 0.12s;
          }
          
          .animate-bean-dance-7 {
            animation: bean-dance 3.7s ease-in-out infinite 0.18s;
          }
          
          .animate-bean-dance-8 {
            animation: bean-dance 4.3s ease-in-out infinite 0.22s;
          }
          
          .animate-bean-dance-9 {
            animation: bean-dance 4.0s ease-in-out infinite 0.08s;
          }
          
          .animate-bean-dance-10 {
            animation: bean-dance 3.5s ease-in-out infinite 0.28s;
          }
        `}</style>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{Math.round(progress)}%</span>
            <span>~{Math.max(0, Math.round((100 - progress) * 1.5))} seconds remaining</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8B4513] via-[#A0826D] to-primary transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Stage - with pulse animation */}
        <div className="text-center space-y-1 min-h-[80px]">
          <p className="text-lg font-semibold animate-pulse">{currentStage.label}</p>
          <p className="text-sm text-muted-foreground">({currentStage.description})</p>
        </div>

        {/* Info Box */}
        <Card className="p-4 bg-accent-red-light border-primary/20">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-sm">Why does this take time?</p>
              <p className="text-sm text-muted-foreground">
                Each test runs 15 real AI queries through ChatGPT to see if it recommends your business. 
                Quality testing takes 60-90 seconds - just like brewing perfect coffee! ☕
              </p>
            </div>
          </div>
        </Card>

      </Card>
    </div>
  );
};
