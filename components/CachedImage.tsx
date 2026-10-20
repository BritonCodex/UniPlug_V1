import { Image as ExpoImage, ImageProps } from "expo-image";
import React from "react";

// Install once:  npx expo install expo-image
//
// Drop-in for React Native's <Image> for pictures that come from the internet.
// It keeps them in memory and on disk, so each picture is downloaded once, not on every screen.
type Props = Omit<ImageProps, "contentFit"> & {
  resizeMode?: "cover" | "contain" | "stretch" | "center";
};

const FIT = {
  cover: "cover",
  contain: "contain",
  stretch: "fill",
  center: "none",
} as const;

const CachedImage = ({ resizeMode = "cover", ...rest }: Props) => (
  <ExpoImage
    contentFit={FIT[resizeMode]}
    cachePolicy="memory-disk"
    transition={150}
    {...rest}
  />
);

export default CachedImage;
