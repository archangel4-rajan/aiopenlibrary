import type { ChainStepWithPrompt } from "@/lib/types";
import ChainStep from "./ChainStep";

interface ChainTimelineProps {
  steps: ChainStepWithPrompt[];
  isPurchased: boolean;
  isPremium: boolean;
}

export default function ChainTimeline({
  steps,
  isPurchased,
  isPremium,
}: ChainTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical connecting line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-stone-200 dark:bg-stone-700" />

      <div className="space-y-0">
        {steps.map((step, index) => (
          <ChainStep
            key={step.id}
            step={step}
            stepNumber={index + 1}
            isLocked={isPremium && !isPurchased}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
