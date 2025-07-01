import React, { useState, useEffect } from "react";
import { Platform, StyleSheet } from "react-native";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Box,
  Text,
  VStack,
  HStack,
  Button,
  ButtonText,
  useToast,
  Toast,
  ToastTitle,
} from "@gluestack-ui/themed";
import { X, Share, Copy, Check } from "lucide-react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useShareLink, ShareLinkOptions } from "@/hooks/useShareLink";
import { formatTime } from "@/constants/developmentRecipes";
import { formatDilution } from "@/utils/dilutionUtils";
import type { Film, Developer, Combination } from "@/api/dorkroom/types";

export interface ShareRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Combination;
  film?: Film;
  developer?: Developer;
}

export function ShareRecipeModal({
  isOpen,
  onClose,
  recipe,
  film,
  developer,
}: ShareRecipeModalProps) {
  const [shareUrl, setShareUrl] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState(false);

  const toast = useToast();
  const { generateShareUrl, shareRecipe, copyToClipboard } = useShareLink();

  const textColor = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const developmentTint = useThemeColor({}, "developmentRecipesTint");
  const cardBackground = useThemeColor({}, "cardBackground");
  const borderColor = useThemeColor({}, "borderColor");
  const resultRowBackground = useThemeColor({}, "resultRowBackground");

  // Generate share URL when modal opens
  useEffect(() => {
    if (isOpen && recipe) {
      const shareOptions: ShareLinkOptions = {
        recipe,
        includeSource: true,
      };
      const url = generateShareUrl(shareOptions);
      setShareUrl(url);
    }
  }, [isOpen, recipe, generateShareUrl]);

  // Reset copy success state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCopySuccess(false);
    }
  }, [isOpen]);

  const handleShare = async () => {
    try {
      const shareOptions: ShareLinkOptions = {
        recipe,
        includeSource: true,
      };

      const result = await shareRecipe(shareOptions);

      if (result.success) {
        let successMessage = "Recipe shared successfully!";
        if (result.method === "clipboard") {
          successMessage = "Recipe link copied to clipboard!";
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        }

        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="success" variant="solid">
              <ToastTitle>{successMessage}</ToastTitle>
            </Toast>
          ),
        });

        // Close modal after successful share (except for clipboard)
        if (result.method !== "clipboard") {
          onClose();
        }
      } else {
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="error" variant="solid">
              <ToastTitle>
                {result.error || "Failed to share recipe"}
              </ToastTitle>
            </Toast>
          ),
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to share recipe";

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="solid">
            <ToastTitle>{errorMessage}</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareOptions: ShareLinkOptions = {
        recipe,
        includeSource: true,
      };

      const result = await copyToClipboard(shareOptions);

      if (result.success) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);

        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="success" variant="solid">
              <ToastTitle>Recipe link copied to clipboard!</ToastTitle>
            </Toast>
          ),
        });
      } else {
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="error" variant="solid">
              <ToastTitle>{result.error || "Failed to copy link"}</ToastTitle>
            </Toast>
          ),
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to copy link";

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="solid">
            <ToastTitle>{errorMessage}</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  // Get recipe details for preview
  const filmName = film ? `${film.brand} ${film.name}` : "Unknown Film";
  const developerName = developer
    ? `${developer.manufacturer} ${developer.name}`
    : "Unknown Developer";

  const dilutionInfo = formatDilution(
    recipe.customDilution ||
      developer?.dilutions.find((d) => d.id === recipe.dilutionId)?.dilution ||
      "Stock",
  );

  const shareTitle = `${filmName} + ${developerName}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent style={{ backgroundColor: cardBackground }}>
        <ModalHeader>
          <Text style={[styles.modalTitle, { color: textColor }]}>
            Share Recipe
          </Text>
          <ModalCloseButton>
            <X size={20} color={textColor} />
          </ModalCloseButton>
        </ModalHeader>

        <ModalBody>
          <VStack space="lg">
            {/* Recipe Preview */}
            <Box
              style={[
                styles.recipePreview,
                {
                  backgroundColor: resultRowBackground,
                  borderColor: borderColor,
                },
              ]}
            >
              <VStack space="sm">
                <Text style={[styles.previewTitle, { color: developmentTint }]}>
                  {shareTitle}
                </Text>

                <HStack space="md" style={styles.previewDetails}>
                  <VStack space="xs" style={styles.previewColumn}>
                    <Text
                      style={[styles.previewLabel, { color: textSecondary }]}
                    >
                      Time
                    </Text>
                    <Text style={[styles.previewValue, { color: textColor }]}>
                      {formatTime(recipe.timeMinutes)}
                    </Text>
                  </VStack>

                  <VStack space="xs" style={styles.previewColumn}>
                    <Text
                      style={[styles.previewLabel, { color: textSecondary }]}
                    >
                      Temperature
                    </Text>
                    <Text style={[styles.previewValue, { color: textColor }]}>
                      {recipe.temperatureF}°F
                    </Text>
                  </VStack>

                  <VStack space="xs" style={styles.previewColumn}>
                    <Text
                      style={[styles.previewLabel, { color: textSecondary }]}
                    >
                      ISO
                    </Text>
                    <Text style={[styles.previewValue, { color: textColor }]}>
                      {recipe.shootingIso}
                    </Text>
                  </VStack>

                  <VStack space="xs" style={styles.previewColumn}>
                    <Text
                      style={[styles.previewLabel, { color: textSecondary }]}
                    >
                      Dilution
                    </Text>
                    <Text style={[styles.previewValue, { color: textColor }]}>
                      {dilutionInfo}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </Box>

            {/* Share Options */}
            <VStack space="md">
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Share Options
              </Text>

              {/* Native Share Button */}
              {Platform.OS !== "web" && (
                <Button
                  variant="solid"
                  onPress={handleShare}
                  style={[
                    styles.shareButton,
                    { backgroundColor: developmentTint },
                  ]}
                >
                  <Share size={16} color="white" />
                  <ButtonText style={styles.shareButtonText}>
                    Share Recipe
                  </ButtonText>
                </Button>
              )}

              {/* Copy Link Button */}
              <Button
                variant="outline"
                onPress={handleCopyLink}
                style={[styles.shareButton, { borderColor: borderColor }]}
              >
                {copySuccess ? (
                  <Check size={16} color={developmentTint} />
                ) : (
                  <Copy size={16} color={textColor} />
                )}
                <ButtonText
                  style={[
                    styles.shareButtonText,
                    { color: copySuccess ? developmentTint : textColor },
                  ]}
                >
                  {copySuccess ? "Copied!" : "Copy Link"}
                </ButtonText>
              </Button>

              {/* Web Share Button (Web only) */}
              {Platform.OS === "web" && (
                <Button
                  variant="solid"
                  onPress={handleShare}
                  style={[
                    styles.shareButton,
                    { backgroundColor: developmentTint },
                  ]}
                >
                  <Share size={16} color="white" />
                  <ButtonText style={styles.shareButtonText}>
                    Share Recipe
                  </ButtonText>
                </Button>
              )}
            </VStack>

            {/* Share URL Preview */}
            <Box
              style={[
                styles.urlPreview,
                {
                  backgroundColor: resultRowBackground,
                  borderColor: borderColor,
                },
              ]}
            >
              <Text style={[styles.urlLabel, { color: textSecondary }]}>
                Share URL:
              </Text>
              <Text
                style={[styles.urlText, { color: textColor }]}
                numberOfLines={2}
                selectable
              >
                {shareUrl}
              </Text>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  recipePreview: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  previewDetails: {
    justifyContent: "space-around",
  },
  previewColumn: {
    alignItems: "center",
    flex: 1,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  previewValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  shareButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
  urlPreview: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  urlLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  urlText: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});
