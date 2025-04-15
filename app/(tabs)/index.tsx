import React from "react";
import {
  StyleSheet,
  Platform,
  Image,
  Linking,
  Pressable,
  Dimensions,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { ReactNode, useEffect, useState } from "react";
import Head from "expo-router/head";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ExternalLink } from "@/components/ExternalLink";

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

interface LinkButtonProps {
  href: string;
  title: string;
  color: string;
  disabled?: boolean;
  children: ReactNode;
}

const LinkButton = ({
  href,
  title,
  color,
  disabled = false,
  children,
}: LinkButtonProps) => {
  const buttonStyle = {
    ...styles.linkButton,
    backgroundColor: color,
    ...(disabled ? styles.linkButtonDisabled : {}),
  };

  const ButtonContent = () => (
    <ThemedText style={styles.linkButtonText}>{children}</ThemedText>
  );

  if (disabled) {
    return (
      <ThemedView style={buttonStyle}>
        <ButtonContent />
      </ThemedView>
    );
  }

  if (href.startsWith("http")) {
    return (
      <Pressable style={buttonStyle} onPress={() => Linking.openURL(href)}>
        <ButtonContent />
      </Pressable>
    );
  }

  return (
    <Link href={href as any} asChild>
      <Pressable style={buttonStyle}>
        <ButtonContent />
      </Pressable>
    </Link>
  );
};

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;

  const containerStyle = {
    ...styles.container,
    ...(isDesktop && styles.containerDesktop),
  };

  return (
    <>
      <Head>
        <title>Dorkroom.art - Darkroom and Photography Calculators</title>
        <meta name="description" content="Free online calculators for film photographers and darkroom printers. Includes border calculator, exposure calculator, print resize calculator, and more." />
      </Head>
      <ScrollView>
        <ThemedView style={containerStyle}>
          <ThemedView style={styles.content}>
            <ThemedText type="large" style={styles.mainTitle}>
              dorkroom.art
            </ThemedText>
            <ThemedText type="large" style={styles.subtitle}>
              darkroom and photography calculators
            </ThemedText>
            <ThemedText style={styles.byline}>
              by{" "}
              <ThemedText
                style={styles.link}
                onPress={() => Linking.openURL("https://www.affords.art")}
              >
                aaron f.a.
              </ThemedText>
            </ThemedText>

            <ThemedView style={styles.section}>
              <ThemedText type="large" style={styles.sectionTitle}>
                darkroom printing
              </ThemedText>
              <LinkButton
                href="/border"
                color="#4CAF50"
                title="border calculator"
              >
                border calculator
              </LinkButton>
              <LinkButton
                href="/exposure"
                color="#9C27B0"
                title="stop-based exposure calculator"
              >
                stop-based exposure calculator
              </LinkButton>
              <LinkButton
                href="/resize"
                color="#2196F3"
                title="print resize calculator"
              >
                print resize calculator
              </LinkButton>
            </ThemedView>

            <ThemedView style={styles.section}>
              <ThemedText type="large" style={styles.sectionTitle}>
                film shooting and developing
              </ThemedText>
              <LinkButton
                href="/cameraExposure"
                color="#3F51B5"
                title="exposure calculator"
              >
                exposure calculator
              </LinkButton>
              <LinkButton href="#" color="#666" disabled title="coming soon!">
                developer dilution calculator
              </LinkButton>
              <LinkButton href="#" color="#666" disabled title="coming soon!">
                push/pull calculator
              </LinkButton>
              <LinkButton
                href="/reciprocity"
                color="#FF9800"
                title="reciprocity calculator"
              >
                reciprocity calculator
              </LinkButton>
            </ThemedView>

            <ThemedView style={styles.section}>
              <LinkButton
                href="https://github.com/narrowstacks/Darkroom-Calculators"
                color="#24292e"
                title="contribute on github"
              >
                contribute on github
              </LinkButton>
              <LinkButton
                href="https://ko-fi.com/affords"
                color="#FF5E5B"
                title="support this site!"
              >
                support this site!
              </LinkButton>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  containerDesktop: {
    paddingHorizontal: 0,
  },
  content: {
    width: Platform.OS === "web" ? 480 : "100%",
    maxWidth: 480,
    alignItems: "center",
  },
  mainTitle: {
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 4,
    fontStyle: "italic",
  },
  byline: {
    marginBottom: 24,
    fontStyle: "italic",
  },
  link: {
    color: "#2196F3",
    textDecorationLine: "underline",
  },
  section: {
    width: "100%",
    marginBottom: 24,
    gap: 12,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
  },
  linkButton: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  linkButtonDisabled: {
    backgroundColor: "#666",
    opacity: 0.7,
  },
  linkButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
