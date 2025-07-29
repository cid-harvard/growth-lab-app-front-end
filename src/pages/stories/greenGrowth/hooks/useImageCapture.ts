import { useRef, useCallback } from "react";
import html2canvas from "html2canvas";

export interface ImageCaptureRef {
  captureImage: (filename?: string) => Promise<void>;
  isCapturing: boolean;
}

export const useImageCapture = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isCapturing = useRef(false);

  const captureImage = useCallback(async (filename: string = "chart") => {
    if (isCapturing.current || !containerRef.current) {
      console.warn(
        "Image capture already in progress or no container element found",
      );
      return;
    }

    try {
      isCapturing.current = true;

      // Use html2canvas to capture the entire container including HTML elements
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true,
        scale: 2, // Higher resolution
        logging: false,
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${filename}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, "image/png");
    } catch (error) {
      console.error("Error capturing image:", error);
    } finally {
      isCapturing.current = false;
    }
  }, []);

  return {
    containerRef,
    captureImage,
    isCapturing: isCapturing.current,
  };
};
