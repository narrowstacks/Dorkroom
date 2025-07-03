import React, { Component, ReactNode, ErrorInfo } from "react";
import { Box, Text, Button, ButtonText, VStack } from "@gluestack-ui/themed";
import { RefreshCw, AlertTriangle } from "lucide-react-native";
import { debugError } from "@/utils/debugLogger";
import { useThemeColor } from "@/hooks/ui/theming";

interface Props {
  children: ReactNode;
  onRetry?: () => void;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class RecipeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log the error for debugging
    debugError("RecipeErrorBoundary caught error:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount,
    });
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));

    // Call the onRetry callback if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ErrorFallback onRetry={this.handleRetry} error={this.state.error} />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  onRetry: () => void;
  error: Error | null;
}

function ErrorFallback({ onRetry, error }: ErrorFallbackProps) {
  const textColor = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const developmentTint = useThemeColor({}, "developmentRecipesTint");
  const cardBackground = useThemeColor({}, "cardBackground");

  const isInfiniteRenderError = error?.message?.includes(
    "Maximum update depth exceeded",
  );
  const isMemoryError =
    error?.message?.toLowerCase().includes("memory") ||
    error?.message?.toLowerCase().includes("heap");
  const isNetworkError =
    error?.message?.toLowerCase().includes("network") ||
    error?.message?.toLowerCase().includes("fetch");

  const getErrorMessage = () => {
    if (isInfiniteRenderError) {
      return {
        title: "Rendering Issue Detected",
        description:
          "The page encountered a rendering loop. This is usually fixed by refreshing.",
        suggestion:
          "Try refreshing the page. If the problem persists, please contact support.",
      };
    }

    if (isMemoryError) {
      return {
        title: "Memory Issue",
        description: "The page used too much memory processing recipe data.",
        suggestion: "Try refreshing the page or reducing your search filters.",
      };
    }

    if (isNetworkError) {
      return {
        title: "Network Error",
        description: "Unable to load recipe data from the server.",
        suggestion: "Check your internet connection and try again.",
      };
    }

    return {
      title: "Something went wrong",
      description:
        "An unexpected error occurred while loading the development recipes.",
      suggestion:
        "Try refreshing the page. If the problem persists, please contact support.",
    };
  };

  const { title, description, suggestion } = getErrorMessage();

  return (
    <Box
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: cardBackground,
      }}
    >
      <VStack space="lg" style={{ alignItems: "center", maxWidth: 400 }}>
        <AlertTriangle size={48} color={developmentTint} />

        <VStack space="md" style={{ alignItems: "center" }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: textColor,
              textAlign: "center",
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: textSecondary,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            {description}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: textSecondary,
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            {suggestion}
          </Text>
        </VStack>

        <Button
          onPress={onRetry}
          style={{
            backgroundColor: developmentTint,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <RefreshCw size={16} color="#fff" />
          <ButtonText
            style={{ color: "#fff", fontSize: 16, fontWeight: "500" }}
          >
            Try Again
          </ButtonText>
        </Button>

        {__DEV__ && error && (
          <Box
            style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: "rgba(255, 0, 0, 0.1)",
              borderRadius: 8,
              borderLeftWidth: 4,
              borderLeftColor: "#ff4444",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: textColor,
                fontFamily: "monospace",
              }}
            >
              {error.message}
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

export default RecipeErrorBoundary;
