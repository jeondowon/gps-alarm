import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, Shield, FileText, Info, Headphones, LogOut, Trash2, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const SUPPORT_ITEMS = [
  { id: 1, label: "Customer Support", icon: Headphones, path: "/support" },
  { id: 2, label: "App Information", icon: Info, path: "/info" },
  { id: 3, label: "Privacy Policy", icon: Shield, path: "/privacy" },
  { id: 4, label: "Terms of Service", icon: FileText, path: "/terms" },
];

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { theme: appearance, setTheme: setAppearance } = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLogout = () => {
    // Simulate logout
    localStorage.removeItem("userSession");
    navigate("/onboarding");
  };

  const handleDeleteAccount = () => {
    if (showDeleteConfirm) {
      // Simulate account deletion
      localStorage.clear();
      navigate("/onboarding");
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleMenuItemClick = (path: string) => {
    // Navigate to respective pages (can be implemented later)
    console.log(`Navigating to: ${path}`);
  };

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      {/* iOS Dynamic Island Space */}
      <div className="h-12 bg-background flex-shrink-0" />

      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-border flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="text-foreground hover:text-primary transition-colors"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={1} />
        </button>
        <h1 className="text-base text-foreground font-medium tracking-wide">
          Settings
        </h1>
        <div className="w-6" />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        
        {/* Section 1: Display (Appearance) */}
        <div className="px-4 py-3">
          <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase mb-3 px-1">
            Display
          </p>
          
          {/* Appearance Row */}
          <div className="bg-background border-t border-b border-border -mx-4 px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 flex items-center justify-center" style={{ borderRadius: 'var(--radius)' }}>
                {appearance === "dark" ? (
                  <Moon className="w-5 h-5 text-foreground" strokeWidth={1} />
                ) : (
                  <Sun className="w-5 h-5 text-foreground" strokeWidth={1} />
                )}
              </div>
              <p className="text-base text-foreground font-light">
                Appearance
              </p>
            </div>

            {/* Inline Segmented Control */}
            <div className="bg-card border border-border p-0.5 flex gap-0.5" style={{ borderRadius: 'var(--radius)' }}>
              <button
                onClick={() => setAppearance("light")}
                className={`px-4 py-1.5 text-xs font-medium tracking-wide transition-all ${
                  appearance === "light"
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground hover:text-foreground"
                }`}
                style={{ borderRadius: 'var(--radius)' }}
              >
                Light
              </button>
              <button
                onClick={() => setAppearance("dark")}
                className={`px-4 py-1.5 text-xs font-medium tracking-wide transition-all ${
                  appearance === "dark"
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground hover:text-foreground"
                }`}
                style={{ borderRadius: 'var(--radius)' }}
              >
                Dark
              </button>
            </div>
          </div>
        </div>

        {/* Spacing Between Groups */}
        <div className="h-3" />

        {/* Section 2: Support & Resources */}
        <div className="px-4 py-3">
          <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase mb-3 px-1">
            Support & Resources
          </p>
          
          {/* Grouped List */}
          <div className="bg-background border-t border-b border-border -mx-4">
            {SUPPORT_ITEMS.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.id}>
                  <button
                    onClick={() => handleMenuItemClick(item.path)}
                    className="w-full px-4 py-4 flex items-center gap-3 group active:bg-card"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center" style={{ borderRadius: 'var(--radius)' }}>
                      <Icon className="w-5 h-5 text-foreground" strokeWidth={1} />
                    </div>

                    {/* Label */}
                    <p className="flex-1 text-base text-foreground font-light text-left">
                      {item.label}
                    </p>

                    {/* Chevron Right */}
                    <ChevronRight className="w-5 h-5 text-muted-foreground" strokeWidth={1} />
                  </button>

                  {/* Thin Divider (not on last item) */}
                  {index < SUPPORT_ITEMS.length - 1 && (
                    <div className="h-px bg-border ml-14" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Spacing Between Groups */}
        <div className="h-3" />

        {/* Section 3: Login (Account Actions) */}
        <div className="px-4 py-3">
          <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase mb-3 px-1">
            Login
          </p>
          
          {/* Account Actions List */}
          <div className="bg-background border-t border-b border-border -mx-4">
            {/* Log Out */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-4 flex items-center gap-3 active:bg-card"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center" style={{ borderRadius: 'var(--radius)' }}>
                <LogOut className="w-5 h-5 text-foreground" strokeWidth={1} />
              </div>
              <p className="flex-1 text-base text-foreground font-light text-left">
                Log Out
              </p>
            </button>

            {/* Thin Divider */}
            <div className="h-px bg-border ml-14" />

            {/* Delete Account */}
            <button
              onClick={handleDeleteAccount}
              className="w-full px-4 py-4 flex items-center gap-3 active:bg-card"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center" style={{ borderRadius: 'var(--radius)' }}>
                <Trash2 className="w-5 h-5 text-destructive" strokeWidth={1} />
              </div>
              <p className="flex-1 text-base text-destructive font-light text-left">
                Delete Account
              </p>
            </button>
          </div>

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <div className="mt-4 bg-card border border-destructive p-4" style={{ borderRadius: 'var(--radius)' }}>
              <p className="text-sm text-card-foreground font-light mb-4 leading-relaxed">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 bg-transparent border border-border text-card-foreground text-sm font-medium tracking-wide hover:bg-foreground hover:text-background transition-all"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3 bg-destructive text-destructive-foreground text-sm font-medium tracking-wide hover:bg-destructive/90 transition-all"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Spacing Before Version */}
        <div className="h-8" />

        {/* App Version */}
        <div className="text-center pb-8">
          <p className="text-xs text-muted-foreground font-light tracking-wide">
            Version 1.0.0
          </p>
          <p className="text-xs text-muted-foreground font-light mt-1">
            © 2026 Location Alarm App
          </p>
        </div>
      </div>

      {/* Android Gesture Bar */}
      <div className="h-1 bg-border flex-shrink-0" />
    </div>
  );
}