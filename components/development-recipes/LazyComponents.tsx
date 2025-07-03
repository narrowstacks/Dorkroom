import React, { Suspense } from "react";
import { Box, Spinner } from "@gluestack-ui/themed";
import { useThemeColor } from "@/hooks/useThemeColor";

// Lazy load modal components
const RecipeDetail = React.lazy(() =>
  import("./RecipeDetail").then((module) => ({ default: module.RecipeDetail })),
);

const CustomRecipeForm = React.lazy(() =>
  import("./CustomRecipeForm").then((module) => ({
    default: module.CustomRecipeForm,
  })),
);

// Loading component for suspense
const ModalLoader: React.FC = () => {
  const developmentTint = useThemeColor({}, "developmentRecipesTint");

  return (
    <Box
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        minHeight: 200,
      }}
    >
      <Spinner size="large" color={developmentTint} />
    </Box>
  );
};

// Wrapped lazy components with suspense
export const LazyRecipeDetail: React.FC<
  React.ComponentProps<typeof RecipeDetail>
> = (props) => (
  <Suspense fallback={<ModalLoader />}>
    <RecipeDetail {...props} />
  </Suspense>
);

export const LazyCustomRecipeForm: React.FC<
  React.ComponentProps<typeof CustomRecipeForm>
> = (props) => (
  <Suspense fallback={<ModalLoader />}>
    <CustomRecipeForm {...props} />
  </Suspense>
);
