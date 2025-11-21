import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import Lottie from "lottie-react";

interface CoffeeBrewingLoaderProps {
  onComplete?: () => void;
}

const STAGES = [
  { threshold: 0, label: "Analyzing your AI visibility", description: "Scanning website structure" },
  { threshold: 15, label: "Extracting content signals", description: "Checking content clarity" },
  { threshold: 30, label: "Evaluating authority signals", description: "Analyzing competitor positioning" },
  { threshold: 50, label: "Generating optimization recommendations", description: "Testing ChatGPT compatibility" },
  { threshold: 75, label: "Finalizing your score", description: "Preparing detailed report" },
  { threshold: 90, label: "Just a few more seconds", description: "Completing final checks" },
];

export const CoffeeBrewingLoader = ({ onComplete }: CoffeeBrewingLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

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

  // Coffee brewing animation data - simple, professional coffee cup filling
  const coffeeAnimationData = {
    "v": "5.7.4",
    "fr": 30,
    "ip": 0,
    "op": 150,
    "w": 300,
    "h": 300,
    "nm": "Coffee Brewing",
    "ddd": 0,
    "assets": [],
    "layers": [
      {
        "ddd": 0,
        "ind": 1,
        "ty": 4,
        "nm": "Cup",
        "sr": 1,
        "ks": {
          "o": { "a": 0, "k": 100 },
          "r": { "a": 0, "k": 0 },
          "p": { "a": 0, "k": [150, 180, 0] },
          "a": { "a": 0, "k": [0, 0, 0] },
          "s": { "a": 0, "k": [100, 100, 100] }
        },
        "ao": 0,
        "shapes": [
          {
            "ty": "gr",
            "it": [
              {
                "ind": 0,
                "ty": "sh",
                "ks": {
                  "a": 0,
                  "k": {
                    "i": [[0,0],[0,0],[0,0],[0,0]],
                    "o": [[0,0],[0,0],[0,0],[0,0]],
                    "v": [[-50,-60],[-60,40],[60,40],[50,-60]],
                    "c": true
                  }
                }
              },
              {
                "ty": "st",
                "c": { "a": 0, "k": [0.4, 0.3, 0.25, 1] },
                "o": { "a": 0, "k": 100 },
                "w": { "a": 0, "k": 3 },
                "lc": 2,
                "lj": 2
              },
              {
                "ty": "fl",
                "c": { "a": 0, "k": [0.96, 0.95, 0.91, 0.1] },
                "o": { "a": 0, "k": 100 }
              },
              {
                "ty": "tr",
                "p": { "a": 0, "k": [0, 0] },
                "a": { "a": 0, "k": [0, 0] },
                "s": { "a": 0, "k": [100, 100] },
                "r": { "a": 0, "k": 0 },
                "o": { "a": 0, "k": 100 }
              }
            ]
          }
        ],
        "ip": 0,
        "op": 150,
        "st": 0,
        "bm": 0
      },
      {
        "ddd": 0,
        "ind": 2,
        "ty": 4,
        "nm": "Coffee Fill",
        "sr": 1,
        "ks": {
          "o": { "a": 0, "k": 100 },
          "r": { "a": 0, "k": 0 },
          "p": { "a": 0, "k": [150, 220, 0] },
          "a": { "a": 0, "k": [0, 0, 0] },
          "s": {
            "a": 1,
            "k": [
              { "t": 0, "s": [100, 0, 100], "h": 0 },
              { "t": 140, "s": [100, 100, 100], "h": 0 }
            ]
          }
        },
        "ao": 0,
        "shapes": [
          {
            "ty": "gr",
            "it": [
              {
                "ty": "rc",
                "d": 1,
                "s": { "a": 0, "k": [108, 90] },
                "p": { "a": 0, "k": [0, 0] },
                "r": { "a": 0, "k": 0 }
              },
              {
                "ty": "gf",
                "o": { "a": 0, "k": 100 },
                "g": {
                  "p": 3,
                  "k": {
                    "a": 0,
                    "k": [0, 0.82, 0.7, 0.55, 0.5, 0.6, 0.46, 0.34, 1, 0.44, 0.26, 0.13]
                  }
                },
                "s": { "a": 0, "k": [0, -45] },
                "e": { "a": 0, "k": [0, 45] },
                "t": 1
              },
              {
                "ty": "tr",
                "p": { "a": 0, "k": [0, 0] },
                "a": { "a": 0, "k": [0, 0] },
                "s": { "a": 0, "k": [100, 100] },
                "r": { "a": 0, "k": 0 },
                "o": { "a": 0, "k": 100 }
              }
            ]
          }
        ],
        "ip": 0,
        "op": 150,
        "st": 0,
        "bm": 0
      },
      {
        "ddd": 0,
        "ind": 3,
        "ty": 4,
        "nm": "Steam 1",
        "sr": 1,
        "ks": {
          "o": {
            "a": 1,
            "k": [
              { "t": 0, "s": [0], "h": 0 },
              { "t": 70, "s": [100], "h": 0 },
              { "t": 150, "s": [0], "h": 0 }
            ]
          },
          "r": { "a": 0, "k": 0 },
          "p": {
            "a": 1,
            "k": [
              { "t": 70, "s": [130, 120, 0], "h": 0 },
              { "t": 150, "s": [125, 60, 0], "h": 0 }
            ]
          },
          "a": { "a": 0, "k": [0, 0, 0] },
          "s": { "a": 0, "k": [100, 100, 100] }
        },
        "ao": 0,
        "shapes": [
          {
            "ty": "gr",
            "it": [
              {
                "ty": "el",
                "d": 1,
                "s": { "a": 0, "k": [8, 20] },
                "p": { "a": 0, "k": [0, 0] }
              },
              {
                "ty": "fl",
                "c": { "a": 0, "k": [0.7, 0.7, 0.7, 1] },
                "o": { "a": 0, "k": 50 }
              },
              {
                "ty": "tr",
                "p": { "a": 0, "k": [0, 0] },
                "a": { "a": 0, "k": [0, 0] },
                "s": { "a": 0, "k": [100, 100] },
                "r": { "a": 0, "k": 0 },
                "o": { "a": 0, "k": 100 }
              }
            ]
          }
        ],
        "ip": 70,
        "op": 150,
        "st": 0,
        "bm": 0
      },
      {
        "ddd": 0,
        "ind": 4,
        "ty": 4,
        "nm": "Steam 2",
        "sr": 1,
        "ks": {
          "o": {
            "a": 1,
            "k": [
              { "t": 0, "s": [0], "h": 0 },
              { "t": 80, "s": [100], "h": 0 },
              { "t": 150, "s": [0], "h": 0 }
            ]
          },
          "r": { "a": 0, "k": 0 },
          "p": {
            "a": 1,
            "k": [
              { "t": 80, "s": [150, 120, 0], "h": 0 },
              { "t": 150, "s": [155, 60, 0], "h": 0 }
            ]
          },
          "a": { "a": 0, "k": [0, 0, 0] },
          "s": { "a": 0, "k": [100, 100, 100] }
        },
        "ao": 0,
        "shapes": [
          {
            "ty": "gr",
            "it": [
              {
                "ty": "el",
                "d": 1,
                "s": { "a": 0, "k": [8, 20] },
                "p": { "a": 0, "k": [0, 0] }
              },
              {
                "ty": "fl",
                "c": { "a": 0, "k": [0.7, 0.7, 0.7, 1] },
                "o": { "a": 0, "k": 50 }
              },
              {
                "ty": "tr",
                "p": { "a": 0, "k": [0, 0] },
                "a": { "a": 0, "k": [0, 0] },
                "s": { "a": 0, "k": [100, 100] },
                "r": { "a": 0, "k": 0 },
                "o": { "a": 0, "k": 100 }
              }
            ]
          }
        ],
        "ip": 80,
        "op": 150,
        "st": 0,
        "bm": 0
      },
      {
        "ddd": 0,
        "ind": 5,
        "ty": 4,
        "nm": "Steam 3",
        "sr": 1,
        "ks": {
          "o": {
            "a": 1,
            "k": [
              { "t": 0, "s": [0], "h": 0 },
              { "t": 75, "s": [100], "h": 0 },
              { "t": 150, "s": [0], "h": 0 }
            ]
          },
          "r": { "a": 0, "k": 0 },
          "p": {
            "a": 1,
            "k": [
              { "t": 75, "s": [170, 120, 0], "h": 0 },
              { "t": 150, "s": [175, 60, 0], "h": 0 }
            ]
          },
          "a": { "a": 0, "k": [0, 0, 0] },
          "s": { "a": 0, "k": [100, 100, 100] }
        },
        "ao": 0,
        "shapes": [
          {
            "ty": "gr",
            "it": [
              {
                "ty": "el",
                "d": 1,
                "s": { "a": 0, "k": [8, 20] },
                "p": { "a": 0, "k": [0, 0] }
              },
              {
                "ty": "fl",
                "c": { "a": 0, "k": [0.7, 0.7, 0.7, 1] },
                "o": { "a": 0, "k": 50 }
              },
              {
                "ty": "tr",
                "p": { "a": 0, "k": [0, 0] },
                "a": { "a": 0, "k": [0, 0] },
                "s": { "a": 0, "k": [100, 100] },
                "r": { "a": 0, "k": 0 },
                "o": { "a": 0, "k": 100 }
              }
            ]
          }
        ],
        "ip": 75,
        "op": 150,
        "st": 0,
        "bm": 0
      }
    ]
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">{currentStage.label}</h2>
          <p className="text-sm text-muted-foreground">
            {progress >= 30 && progress < 50 && "We're about halfway through."}
            {progress >= 50 && progress < 75 && "Almost done! Final checks underway."}
            {progress >= 75 && "Just a few more seconds..."}
            {progress < 30 && currentStage.description}
          </p>
        </div>

        <div className="flex justify-center">
          <Lottie 
            animationData={coffeeAnimationData}
            loop={true}
            style={{ width: 200, height: 200 }}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{currentStage.label}</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{currentStage.description}</p>
          </div>

          {showWarning && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 flex gap-2">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                We're diving deep into your website. This thorough analysis usually takes 2-3 minutes total.
              </p>
            </div>
          )}

          <div className="rounded-lg border bg-muted/50 p-3 flex gap-2">
            <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              We're checking how easily ChatGPT understands your business.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
