# SankeyTree Component

This directory contains the refactored SankeyTree component, which was previously a single 1,558-line file that has been broken down into multiple logical modules for better maintainability.

## File Structure

The SankeyTree component has been refactored from a single 1,558-line file into a well-organized directory structure:

- **`queries.ts`** (92 lines): All GraphQL queries
- **`types.ts`** (151 lines): TypeScript interfaces and type definitions
- **`constants.ts`** (24 lines): Value chain color mappings and RCA color utilities
- **`dataUtils.ts`** (295 lines): Data processing and hierarchy building functions
- **`layoutUtils.ts`** (208 lines): Layout calculation and positioning functions
- **`hooks.ts`** (190 lines): Custom React hooks for data fetching and processing
- **`Legend.tsx`** (58 lines): RCA legend component
- **`index.tsx`** (691 lines): Main component with React logic and rendering

## Code Deduplication Opportunities

After analyzing the codebase, several duplications have been identified that could be centralized:

### 1. **GraphQL Queries (High Priority)**

**Duplicated Queries:**

- `GET_COUNTRIES` exists in both:
  - `src/pages/stories/greenGrowth/components/visualization/SankeyTree/queries.ts` (basic fields)
  - `src/pages/stories/greenGrowth/queries/countries.js` (comprehensive fields)
- `ggCpyList` query appears in:
  - `SankeyTree/queries.ts` as `GET_COUNTRY_PRODUCT_DATA`
  - `src/pages/stories/greenGrowth/queries/cpy.js` as `GG_CPY_LIST_QUERY`
- `ggClusterList` query duplicated across multiple files:
  - `SankeyTree/queries.ts` as `GET_CLUSTERS` and `GET_ALL_CLUSTERS`
  - `ProductScatter.jsx` as `CLUSTERS_QUERY`
  - `useStackedBars.js` as `CLUSTERS_QUERY`

**Recommendation:** Move all shared queries to `src/pages/stories/greenGrowth/queries/` and import them consistently.

### 2. **Custom Hooks (Medium Priority)**

**Duplicated Patterns:**

- URL parameter hooks:
  - `SankeyTree/index.tsx` uses `useUrlParams()`
  - Other components use `useCountrySelection()`, `useYearSelection()`
- Product lookup hooks:
  - `useProductLookup()` is used across multiple components
  - Could be centralized in a shared hooks directory

### 3. **TypeScript Interfaces (Medium Priority)**

**Duplicated Types:**

- `Country` interface exists in:
  - `SankeyTree/types.ts` (minimal version)
  - `src/pages/albaniaTool/graphql/graphQLTypes.ts` (comprehensive version)
- Similar data structures across different tools could be unified

### 4. **Color Constants and Utilities (Medium Priority)**

**Duplicated Color Logic:**

- RCA color mapping in `SankeyTree/constants.ts` (`getColorFromRca`)
- Similar RCA opacity logic in `CirclePack.jsx` (`getRCAOpacity`)
- Multiple `colorScale` definitions across files
- Various color schemes in different tools

**Recommendation:** Create a shared color utilities file at `src/pages/stories/greenGrowth/utils/colors.ts`

### 5. **Data Processing Patterns (Low Priority)**

**Similar Patterns:**

- Country-specific data fetching logic appears in multiple places
- Product mapping and clustering logic could be shared
- RCA calculation and ranking logic

## Recommended Refactoring Steps

### Phase 1: Query Consolidation

1. Audit all GraphQL queries in the greenGrowth story
2. Consolidate duplicate queries in `src/pages/stories/greenGrowth/queries/`
3. Update all imports to use shared queries

### Phase 2: Shared Utilities

1. Create `src/pages/stories/greenGrowth/utils/` directory
2. Move shared color utilities to `utils/colors.ts`
3. Create shared hooks in `utils/hooks.ts`

### Phase 3: Type Definitions

1. Create shared type definitions in `src/pages/stories/greenGrowth/types/`
2. Extend existing interfaces rather than redefining them

### Phase 4: Hook Consolidation

1. Standardize URL parameter usage across all components
2. Create shared data fetching hooks

## Benefits

- **Separation of Concerns**: Each file has a single responsibility
- **Reusability**: Utilities and hooks can be shared across components
- **Maintainability**: Smaller files are easier to understand and modify
- **Type Safety**: Comprehensive TypeScript interfaces
- **Testing**: Individual functions can be unit tested
- **Performance**: Shared hooks can implement better caching strategies

## Usage

The component is imported from the main visualization directory:

```typescript
import SankeyTree from "./SankeyTree";
```

The original `SankeyTree.tsx` file now simply re-exports the component from this subdirectory:

```typescript
export { default } from "./SankeyTree/index";
```

This maintains backward compatibility while providing the benefits of the modular structure.
