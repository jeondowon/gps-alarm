import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Search, Bell, Navigation } from "lucide-react";
import { Button } from "./ui/button";

const TUTORIAL_STEPS = [
  {
    icon: Search,
    title: "Find Your Stop",
    description: "Search for your destination or tap anywhere on the map to set a target.",
  },
  {
    icon: Navigation,
    title: "Set Your Radius",
    description: "Choose when you want to be alerted—300m, 500m, 1km, or 2km from your stop.",
  },
  {
    icon: Bell,
    title: "Rest Easy",
    description: "We'll track your location in the background and wake you up when you're close.",
  }
];

export default function TutorialScreen() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Mark onboarding as complete and go to Login
      localStorage.setItem("onboardingComplete", "true");
      navigate("/login");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboardingComplete", "true");
    navigate("/login");
  };

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden font-['Inter']">
      {/* iOS Dynamic Island Space */}
      <div className="h-12 bg-background flex-shrink-0" />

      {/* Skip Button */}
      <div className="flex justify-end px-6 pt-4">
        {currentStep < TUTORIAL_STEPS.length - 1 && (
          <button
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-foreground font-light tracking-wider uppercase transition-colors"
          >
            Skip
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-16">
        <div className="relative w-full max-w-sm h-72 flex items-center justify-center mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              {/* Icon Container */}
              <div className="w-32 h-32 rounded-full border border-border flex items-center justify-center bg-card mb-10 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-primary opacity-5"></div>
                {(() => {
                  const Icon = TUTORIAL_STEPS[currentStep].icon;
                  return <Icon className="w-14 h-14 text-primary" strokeWidth={1} fill="none" />;
                })()}
              </div>

              {/* Text Content */}
              <h2 className="text-3xl text-foreground text-center font-bold mb-4 tracking-tight">
                {TUTORIAL_STEPS[currentStep].title}
              </h2>
              <p className="text-base text-muted-foreground text-center font-light leading-relaxed px-4">
                {TUTORIAL_STEPS[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination Dots */}
        <div className="flex space-x-3 mb-12">
          {TUTORIAL_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep ? "w-8 bg-primary" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Primary Action Button */}
        <Button
          onClick={handleNext}
          className="w-full max-w-sm py-7 bg-primary hover:bg-primary/90 text-primary-foreground font-medium tracking-wider uppercase transition-all text-base"
          style={{ borderRadius: 'var(--radius)' }}
        >
          {currentStep === TUTORIAL_STEPS.length - 1 ? "Get Started" : "Next"}
        </Button>
      </div>

      {/* Android Gesture Bar */}
      <div className="h-1 bg-border flex-shrink-0" />
    </div>
  );
}