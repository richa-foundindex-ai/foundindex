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
          {/* Cup - wider at top like real mug */}
          <div className="absolute inset-0 flex items-end justify-center">
            <div className="relative w-48 h-48 border-8 border-[#8B4513] rounded-b-[2.5rem] overflow-hidden bg-gradient-to-b from-white to-gray-50 animate-[shimmer_3s_ease-in-out_infinite]"
                 style={{ 
                   borderTopLeftRadius: '1.5rem',
                   borderTopRightRadius: '1.5rem',
                   clipPath: 'polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)'
                 }}>
              {/* Thicker rim with shine */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-white/70 via-white/40 to-transparent border-b-2 border-[#8B4513]/20" />
              
              {/* Coffee Fill */}
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#6F4E37] via-[#8B6F47] to-[#6F4E37] transition-all duration-1000 ease-in-out"
                style={{ height: `${progress}%` }}
              >
                {/* Coffee Surface Bubbles with percolation animation */}
                {progress > 0 && (
                  <>
                    <div className="absolute top-2 left-6 w-3 h-3 bg-[#A0826D] rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
                    <div className="absolute top-3 right-8 w-2 h-2 bg-[#A0826D] rounded-full animate-[pulse_1.8s_ease-in-out_infinite_0.3s]" />
                    <div className="absolute top-4 left-10 w-2.5 h-2.5 bg-[#A0826D] rounded-full animate-[pulse_2s_ease-in-out_infinite_0.6s]" />
                    <div className="absolute top-5 right-12 w-2 h-2 bg-[#A0826D] rounded-full animate-[pulse_1.6s_ease-in-out_infinite_0.9s]" />
                    <div className="absolute top-2 left-14 w-2.5 h-2.5 bg-[#A0826D] rounded-full animate-[pulse_2.2s_ease-in-out_infinite_1.2s]" />
                  </>
                )}
                
                {/* Coffee Beans - Organic, asymmetric dancing */}
                {progress >= 5 && (
                  <>
                    {/* 10 beans with truly random positions, staggered appearances */}
                    <div className="absolute w-3 h-4 bg-[#5C4033] rounded-full animate-bean-dance-1" 
                         style={{ bottom: '12%', left: '8%' }} />
                    <div className="absolute w-2.5 h-3.5 bg-[#5C4033] rounded-full animate-bean-dance-2" 
                         style={{ bottom: '38%', left: '72%' }} />
                    <div className="absolute w-3 h-4 bg-[#5C4033] rounded-full animate-bean-dance-3" 
                         style={{ bottom: '22%', left: '35%' }} />
                    <div className="absolute w-2 h-3 bg-[#5C4033] rounded-full animate-bean-dance-4" 
                         style={{ bottom: '45%', left: '18%' }} />
                    <div className="absolute w-2.5 h-3.5 bg-[#5C4033] rounded-full animate-bean-dance-5" 
                         style={{ bottom: '8%', left: '58%' }} />
                    <div className="absolute w-3 h-4 bg-[#5C4033] rounded-full animate-bean-dance-6" 
                         style={{ bottom: '30%', left: '85%' }} />
                    <div className="absolute w-2 h-3 bg-[#5C4033] rounded-full animate-bean-dance-7" 
                         style={{ bottom: '18%', left: '48%' }} />
                    <div className="absolute w-2.5 h-3.5 bg-[#5C4033] rounded-full animate-bean-dance-8" 
                         style={{ bottom: '42%', left: '28%' }} />
                    <div className="absolute w-3 h-4 bg-[#5C4033] rounded-full animate-bean-dance-9" 
                         style={{ bottom: '25%', left: '65%' }} />
                    <div className="absolute w-2.5 h-3.5 bg-[#5C4033] rounded-full animate-bean-dance-10" 
                         style={{ bottom: '35%', left: '92%' }} />
                  </>
                )}
              </div>
            </div>
            
            {/* Cup Handle - Completely outside the cup */}
            <div className="absolute -right-8 top-[calc(50%+12px)] -translate-y-1/2 w-16 h-20 border-8 border-[#8B4513] border-l-0 rounded-r-[3rem]" />
          </div>

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
