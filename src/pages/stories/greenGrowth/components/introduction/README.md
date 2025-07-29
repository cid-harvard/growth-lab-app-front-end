# Animated Value Chain Introduction

This directory contains the animated introduction to green value chains, clusters, and products.

## Components

### `AnimatedValueChainIntro.tsx`

The main animated component that provides a step-by-step introduction to:

1. **Value Chains Overview**: Shows all value chains as colored circles
2. **Chain Layout**: Animates chains to top of screen in organized layout
3. **Clusters Reveal**: Shows clusters within a selected value chain (click to explore)
4. **Products Reveal**: Shows products within clusters as small circles
5. **Cross-Connections**: Highlights clusters that appear across multiple value chains
6. **Bubble Preview**: Prepares users for the main bubble visualization

## Features

- **Interactive**: Click on value chains to explore their clusters and products
- **Auto-play**: Automatically progresses through steps with play/pause controls
- **Navigation**: Skip forward/backward through steps
- **Data Integration**: Uses the shared `useGreenGrowthData` hook for consistent data
- **Responsive**: Adapts to different screen sizes
- **Animated Transitions**: Smooth CSS transitions between states

## Usage

```tsx
import { AnimatedValueChainIntro } from "./introduction";

<AnimatedValueChainIntro
  width={900}
  height={600}
  selectedCountry={1}
  selectedYear={2021}
/>;
```

## Layer Components

- **ClustersLayer**: Shows clusters connected to a focused value chain
- **ProductsLayer**: Shows products within clusters in circular layout
- **ConnectionsLayer**: Visualizes cross-chain cluster connections

## Animation Steps

Each step progressively reveals more complexity:

- Step 0: Initial value chain circles
- Step 1: Chains move to top layout
- Step 2+: Interactive exploration of clusters
- Step 3+: Product visualization
- Step 4+: Cross-connections highlighted

This provides a gentle introduction to the hierarchy before users encounter the full bubble visualization.
