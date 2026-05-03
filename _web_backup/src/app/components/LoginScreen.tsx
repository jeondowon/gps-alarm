import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Button } from "./ui/button";

const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-3">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="mr-3 text-foreground">
    <path d="M16.365 14.364c-.021 2.292 1.94 3.047 2.023 3.084-.015.056-.312 1.082-1.039 2.144-.654.954-1.339 1.905-2.408 1.925-1.049.02-1.383-.623-2.569-.623-1.186 0-1.558.599-2.548.641-1.031.04-1.848-1.034-2.506-1.983-1.332-1.914-2.355-5.418-1.666-7.828.329-1.151 1.064-1.897 1.905-2.333.82-.424 1.705-.626 2.585-.606 1.011.024 1.956.366 2.565.666.623-.314 1.758-.707 2.924-.606.495.042 1.903.197 2.802 1.503-.075.047-1.661.966-1.688 2.853zM15.485 5.518c.552-.666.924-1.595.823-2.518-.788.03-1.752.523-2.324 1.21-.456.541-.893 1.488-.77 2.4.878.067 1.721-.424 2.271-1.092z" />
  </svg>
);

export default function LoginScreen() {
  const navigate = useNavigate();

  const handleLogin = (provider: string) => {
    // In a real app, this would initiate OAuth flow
    console.log(`Logging in with ${provider}`);
    localStorage.setItem("userLoggedIn", "true");
    navigate("/");
  };

  const handleGuest = () => {
    localStorage.setItem("userLoggedIn", "guest");
    navigate("/");
  };

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden font-['Inter']">
      {/* iOS Dynamic Island Space */}
      <div className="h-12 bg-background flex-shrink-0" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm flex flex-col items-center"
        >
          {/* Logo / Icon Area */}
          <div className="w-20 h-20 bg-primary flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(211,47,47,0.3)]" style={{ borderRadius: 'var(--radius)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>

          <h1 className="text-3xl text-foreground font-bold mb-3 tracking-tight text-center">
            Never Miss a Stop
          </h1>
          <p className="text-muted-foreground text-center font-light mb-12 px-4 leading-relaxed">
            Sign in to save your favorite routes, custom alarm settings, and preferences across devices.
          </p>

          {/* Social Logins */}
          <div className="w-full space-y-4">
            <Button
              onClick={() => handleLogin('Apple')}
              className="w-full py-6 bg-card hover:bg-card/80 text-foreground font-medium text-base transition-colors flex items-center justify-center border border-border"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <AppleIcon />
              Continue with Apple
            </Button>

            <Button
              onClick={() => handleLogin('Google')}
              className="w-full py-6 bg-card hover:bg-card/80 text-foreground font-medium text-base transition-colors flex items-center justify-center border border-border"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <GoogleIcon />
              Continue with Google
            </Button>
          </div>

          {/* Divider */}
          <div className="w-full flex items-center my-8 opacity-40">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-4 text-muted-foreground text-sm font-light uppercase tracking-widest">Or</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          {/* Guest Action */}
          <button
            onClick={handleGuest}
            className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm tracking-wide border-b border-transparent hover:border-foreground pb-0.5"
          >
            Continue as Guest
          </button>
        </motion.div>
      </div>

      {/* Android Gesture Bar */}
      <div className="h-1 bg-border flex-shrink-0" />
    </div>
  );
}
