import { useEffect } from "react";
import { useNavigate } from "react-router";
import { MapPin } from "lucide-react";
import { motion } from "motion/react";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already seen onboarding
    const hasSeenOnboarding = localStorage.getItem("onboardingComplete");
    
    const timer = setTimeout(() => {
      if (hasSeenOnboarding) {
        navigate("/");
      } else {
        navigate("/onboarding");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <MapPin 
            className="w-20 h-20 text-[var(--crimson-red)] mb-6" 
            strokeWidth={1} 
            fill="none"
          />
        </motion.div>
        
        <h1 
          className="text-2xl text-white font-medium tracking-[0.2em] uppercase"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Next Stop
        </h1>
        <div className="w-12 h-0.5 bg-[var(--crimson-red)] mt-4 rounded-full" />
      </motion.div>
    </div>
  );
}