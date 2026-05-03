import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { MapPin, ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

const DISTANCE_OPTIONS = [
  { value: 0.3, label: "300m", eta: "About 1–2 minutes before arrival" },
  { value: 0.5, label: "500m", eta: "About 2–3 minutes before arrival" },
  { value: 1, label: "1km", eta: "About 4–5 minutes before arrival" },
  { value: 2, label: "2km", eta: "About 8–10 minutes before arrival" },
];

export default function RadiusSelectionScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { position, name, address } = location.state || { 
    position: { x: 200, y: 300 }, 
    name: "Destination",
    address: "No address provided"
  };
  
  const [selectedRadius, setSelectedRadius] = useState(1); // Default 1km

  const handleSetAlarm = () => {
    localStorage.setItem(
      "alarmData",
      JSON.stringify({
        destination: name || "Selected Location",
        address: address || "No address provided",
        position,
        radius: selectedRadius,
      })
    );
    navigate("/active");
  };

  // Calculate radius in pixels (1km = 50px for visualization)
  const radiusInPixels = selectedRadius * 50;

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      {/* iOS Dynamic Island Space */}
      <div className="h-12 bg-black flex-shrink-0" />

      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-[var(--gray-800)] flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="text-white hover:text-[var(--crimson-red)] transition-colors"
          style={{ borderRadius: '4px' }}
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
        </button>
        <p className="text-sm text-[var(--gray-300)] font-light tracking-wider">
          SET RADIUS
        </p>
        <div className="w-6" />
      </div>

      {/* Map with Radius Overlay */}
      <div className="flex-1 relative">
        <div
          className="w-full h-full relative"
          style={{
            background: `
              linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
              repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.02) 0px, transparent 0.5px, transparent 30px),
              repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.02) 0px, transparent 0.5px, transparent 30px),
              #0a0a0a
            `,
          }}
        >
          {/* Minimal Map Grid */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-white" />
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white" />
          </div>

          {/* Translucent Radius Circle */}
          <div
            className="absolute border border-[var(--crimson-red)] pointer-events-none transition-all duration-500 ease-out"
            style={{
              left: position.x - radiusInPixels,
              top: position.y - radiusInPixels,
              width: radiusInPixels * 2,
              height: radiusInPixels * 2,
              borderRadius: "50%",
              backgroundColor: "rgba(211, 47, 47, 0.08)",
              boxShadow: "0 0 40px rgba(211, 47, 47, 0.2), inset 0 0 40px rgba(211, 47, 47, 0.1)",
            }}
          />

          {/* Center Pin */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: position.x,
              top: position.y,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="relative">
              <MapPin className="w-10 h-10 text-[var(--crimson-red)]" fill="var(--crimson-red)" strokeWidth={1.5} />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[var(--crimson-red)] rounded-full animate-pulse" />
            </div>
          </div>

          {/* Radius Label */}
          <div
            className="absolute pointer-events-none transition-all duration-500"
            style={{
              left: position.x,
              top: position.y - radiusInPixels,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="bg-black border border-[var(--crimson-red)] px-3 py-1" style={{ borderRadius: '4px' }}>
              <p className="text-xs text-white font-light tracking-wider">
                {selectedRadius >= 1 ? `${selectedRadius.toFixed(0)} KM` : `${(selectedRadius * 1000).toFixed(0)} M`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex-shrink-0 bg-black border-t border-[var(--gray-800)] p-6 space-y-6">
        {/* Destination Info */}
        <div className="flex items-center gap-3">
          <div className="w-1 self-stretch bg-[var(--crimson-red)]" />
          <div>
            <p className="text-xs text-[var(--gray-300)] font-light tracking-wider uppercase">
              Destination
            </p>
            <p className="text-lg text-white font-normal mt-1">
              {name || "Selected Location"}
            </p>
            <p className="text-sm text-[var(--gray-400)] font-light mt-0.5">
              {address || "No address provided"}
            </p>
          </div>
        </div>

        {/* Segmented Picker */}
        <div className="space-y-4">
          <p className="text-xs text-[var(--gray-300)] font-light tracking-wider uppercase">
            Alert Radius
          </p>
          
          {/* 4-Point Grid Control */}
          <div className="grid grid-cols-4 gap-2">
            {DISTANCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedRadius(option.value)}
                className={`
                  py-4 transition-all duration-300 border
                  ${
                    selectedRadius === option.value
                      ? 'bg-[var(--crimson-red)] text-[var(--gray-100)] border-[var(--gray-800)]'
                      : 'bg-transparent text-[var(--gray-300)] border-[var(--gray-800)] hover:bg-[var(--gray-900)]'
                  }
                `}
                style={{ fontWeight: 700, borderRadius: '4px' }}
              >
                <span className="text-sm tracking-wide">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
          
          {/* ETA Description */}
          <div className="pt-2">
            <p className="text-xs text-[var(--gray-300)] font-light tracking-wide text-center">
              {DISTANCE_OPTIONS.find(opt => opt.value === selectedRadius)?.eta}
            </p>
          </div>
        </div>

        {/* Set Alarm Button */}
        <Button
          onClick={handleSetAlarm}
          className="w-full py-6 bg-[var(--crimson-red)] hover:bg-[var(--crimson-red-dark)] text-white font-medium tracking-wider uppercase transition-all text-[#ffffff]"
          style={{ borderRadius: '4px' }}
        >
          Set Alarm
        </Button>
      </div>

      {/* Android Gesture Bar */}
      <div className="h-1 bg-[var(--gray-800)] flex-shrink-0" />
    </div>
  );
}