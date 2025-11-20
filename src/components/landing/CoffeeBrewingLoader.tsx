import { useEffect, useState } from "react";
import { Info, Volume2, VolumeX } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [soundEnabled, setSoundEnabled] = useState(false);
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
          {/* Cup */}
          <div className="absolute inset-0 flex items-end justify-center">
            <div className="relative w-48 h-48 border-8 border-[#8B4513] rounded-b-3xl overflow-hidden bg-gradient-to-b from-white to-gray-50">
              {/* Rim shine/highlight */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-white/60 to-transparent" />
              
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
                
                {/* Jumping Coffee Beans - appear at 20% with staggered pop-in */}
                {progress >= 20 && (
                  <>
                    {/* Bean 1 - Pops in first */}
                    <div className="absolute bottom-8 left-8 w-3 h-4 bg-[#5C4033] rounded-full animate-bean-pop animate-bean-float" 
                         style={{ animationDelay: '0s' }} />
                    {/* Bean 2 */}
                    <div className="absolute bottom-12 right-10 w-2.5 h-3.5 bg-[#5C4033] rounded-full animate-bean-pop-delayed-1 animate-bean-float-1" />
                    {/* Bean 3 */}
                    <div className="absolute bottom-6 left-16 w-3 h-4 bg-[#5C4033] rounded-full animate-bean-pop-delayed-2 animate-bean-float-2" />
                    {progress >= 35 && (
                      <>
                        {/* Bean 4 */}
                        <div className="absolute bottom-10 right-16 w-2.5 h-3.5 bg-[#5C4033] rounded-full animate-bean-pop animate-bean-float-3" />
                        {/* Bean 5 */}
                        <div className="absolute bottom-14 left-12 w-2 h-3 bg-[#5C4033] rounded-full animate-bean-pop-delayed-1 animate-bean-float-4" />
                      </>
                    )}
                    {progress >= 50 && (
                      <>
                        {/* Bean 6 */}
                        <div className="absolute bottom-9 right-14 w-3 h-4 bg-[#5C4033] rounded-full animate-bean-pop-delayed-2 animate-bean-float-5" />
                        {/* Bean 7 */}
                        <div className="absolute bottom-16 left-14 w-2.5 h-3.5 bg-[#5C4033] rounded-full animate-bean-pop animate-bean-float-6" />
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Cup Handle - OUTSIDE the overflow-hidden container */}
            <div className="absolute right-[20px] top-[calc(50%+12px)] -translate-y-1/2 w-14 h-20 border-8 border-[#8B4513] border-l-0 rounded-r-full" />
          </div>

          {/* Steam Animation - more dynamic with 4 wisps */}
          {progress > 10 && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2">
              <div className="relative">
                {/* Steam wisp 1 */}
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
          )}

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
          
          @keyframes bean-pop {
            0% {
              transform: translateY(-100px) scale(0) rotate(0deg);
              opacity: 0;
            }
            60% {
              transform: translateY(5px) scale(1.15) rotate(180deg);
            }
            100% {
              transform: translateY(0) scale(1) rotate(360deg);
              opacity: 1;
            }
          }
          
          @keyframes bean-float {
            0%, 100% {
              transform: translate(0, 0) rotate(0deg);
            }
            25% {
              transform: translate(2px, -2px) rotate(5deg);
            }
            50% {
              transform: translate(-2px, 2px) rotate(-5deg);
            }
            75% {
              transform: translate(2px, 2px) rotate(3deg);
            }
          }
          
          .animate-bean-pop {
            animation: bean-pop 0.8s ease-out forwards;
          }
          
          .animate-bean-pop-delayed-1 {
            animation: bean-pop 0.8s ease-out 0.2s forwards;
          }
          
          .animate-bean-pop-delayed-2 {
            animation: bean-pop 0.8s ease-out 0.4s forwards;
          }
          
          .animate-bean-float {
            animation: bean-float 3s ease-in-out infinite 1s;
          }
          
          .animate-bean-float-1 {
            animation: bean-float 3.2s ease-in-out infinite 1.2s;
          }
          
          .animate-bean-float-2 {
            animation: bean-float 2.8s ease-in-out infinite 1.4s;
          }
          
          .animate-bean-float-3 {
            animation: bean-float 3.1s ease-in-out infinite 0.5s;
          }
          
          .animate-bean-float-4 {
            animation: bean-float 2.9s ease-in-out infinite 0.7s;
          }
          
          .animate-bean-float-5 {
            animation: bean-float 3.3s ease-in-out infinite 0.3s;
          }
          
          .animate-bean-float-6 {
            animation: bean-float 2.7s ease-in-out infinite 0.9s;
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

        {/* Current Stage */}
        <div className="text-center space-y-1 min-h-[80px]">
          <p className="text-lg font-semibold">{currentStage.label}</p>
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

        {/* Sound Toggle */}
        <div className="flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-full hover:bg-accent transition-colors"
                  aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
                >
                  {soundEnabled ? (
                    <Volume2 className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bean-grinding sound effects {soundEnabled ? "enabled" : "disabled"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </Card>
    </div>
  );
};
