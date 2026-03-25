interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step.label} className="flex items-center gap-2 flex-1 last:flex-initial">
            {/* Dot + label */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary scale-100"
                    : isCurrent
                      ? "bg-primary ring-4 ring-primary/20 scale-110"
                      : "bg-muted"
                }`}
              />
              <span
                className={`text-xs transition-colors duration-300 hidden sm:inline ${
                  isCompleted || isCurrent
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                  isCompleted ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
