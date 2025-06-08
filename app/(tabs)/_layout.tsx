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



export default function TabLayout() {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [modalScale] = useState(new Animated.Value(0));
  const [modalOpacity] = useState(new Animated.Value(0));
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1] || "index";

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
  const isNativeMobile = !isWeb;

  const showModal = () => {
    setMobileMenuVisible(true);
    
    // Reset to starting position
    modalScale.setValue(0.1);
    modalOpacity.setValue(0);
    
    Animated.parallel([
      Animated.spring(modalScale, {
        toValue: 1,
        tension: 80,  // Higher tension for less bounce
        friction: 10, // Higher friction for less oscillation
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 250,  // Slightly shorter duration
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideModal = () => {
    Animated.parallel([
      Animated.spring(modalScale, {
        toValue: 0.1,  // Shrink to small size like dock icon
        tension: 120,  // Faster collapse
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMobileMenuVisible(false);
    });
  };

  const navigateToPage = (item: typeof navigationItems[0]) => {
    if (item.name === "index") {
      router.push("/(tabs)" as any);
    } else {
      router.push(`/(tabs)/${item.name}` as any);
    }
    hideModal();
  };

  const styles = createDynamicStyles(colors);

  // Native mobile layout with floating hamburger menu
  if (isNativeMobile) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={{ flex: 1 }}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: { display: "none" }, // Hide the tab bar completely
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

        {/* Floating Hamburger Button */}
        <TouchableOpacity
          style={styles.floatingMenuButton}
          onPress={showModal}
        >
          <MaterialIcons
            size={24}
            name="menu"
            color={colors.background}
          />
        </TouchableOpacity>

        {/* Animated Navigation Modal */}
        {mobileMenuVisible && (
          <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
            <TouchableOpacity 
              style={styles.modalBackdrop} 
              onPress={hideModal}
              activeOpacity={1}
            />
            <Animated.View 
              style={[
                styles.modalContent,
                {
                  transform: [
                    { scale: modalScale },
                    { 
                      translateX: modalScale.interpolate({
                        inputRange: [0.1, 1],
                        outputRange: [120, 0], // Start from hamburger button position
                        extrapolate: 'clamp',
                      })
                    },
                    { 
                      translateY: modalScale.interpolate({
                        inputRange: [0.1, 1],
                        outputRange: [180, 0], // Start from hamburger button position
                        extrapolate: 'clamp',
                      })
                    },
                    {
                      scaleX: modalScale.interpolate({
                        inputRange: [0.1, 0.5, 1],
                        outputRange: [0.3, 1.05, 1], // Subtle horizontal stretch
                        extrapolate: 'clamp',
                      })
                    },
                    {
                      scaleY: modalScale.interpolate({
                        inputRange: [0.1, 0.5, 1],
                        outputRange: [0.3, 0.95, 1], // Subtle vertical compression
                        extrapolate: 'clamp',
                      })
                    }
                  ],
                  opacity: modalOpacity,
                }
              ]}
            >
              <View style={styles.modalNavItems}>
                {navigationItems.map((item) => {
                  const isActive = currentRoute === item.name;
                  const tintColor = getPageTintColor(item.name, colors);
                  return (
                    <TouchableOpacity
                      key={item.name}
                      style={[
                        styles.modalNavItem,
                        isActive && { 
                          ...styles.activeModalNavItem,
                          backgroundColor: tintColor 
                        }
                      ]}
                      onPress={() => navigateToPage(item)}
                    >
                      <MaterialIcons
                        size={24}
                        name={item.icon as any}
                        color={isActive ? colors.background : colors.icon}
                      />
                      <Text style={[
                        styles.modalNavItemText,
                        isActive && { color: colors.background }
                      ]}>
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </Animated.View>
        )}
      </SafeAreaView>
    );
  }

  if (isMobileWeb) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
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

        {/* Floating Hamburger Button */}
        <TouchableOpacity
          style={styles.floatingMenuButton}
          onPress={showModal}
        >
          <MaterialIcons
            size={24}
            name="menu"
            color={colors.background}
          />
        </TouchableOpacity>

        {/* Animated Navigation Modal */}
        {mobileMenuVisible && (
          <View style={styles.webModalOverlay}>
            <TouchableOpacity 
              style={styles.modalBackdrop} 
              onPress={hideModal}
              activeOpacity={1}
            />
            <View style={styles.webModalContent}>
              <View style={styles.modalNavItems}>
                {navigationItems.map((item) => {
                  const isActive = currentRoute === item.name;
                  const tintColor = getPageTintColor(item.name, colors);
                  return (
                    <TouchableOpacity
                      key={item.name}
                      style={[
                        styles.modalNavItem,
                        isActive && { 
                          ...styles.activeModalNavItem,
                          backgroundColor: tintColor 
                        }
                      ]}
                      onPress={() => navigateToPage(item)}
                    >
                      <MaterialIcons
                        size={24}
                        name={item.icon as any}
                        color={isActive ? colors.background : colors.icon}
                      />
                      <Text style={[
                        styles.modalNavItemText,
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
        )}
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



  // Native mobile floating menu styles
  floatingMenuButton: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.tint,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 100,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    marginRight: 24,
    marginBottom: 100, // Position above the hamburger button
    maxWidth: 200,
    width: 280,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalNavItems: {
    paddingVertical: 16,
  },
  modalNavItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  activeModalNavItem: {
    // backgroundColor will be set dynamically to tint color
  },
  modalNavItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.icon,
  },

  // Web modal styles (simpler version without animations)
  webModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  webModalContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    marginRight: 24,
    marginBottom: 100, // Position above the hamburger button
    maxWidth: 200,
    width: 280,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
