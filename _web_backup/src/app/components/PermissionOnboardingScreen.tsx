import { useNavigate } from "react-router";
import { MapPin, Bell } from "lucide-react";
import { Button } from "./ui/button";

export default function PermissionOnboardingScreen() {
  const navigate = useNavigate();

  const handleEnablePermissions = () => {
    // Simulate permission request
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // Success - navigate to tutorial
          navigate("/tutorial");
        },
        () => {
          // Error - still navigate (demo purposes)
          navigate("/tutorial");
        }
      );
    } else {
      navigate("/tutorial");
    }
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      {/* iOS Dynamic Island Space */}
      <div className="h-12 bg-black flex-shrink-0" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Minimalist Line-Art Icons */}
        <div className="relative mb-16">
          {/* Location Pin */}
          <div className="relative">
            <MapPin 
              className="w-24 h-24 text-white mb-4" 
              strokeWidth={0.5} 
              fill="none"
            />
            {/* Notification Bell - Overlapping */}
            <div className="absolute -bottom-2 -right-2 bg-black p-2">
              <Bell 
                className="w-12 h-12 text-[var(--crimson-red)]" 
                strokeWidth={0.5}
                fill="none"
              />
            </div>
          </div>
        </div>

        {/* Bold Heading */}
        <h1 
          className="text-4xl text-white text-center mb-6 tracking-tight leading-tight"
          style={{ fontWeight: 700 }}
        >
          Rest Easy,
          <br />
          We'll Alert You.
        </h1>

        {/* Description */}
        <p className="text-base text-[var(--gray-300)] text-center font-light leading-relaxed max-w-sm mb-16 tracking-wide">
          Enable location and notifications to never miss your stop.
        </p>

        {/* Primary Action Button */}
        <Button
          onClick={handleEnablePermissions}
          className="w-full max-w-sm py-7 bg-[var(--crimson-red)] hover:bg-[var(--crimson-red-dark)] text-white font-medium tracking-wider uppercase transition-all text-base"
          style={{ borderRadius: '4px' }}
        >
          Enable Permissions
        </Button>

        {/* Skip Option */}
        <button
          onClick={() => navigate("/tutorial")}
          className="mt-6 text-sm text-[var(--gray-300)] hover:text-white font-light tracking-wider uppercase transition-colors"
          style={{ borderRadius: '4px' }}
        >
          Skip for now
        </button>
      </div>

      {/* Android Gesture Bar */}
      <div className="h-1 bg-[var(--gray-800)] flex-shrink-0" />
    </div>
  );
}