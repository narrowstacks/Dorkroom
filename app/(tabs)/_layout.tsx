import { Tabs } from "expo-router";
import React, { useState, useEffect } from "react";
import { Platform, View, TouchableOpacity, Text, StyleSheet, Dimensions, Modal, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useSegments } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

import { HapticTab } from "@/components/HapticTab";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TabBarBackground from "@/components/ui/TabBarBackground";

// Navigation items configuration
const navigationItems = [
  {
    name: "index",
    title: "Home",
    icon: "home",
  },
  {
    name: "border",
    title: "Border",
    icon: "crop-square",
  },
  {
    name: "resize",
    title: "Resize",
    icon: "open-with",
  },
  {
    name: "exposure",
    title: "Stops",
    icon: "timer",
  },
  {
    name: "cameraExposure",
    title: "Exposure",
    icon: "camera-alt",
  },
  {
    name: "reciprocity",
    title: "Reciprocity",
    icon: "schedule",
  },
  {
    name: "settings",
    title: "Settings",
    icon: "settings",
  },
];

// Function to get the tint color for each page
const getPageTintColor = (routeName: string, colors: typeof Colors.light) => {
  switch (routeName) {
    case "border":
      return colors.borderCalcTint;
    case "resize":
      return colors.resizeCalcTint;
    case "exposure":
      return colors.stopCalcTint;
    case "cameraExposure":
      return colors.cameraExposureCalcTint;
    case "reciprocity":
      return colors.reciprocityCalcTint;
    case "index":
    case "settings":
    default:
      return colors.tint;
  }
};

