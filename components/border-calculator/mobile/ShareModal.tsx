import React from 'react';
import { Platform } from 'react-native';
import { 
  Modal, 
  ModalBackdrop, 
  ModalContent, 
  ModalHeader, 
  ModalCloseButton, 
  ModalBody, 
  ModalFooter,
  Heading,
  Text,
  Button,
  ButtonText,
  ButtonIcon,
  VStack,
  HStack,
  Icon,
  CloseIcon,
  useToast,
  Toast,
  ToastTitle,
  VStack as ToastVStack
} from '@gluestack-ui/themed';
import { Copy, Share2, ExternalLink, Smartphone } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { encodePreset } from '@/utils/presetSharing';
import { generateSharingUrls } from '@/utils/urlHelpers';
import type { BorderPresetSettings } from '@/types/borderPresetTypes';

interface ShareModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentSettings: BorderPresetSettings;
  presetName?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isVisible,
  onClose,
  currentSettings,
  presetName = 'Border Settings'
}) => {
  const toast = useToast();

  const shareData = React.useMemo(() => {
    const preset = { name: presetName, settings: currentSettings };
    const encoded = encodePreset(preset);
    
    if (!encoded) return null;
    
    const { webUrl, nativeUrl } = generateSharingUrls(encoded);
    return { webUrl, nativeUrl, preset };
  }, [currentSettings, presetName]);

  const copyToClipboard = async (url: string, label: string) => {
    try {
      await Clipboard.setStringAsync(url);
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="success" variant="solid">
            <ToastVStack space="xs">
              <ToastTitle>{label} copied to clipboard!</ToastTitle>
            </ToastVStack>
          </Toast>
        ),
      });
    } catch {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="solid">
            <ToastTitle>Failed to copy to clipboard</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  const shareViaSystem = async () => {
    if (!shareData) return;
    
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareData.webUrl, {
          dialogTitle: `Share ${presetName}`,
          mimeType: 'text/plain',
        });
      } else {
        // Fallback to clipboard
        await copyToClipboard(shareData.webUrl, 'Share link');
      }
    } catch {
      console.error('Share failed');
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="solid">
            <ToastTitle>Sharing failed</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  if (!shareData) {
    return (
      <Modal isOpen={isVisible} onClose={onClose}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">Share Failed</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text>Unable to create share link. Please try again.</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onPress={onClose}>
              <ButtonText>Close</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isVisible} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Share &quot;{presetName}&quot;</Heading>
          <ModalCloseButton>
            <Icon as={CloseIcon} />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <VStack space="md">
            <Text>Choose how you&apos;d like to share your border calculator settings:</Text>
            
            {/* Native Share Button */}
            <Button 
              onPress={shareViaSystem}
              variant="solid" 
              action="primary" 
              size="lg"
            >
              <ButtonIcon as={Share2} size="sm" />
              <ButtonText style={{ marginLeft: 8 }}>Share via...</ButtonText>
            </Button>

            {/* Web URL Section */}
            <VStack space="sm">
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Web Link</Text>
              <Text style={{ fontSize: 14, opacity: 0.8 }}>
                Works on any device with a web browser
              </Text>
              <HStack space="sm" style={{ alignItems: 'center' }}>
                <Button 
                  onPress={() => copyToClipboard(shareData.webUrl, 'Web link')}
                  variant="outline" 
                  action="secondary"
                  size="sm"
                  style={{ flex: 1 }}
                >
                  <ButtonIcon as={Copy} size="sm" />
                  <ButtonText style={{ marginLeft: 6 }}>Copy Web Link</ButtonText>
                </Button>
                <ButtonIcon as={ExternalLink} size="sm" style={{ opacity: 0.6 }} />
              </HStack>
            </VStack>

            {/* Native App URI Section */}
            {Platform.OS !== 'web' && (
              <VStack space="sm">
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>App Link</Text>
                <Text style={{ fontSize: 14, opacity: 0.8 }}>
                  Opens directly in the Dorkroom app
                </Text>
                <HStack space="sm" style={{ alignItems: 'center' }}>
                  <Button 
                    onPress={() => copyToClipboard(shareData.nativeUrl, 'App link')}
                    variant="outline" 
                    action="secondary"
                    size="sm"
                    style={{ flex: 1 }}
                  >
                    <ButtonIcon as={Copy} size="sm" />
                    <ButtonText style={{ marginLeft: 6 }}>Copy App Link</ButtonText>
                  </Button>
                  <ButtonIcon as={Smartphone} size="sm" style={{ opacity: 0.6 }} />
                </HStack>
              </VStack>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onPress={onClose}>
            <ButtonText>Done</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};