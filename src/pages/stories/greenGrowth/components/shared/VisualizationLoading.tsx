import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { keyframes } from '@mui/system';

interface VisualizationLoadingProps {
  /** Loading message to display below the spinner. Set to empty string or null to hide text */
  message?: string | null;
  /** Size of the loading spinner */
  size?: 'small' | 'medium' | 'large';
  /** Whether to fill the full height of the container */
  fullHeight?: boolean;
}

// Spinner animation keyframes
const spinAnimation = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

/**
 * Consistent loading component for greenGrowth visualizations
 *
 * Usage examples:
 * ```tsx
 * // Default usage
 * <VisualizationLoading />
 *
 * // With custom message
 * <VisualizationLoading message="Loading chart data..." />
 *
 * // Spinner only, no text
 * <VisualizationLoading message="" />
 *
 * // Small size for inline loading
 * <VisualizationLoading size="small" fullHeight={false} />
 *
 * // Large size for full-screen loading
 * <VisualizationLoading size="large" message="Processing complex visualization..." />
 * ```
 */
const VisualizationLoading: React.FC<VisualizationLoadingProps> = ({
  message,
  size = 'medium',
  fullHeight = true,
}) => {
  const theme = useTheme();

  // Size configurations
  const sizeConfig = {
    small: {
      ringSize: 48,
      borderWidth: 4,
      fontSize: '0.875rem',
      spacing: 1.5,
    },
    medium: {
      ringSize: 64,
      borderWidth: 6,
      fontSize: '1rem',
      spacing: 2,
    },
    large: {
      ringSize: 80,
      borderWidth: 8,
      fontSize: '1.125rem',
      spacing: 2.5,
    },
  };

  const config = sizeConfig[size];
  const ringSize = config.ringSize;
  const childSize = ringSize * 0.8;
  const margin = (ringSize - childSize) / 2;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.palette.background.default,
        width: '100%',
        height: fullHeight ? '100%' : 'auto',
        minHeight: fullHeight ? 200 : 'auto',
        padding: theme.spacing(2),
      }}
    >
      {/* Loading Ring */}
      <Box
        sx={{
          position: 'relative',
          width: ringSize,
          height: ringSize,
          mb: config.spacing,
        }}
      >
        {[0, 1, 2, 3].map((index) => (
          <Box
            key={index}
            sx={{
              boxSizing: 'border-box',
              display: 'block',
              position: 'absolute',
              width: childSize,
              height: childSize,
              margin: `${margin}px`,
              border: `${config.borderWidth}px solid`,
              borderRadius: '50%',
              borderColor: `${theme.palette.primary.main} transparent transparent transparent`,
              animation: `${spinAnimation} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite`,
              animationDelay: `${-0.45 + index * 0.15}s`,
            }}
          />
        ))}
      </Box>

      {/* Loading Message - only show if message is provided */}
      {message && (
        <Typography
          variant='body1'
          sx={{
            color: theme.palette.text.secondary,
            fontSize: config.fontSize,
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default VisualizationLoading;