function TopNavigation() {
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1] || "index";
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const styles = createDynamicStyles(colors);

  return (
    <View style={styles.topNavContainer}>
      <View style={styles.topNavContent}>
        <Text style={styles.appTitle}>Dorkroom</Text>
        <View style={styles.navItems}>
          {navigationItems.map((item) => {
            const isActive = currentRoute === item.name;
            const tintColor = getPageTintColor(item.name, colors);
            return (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.navItem, 
                  isActive && { ...styles.activeNavItem, backgroundColor: tintColor }
                ]}
                onPress={() => {
                  if (item.name === "index") {
                    router.push("/(tabs)" as any);
                  } else {
                    router.push(`/(tabs)/${item.name}` as any);
                  }
                }}
              >
                <MaterialIcons
                  size={20}
                  name={item.icon as any}
                  color={isActive ? colors.background : colors.icon}
                />
                <Text style={[
                  styles.navItemText, 
                  isActive && { color: colors.background }
                ]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function MobileWebNavigation() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarAnim] = useState(new Animated.Value(-250));
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1] || "index";
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const styles = createDynamicStyles(colors);

  const toggleSidebar = () => {
    const toValue = sidebarVisible ? -250 : 0;
    setSidebarVisible(!sidebarVisible);
    
    Animated.timing(sidebarAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const navigateTo = (item: typeof navigationItems[0]) => {
    if (item.name === "index") {
      router.push("/(tabs)" as any);
    } else {
      router.push(`/(tabs)/${item.name}` as any);
    }
    toggleSidebar();
  };

  return (
    <>
      {/* Header with hamburger menu */}
      <View style={styles.mobileHeader}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.hamburgerButton}>
          <View style={[styles.hamburgerLine, { backgroundColor: colors.text }]} />
          <View style={[styles.hamburgerLine, { backgroundColor: colors.text }]} />
          <View style={[styles.hamburgerLine, { backgroundColor: colors.text }]} />
        </TouchableOpacity>
        <Text style={styles.mobileAppTitle}>Dorkroom</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Overlay */}
      {sidebarVisible && (
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={toggleSidebar}
          activeOpacity={1}
        />
      )}

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { left: sidebarAnim }]}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Navigation</Text>
          <TouchableOpacity onPress={toggleSidebar} style={styles.closeButton}>
            <MaterialIcons size={24} name="close" color={colors.icon} />
          </TouchableOpacity>
        </View>
        <View style={styles.sidebarContent}>
          {navigationItems.map((item) => {
            const isActive = currentRoute === item.name;
            const tintColor = getPageTintColor(item.name, colors);
            return (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.sidebarItem, 
                  isActive && { 
                    ...styles.activeSidebarItem, 
                    backgroundColor: tintColor,
                    borderRightColor: tintColor 
                  }
                ]}
                onPress={() => navigateTo(item)}
              >
                <MaterialIcons
                  size={24}
                  name={item.icon as any}
                  color={isActive ? colors.background : colors.icon}
                />
                <Text style={[
                  styles.sidebarItemText, 
                  isActive && { color: colors.background }
                ]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </>
  );
}

export default function TabLayout() {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  useEffect(() => {
    const onChange = (result: { window: any }) => {
      setScreenData(result.window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  const isWeb = Platform.OS === "web";
  const isMobileWeb = isWeb && screenData.width <= 768; // Mobile breakpoint
  const isDesktopWeb = isWeb && screenData.width > 768;

  if (isMobileWeb) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <MobileWebNavigation />
        <View style={{ flex: 1 }}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: { display: "none" }, // Hide the tab bar on mobile web
            }}
          >
            {navigationItems.map((item) => (
              <Tabs.Screen
                key={item.name}
                name={item.name}
                options={{
                  title: item.title,
                }}
              />
            ))}
          </Tabs>
        </View>
      </SafeAreaView>
    );
  }

  if (isDesktopWeb) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <TopNavigation />
        <View style={{ flex: 1 }}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: { display: "none" }, // Hide the tab bar on web
            }}
          >
            {navigationItems.map((item) => (
              <Tabs.Screen
                key={item.name}
                name={item.name}
                options={{
                  title: item.title,
                }}
              />
            ))}
          </Tabs>
        </View>
      </SafeAreaView>
    );
  }

  // Original mobile layout with bottom tabs
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tint, // This will be dynamically set per tab
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: "absolute",
              backgroundColor: "transparent", // Use a transparent background on iOS to show the blur effect
            },
            default: {
              backgroundColor: "#fff",
            },
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarActiveTintColor: getPageTintColor("index", colors),
            tabBarIcon: ({ color }) => (
              <MaterialIcons size={28} name="home" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="border"
          options={{
            title: "Border",
            tabBarActiveTintColor: getPageTintColor("border", colors),
            tabBarIcon: ({ color }) => (
              <MaterialIcons size={28} name="crop-square" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="resize"
          options={{
            title: "Resize",
            tabBarActiveTintColor: getPageTintColor("resize", colors),
            tabBarIcon: ({ color }) => (
              <MaterialIcons
                size={28}
                name="open-with"
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="exposure"
          options={{
            title: "Stops",
            tabBarActiveTintColor: getPageTintColor("exposure", colors),
            tabBarIcon: ({ color }) => (
              <MaterialIcons size={28} name="timer" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="cameraExposure"
          options={{
            title: "Exposure",
            tabBarActiveTintColor: getPageTintColor("cameraExposure", colors),
            tabBarIcon: ({ color }) => (
              <MaterialIcons size={28} name="camera-alt" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="reciprocity"
          options={{
            title: "Reciprocity",
            tabBarActiveTintColor: getPageTintColor("reciprocity", colors),
            tabBarIcon: ({ color }) => (
              <MaterialIcons size={28} name="schedule" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarActiveTintColor: getPageTintColor("settings", colors),
            tabBarIcon: ({ color }) => (
              <MaterialIcons size={28} name="settings" color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

// Dynamic styles function that takes colors as parameter
const createDynamicStyles = (colors: typeof Colors.light) => StyleSheet.create({
  // Desktop top navigation styles
  topNavContainer: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.tabIconDefault,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  topNavContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: 1200,
    marginHorizontal: "auto",
    width: "100%",
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  navItems: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeNavItem: {
    // backgroundColor will be set dynamically to tint color
  },
  navItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.icon,
  },
  activeNavItemText: {
    color: "#4CAF50",
  },

  // Mobile web navigation styles
  mobileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.tabIconDefault,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  hamburgerButton: {
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    marginVertical: 2,
  },
  mobileAppTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
    textAlign: "center",
    marginRight: 40, // Compensate for hamburger button width
  },
  headerSpacer: {
    width: 40,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: -250,
    width: 250,
    height: "100%",
    backgroundColor: colors.background,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sidebarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.tabIconDefault,
    paddingTop: 48, // Account for status bar
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  sidebarContent: {
    flex: 1,
    paddingTop: 8,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  activeSidebarItem: {
    // backgroundColor will be set dynamically to tint color
    borderRightWidth: 3,
    borderRightColor: "transparent", // Will be overridden by tint color
  },
  sidebarItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.icon,
  },
  activeSidebarItemText: {
    color: "#4CAF50",
  },
});
