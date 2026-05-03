export default {
  expo: {
    name: "Next Stop",
    slug: "next-stop",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "nextstop",
    userInterfaceStyle: "dark",
    splash: { backgroundColor: "#000000" },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.nextstop.app",
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Next Stop uses your location to alert you when you're near your destination.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Next Stop tracks your location in the background to alert you when you're near your stop, even when the app is closed.",
        NSLocationAlwaysUsageDescription: "Next Stop tracks your location in the background to alert you when you're near your stop.",
        UIBackgroundModes: ["location", "fetch"]
      }
    },
    android: {
      package: "com.nextstop.app",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        }
      },
      permissions: [
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_BACKGROUND_LOCATION",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_LOCATION",
        "android.permission.VIBRATE",
        "android.permission.RECEIVE_BOOT_COMPLETED"
      ]
    },
    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Next Stop tracks your location in the background to alert you when you're near your stop."
        }
      ],
      [
        "expo-notifications",
        { color: "#D32F2F" }
      ]
    ],
    experiments: { typedRoutes: true }
  }
};
