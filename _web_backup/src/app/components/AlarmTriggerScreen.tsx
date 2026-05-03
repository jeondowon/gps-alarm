import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Headphones, Vibrate, Power } from "lucide-react";
import { Button } from "./ui/button";
import { AlarmData, formatRadius } from "../types/alarm";

const getSnoozeRadius = (currentRadius: number): number | null => {
  if (currentRadius === 2) return 1;
  if (currentRadius === 1) return 0.5;
  if (currentRadius === 0.5) return 0.3;
  return null;
};

export default function AlarmTriggerScreen() {
  const navigate = useNavigate();
  const [alarmData, setAlarmData] = useState<AlarmData | null>(null);
  const [isFlashing, setIsFlashing] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem("alarmData");
    if (data) {
      setAlarmData(JSON.parse(data));
    } else {
      navigate("/");
    }

    // Flash animation
    const flashInterval = setInterval(() => {
      setIsFlashing((prev) => !prev);
    }, 800);

    // Simulate vibration
    if (navigator.vibrate) {
      const vibratePattern = setInterval(() => {
        navigator.vibrate([200, 100, 200]);
      }, 1000);
      
      return () => {
        clearInterval(flashInterval);
        clearInterval(vibratePattern);
      };
    }

    return () => clearInterval(flashInterval);
  }, [navigate]);

  const handleDismiss = () => {
    setIsFlashing(false);
    localStorage.removeItem("alarmData");
    setTimeout(() => {
      navigate("/");
    }, 300);
  };

  const handleSnooze = () => {
    setIsFlashing(false);
    
    const nextRadius = getSnoozeRadius(alarmData.radius);
    if (nextRadius === null) return; // Should not happen
    
    // Update alarm data with new radius
    const updatedData = {
      ...alarmData,
      radius: nextRadius
    };
    
    localStorage.setItem("alarmData", JSON.stringify(updatedData));
    
    setTimeout(() => {
      navigate("/active");
    }, 300);
  };

  if (!alarmData) return null;

  const snoozeRadius = getSnoozeRadius(alarmData.radius);
  const isAtMinimumRadius = snoozeRadius === null;

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden transition-colors duration-500 ${
        isFlashing ? "bg-[#1a0000]" : "bg-black"
      }`}
    >
      {/* iOS Dynamic Island Space */}
      <div className="h-12 flex-shrink-0" />

      {/* Status Indicators */}
      <div className="flex-shrink-0 px-6 py-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2 bg-[var(--gray-900)] border border-[var(--gray-800)] px-3 py-2" style={{ borderRadius: '4px' }}>
          <Headphones className="w-5 h-5 text-[var(--gray-300)]" strokeWidth={1.5} />
          <span className="text-xs text-[var(--gray-300)] font-light tracking-wider uppercase">
            Connected
          </span>
        </div>
        <div className="flex items-center gap-2 bg-[var(--gray-900)] border border-[var(--gray-800)] px-3 py-2" style={{ borderRadius: '4px' }}>
          <Vibrate className="w-5 h-5 text-[var(--gray-300)]" strokeWidth={1.5} />
          <span className="text-xs text-[var(--gray-300)] font-light tracking-wider uppercase">
            Active
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Pulsing Alert Icon */}
        <div className="relative mb-12">
          <div
            className={`w-32 h-32 rounded-full border-2 transition-all duration-500 ${
              isFlashing
                ? "border-[var(--crimson-red)] bg-[var(--crimson-red)] bg-opacity-20 scale-110"
                : "border-[var(--gray-800)] scale-100"
            }`}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Power
                className={`w-16 h-16 transition-colors duration-500 ${
                  isFlashing ? "text-[var(--crimson-red)]" : "text-white"
                }`}
                strokeWidth={1.5}
              />
            </div>
          </div>
          {isFlashing && (
            <div className="absolute inset-0 w-32 h-32 rounded-full border-2 border-[var(--crimson-red)] animate-ping opacity-50" />
          )}
        </div>

        {/* Alert Message */}
        <div className="text-center mb-16">
          <p className="text-xs text-[var(--gray-300)] font-light tracking-[0.3em] uppercase mb-4">
            Arriving At
          </p>
          <h1
            className="text-4xl font-bold text-white tracking-tight leading-tight mb-2"
            style={{ fontWeight: 700 }}
          >
            {alarmData.destination.toUpperCase()}
          </h1>
          <p className="text-sm text-[var(--gray-400)] font-light mt-3">
            {alarmData.address}
          </p>
          <div className="h-px w-24 bg-[var(--crimson-red)] mx-auto mt-6" />
        </div>

        {/* Distance Info */}
        <div className="bg-[var(--gray-900)] border border-[var(--gray-800)] px-8 py-4 mb-12" style={{ borderRadius: '4px' }}>
          <p className="text-sm text-white font-light text-center">
            Within{" "}
            <span className="text-[var(--crimson-red)] font-medium">
              {formatRadius(alarmData.radius)}
            </span>{" "}
            radius
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 px-6 pb-8 space-y-4">
        {isAtMinimumRadius ? (
          <>
            {/* Dismiss Button Only */}
            <Button
              onClick={handleDismiss}
              className="w-full py-8 bg-[var(--crimson-red)] hover:bg-[var(--crimson-red-dark)] text-white font-bold text-xl tracking-wider uppercase transition-all shadow-2xl"
              style={{ fontSize: "1.25rem", fontWeight: 700, borderRadius: "4px" }}
            >
              Dismiss
            </Button>
            
            {/* Final State - Time to Get Off Message */}
            <div className="w-full py-4 text-center">
              <p className="text-[var(--gray-300)] font-light text-sm tracking-wider uppercase">
                Time to get off!
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Dismiss Button */}
            <Button
              onClick={handleDismiss}
              className="w-full py-8 bg-[var(--crimson-red)] hover:bg-[var(--crimson-red-dark)] text-white font-bold text-xl tracking-wider uppercase transition-all shadow-2xl"
              style={{ fontSize: "1.25rem", fontWeight: 700, borderRadius: "4px" }}
            >
              Dismiss
            </Button>

            {/* Snooze Button with Dynamic Label */}
            <button
              onClick={handleSnooze}
              className="w-full py-4 text-[var(--gray-300)] hover:text-white font-light text-sm tracking-wider uppercase transition-colors"
              style={{ borderRadius: '4px' }}
            >
              Snooze to {formatRadius(snoozeRadius!)}
            </button>
          </>
        )}
      </div>

      {/* Android Gesture Bar */}
      <div className="h-1 bg-[var(--gray-800)] flex-shrink-0" />

      {/* Flash Overlay */}
      {isFlashing && (
        <div className="absolute inset-0 bg-[var(--crimson-red)] opacity-5 pointer-events-none animate-pulse" />
      )}
    </div>
  );
}