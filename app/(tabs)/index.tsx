import { Platform, Linking, Dimensions, Pressable, useColorScheme } from "react-native";
import { Link } from "expo-router";
import { ReactNode, useEffect, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  ScrollView,
  Card,
  Center,
} from "@gluestack-ui/themed";
import { 
  CropIcon,
  MoveIcon,
  TimerIcon,
  CameraIcon,
  ClockIcon,
  GitBranchIcon,
  HeartIcon,
  CalculatorIcon,
  FlaskConicalIcon,
  ZapIcon,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";


// Add window dimension hook
const useWindowDimensions = () => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get("window"));

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  return dimensions;
};

interface ModernLinkButtonProps {
  href: string;
  title: string;
  color: string;
  disabled?: boolean;
  icon?: React.ComponentType<any>;
  children: ReactNode;
}

const ModernLinkButton = ({
  href,
  title,
  color,
  disabled = false,
  icon: IconComponent,
  children,
}: ModernLinkButtonProps) => {
  const handlePress = () => {
    if (href.startsWith("http")) {
      Linking.openURL(href);
    }
  };

  const buttonStyle = {
    width: 400,
    backgroundColor: disabled ? "#9CA3AF" : color,
    borderRadius: 12,
    paddingVertical: 16,
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    position: "relative" as const,
    opacity: disabled ? 0.7 : 1,
  };

  const iconStyle = {
    position: "absolute" as const,
    left: 20,
    zIndex: 1,
  };

  const textContainerStyle = {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  };

  const ButtonContent = (
    <>
      {IconComponent && (
        <Box style={iconStyle}>
          <IconComponent size={20} color="white" />
        </Box>
      )}
      <Box style={textContainerStyle}>
        <Text className="text-white font-semibold text-base">{children}</Text>
      </Box>
    </>
  );

  if (disabled) {
    return (
      <Box style={buttonStyle}>
        {ButtonContent}
      </Box>
    );
  }

  if (href.startsWith("http")) {
    return (
      <Pressable style={buttonStyle} onPress={handlePress}>
        {ButtonContent}
      </Pressable>
    );
  }

  return (
    <Link href={href as any} asChild>
      <Pressable style={buttonStyle}>
        {ButtonContent}
      </Pressable>
    </Link>
  );
};

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView className="flex-1">
      <Box className="flex-1 items-center px-4 py-6 w-full">
        <VStack 
          space="2xl" 
          className="items-center"
        >
          {/* Header Section */}
          <VStack space="sm" className="items-center">
            <Heading size="3xl" className="text-center font-bold">
              dorkroom.art
            </Heading>
            <Heading size="lg" className="text-center text-typography-600 italic">
              darkroom and photography calculators
            </Heading>
            <Heading size="sm" className="text-center text-typography-500">
              by{" "}
              <Text 
                className="text-primary-600 underline"
                onPress={() => Linking.openURL("https://www.affords.art")}
              >
                aaron f.a.
              </Text>
            </Heading>
          </VStack>

          {/* All Buttons Centered */}
          <Center>
            <VStack space="sm" className="items-center">
            <ModernLinkButton
              href="/border"
              color={colors.borderCalcTint}
              icon={CropIcon}
              title="border calculator"
            >
              border calculator
            </ModernLinkButton>
            <ModernLinkButton
              href="/exposure"
              color={colors.stopCalcTint}
              icon={TimerIcon}
              title="stop-based exposure calculator"
            >
              stop-based exposure calculator
            </ModernLinkButton>
            <ModernLinkButton
              href="/resize"
              color={colors.resizeCalcTint}
              icon={MoveIcon}
              title="print resize calculator"
            >
              print resize calculator
            </ModernLinkButton>
            <ModernLinkButton
              href="/cameraExposure"
              color={colors.cameraExposureCalcTint}
              icon={CameraIcon}
              title="exposure calculator"
            >
              exposure calculator
            </ModernLinkButton>
            <ModernLinkButton 
              href="#" 
              color="#666"
              disabled 
              icon={FlaskConicalIcon}
              title="coming soon!"
            >
              developer dilution calculator
            </ModernLinkButton>
            <ModernLinkButton 
              href="#" 
              color="#666"
              disabled 
              icon={ZapIcon}
              title="coming soon!"
            >
              push/pull calculator
            </ModernLinkButton>
            <ModernLinkButton
              href="/reciprocity"
              color={colors.reciprocityCalcTint}
              icon={ClockIcon}
              title="reciprocity calculator"
            >
              reciprocity calculator
            </ModernLinkButton>
            <ModernLinkButton
              href="https://github.com/narrowstacks/DorkroomReact"
              color="#24292e"
              icon={GitBranchIcon}
              title="contribute on github"
            >
              contribute on github
            </ModernLinkButton>
            <ModernLinkButton
              href="https://ko-fi.com/affords"
              color="#FF5E5B"
              icon={HeartIcon}
              title="support this site!"
            >
              support this site!
            </ModernLinkButton>
            </VStack>
          </Center>
        </VStack>
      </Box>
    </ScrollView>
  );
}

