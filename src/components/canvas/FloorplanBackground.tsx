"use client";
import { Image } from "react-konva";
import useImage from "use-image";

export default function FloorplanBackground({ imageUrl }: { imageUrl: string }) {
  const [image] = useImage(imageUrl);
  if (!image) return null;
  return <Image image={image} listening={false} />;
}
