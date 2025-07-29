import React, { createContext, useContext, useState, useCallback } from "react";

interface ImageCaptureContextType {
  captureFunction: (() => Promise<void>) | null;
  isImageAvailable: boolean;
  registerCaptureFunction: (fn: () => Promise<void>) => void;
  unregisterCaptureFunction: () => void;
}

const ImageCaptureContext = createContext<ImageCaptureContextType | undefined>(
  undefined,
);

export const ImageCaptureProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [captureFunction, setCaptureFunction] = useState<
    (() => Promise<void>) | null
  >(null);

  const registerCaptureFunction = useCallback((fn: () => Promise<void>) => {
    setCaptureFunction(() => fn);
  }, []);

  const unregisterCaptureFunction = useCallback(() => {
    setCaptureFunction(null);
  }, []);

  const isImageAvailable = captureFunction !== null;

  return (
    <ImageCaptureContext.Provider
      value={{
        captureFunction,
        isImageAvailable,
        registerCaptureFunction,
        unregisterCaptureFunction,
      }}
    >
      {children}
    </ImageCaptureContext.Provider>
  );
};

export const useImageCaptureContext = () => {
  const context = useContext(ImageCaptureContext);
  if (context === undefined) {
    throw new Error(
      "useImageCaptureContext must be used within an ImageCaptureProvider",
    );
  }
  return context;
};
