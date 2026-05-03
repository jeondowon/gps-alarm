import { createBrowserRouter } from "react-router";
import HomeScreen from "./components/HomeScreen";
import RadiusSelectionScreen from "./components/RadiusSelectionScreen";
import ActiveAlarmScreen from "./components/ActiveAlarmScreen";
import AlarmTriggerScreen from "./components/AlarmTriggerScreen";
import PermissionOnboardingScreen from "./components/PermissionOnboardingScreen";
import SearchRecentScreen from "./components/SearchRecentScreen";
import ManageFavoritesScreen from "./components/ManageFavoritesScreen";
import SoundHapticScreen from "./components/SoundHapticScreen";
import SettingsScreen from "./components/SettingsScreen";
import GoogleMapsRadiusScreen from "./components/GoogleMapsRadiusScreen";
import SplashScreen from "./components/SplashScreen";
import TutorialScreen from "./components/TutorialScreen";
import LoginScreen from "./components/LoginScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomeScreen,
  },
  {
    path: "/splash",
    Component: SplashScreen,
  },
  {
    path: "/tutorial",
    Component: TutorialScreen,
  },
  {
    path: "/login",
    Component: LoginScreen,
  },
  {
    path: "/onboarding",
    Component: PermissionOnboardingScreen,
  },
  {
    path: "/search",
    Component: SearchRecentScreen,
  },
  {
    path: "/favorites",
    Component: ManageFavoritesScreen,
  },
  {
    path: "/sound-haptic",
    Component: SoundHapticScreen,
  },
  {
    path: "/settings",
    Component: SettingsScreen,
  },
  {
    path: "/radius-selection",
    Component: RadiusSelectionScreen,
  },
  {
    path: "/radius-google",
    Component: GoogleMapsRadiusScreen,
  },
  {
    path: "/active",
    Component: ActiveAlarmScreen,
  },
  {
    path: "/trigger",
    Component: AlarmTriggerScreen,
  },
]);