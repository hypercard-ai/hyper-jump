# CLAUDE.md

## Project Overview

hyper-jump (`@hypercard-ai/hyper-jump`) is a React PDF viewer component built for RAG applications. It uses react-pdf for rendering and react-window for virtualized scrolling.

## Commands

- `npm run build` - Build with tsup (CJS + ESM + declarations)
- `npm run test` - Run tests with Vitest
- `npm run check` - Format and lint with Biome (always run after making changes)
- `npm run storybook` - Start Storybook dev server on port 6006

## Architecture

- `src/index.ts` - Public API exports
- `src/viewer/` - All viewer components with co-located CSS
  - `viewer.tsx` - Main `HyperJumpViewer` component (orchestrates document loading, zoom, navigation)
  - `controls.tsx` - Navigation and zoom controls UI
  - `renderer.tsx` - Individual page renderer (row component for react-window)
  - `loading-page.tsx` / `error-page.tsx` - Loading and error states
- `src/lib/` - Shared utilities
  - `types.ts` - Shared types (`ZoomConfig`)
  - `constants.ts` - PDF dimension constants
  - `utils.ts` - Page dimension calculations
  - `use-element-size.ts` - ResizeObserver hook for responsive sizing

## Conventions

- **Formatting/Linting**: Biome with tabs, double quotes. Run `npm run check` after changes.
- **Testing**: Vitest with jsdom. Tests live in `tests/`. Run `npm run test` after changes.
- **CSS**: BEM-style classes prefixed with `hj-` (e.g., `.hj-viewer`, `.hj-controls`)
- **Exports**: Only `HyperJumpViewer`, `HyperJumpViewerProps`, and `ZoomConfig` are public API
- **React**: Requires React 19+. Uses automatic JSX runtime.
