# CLAUDE.md

## Project Overview

hyper-jump (`@hypercard-ai/hyper-jump`) is a pluggable React document viewer built for RAG applications. It uses a renderer plugin architecture — the core `HyperJumpViewer` is a thin wrapper that delegates to file-type-specific renderers (e.g. `PdfRenderer`). Each renderer is a separate subpath export so consumers only bundle what they use.

## Commands

- `npm run build` - Build with tsup (ESM + declarations, multiple entry points)
- `npm run test` - Run tests with Vitest
- `npm run check` - Format and lint with Biome (always run after making changes)
- `npm run storybook` - Start Storybook dev server on port 6006

## Architecture

### Core (`src/index.ts`, `src/viewer/`, `src/lib/`)

- `src/index.ts` - Core public API exports (`HyperJumpViewer`, `FileRenderer`, `RendererProps`, etc.)
- `src/viewer/viewer.tsx` - `HyperJumpViewer` component (thin wrapper: file type detection, container sizing, renderer selection)
- `src/viewer/viewer.css` - Core container styles (`.hj-viewer`)
- `src/lib/types.ts` - Shared types (`HyperJumpAPI`, `FileRenderer`, `RendererProps`, `ZoomConfig`)
- `src/lib/use-element-size.ts` - ResizeObserver hook for responsive sizing

### PDF Renderer (`src/pdf/`)

Subpath export: `@hypercard-ai/hyper-jump/pdf`

- `src/pdf/index.ts` - PDF subpath entry (exports `PdfRenderer`, PDF-specific types)
- `src/pdf/pdf-viewer.tsx` - PDF renderer component (Document loading, virtualized List, zoom, page navigation)
- `src/pdf/pdf-viewer.css` - PDF-specific styles (react-pdf integration fixes)
- `src/pdf/controls.tsx` - Navigation and zoom controls UI
- `src/pdf/renderer.tsx` - Individual page renderer (row component for react-window)
- `src/pdf/loading-page.tsx` / `error-page.tsx` - Loading and error states
- `src/pdf/constants.ts` - PDF dimension constants
- `src/pdf/utils.ts` - Page dimension calculations

### Video Renderer (`src/video/`)

Subpath export: `@hypercard-ai/hyper-jump/video`

- `src/video/index.ts` - Video subpath entry (exports `VideoRenderer`, video-specific types)
- `src/video/video-viewer.tsx` - Video renderer component (native `<video>` element, jump API)
- `src/video/video-viewer.css` - Video-specific styles (`.hj-video` container)

### Markdown Renderer (`src/markdown/`)

Subpath export: `@hypercard-ai/hyper-jump/markdown`

- `src/markdown/index.ts` - Markdown subpath entry (exports `MarkdownRenderer`, markdown-specific types)
- `src/markdown/markdown-viewer.tsx` - Markdown renderer component (fetches URL, renders with react-markdown, scroll-based position)
- `src/markdown/markdown-viewer.css` - Markdown-specific styles (typography, code blocks, tables)

### Adding a new renderer

1. Create `src/<type>/` directory with a component implementing `RendererProps`
2. Export a `FileRenderer` descriptor (with `type`, `extensions`, `Component`)
3. Add a new entry in `tsup.config.ts` and subpath export in `package.json`
4. Add renderer-specific peer dependencies as optional in `package.json`

## Conventions

- **Formatting/Linting**: Biome with tabs, double quotes. Run `npm run check` after changes.
- **Testing**: Vitest with jsdom. Tests live in `tests/`. Run `npm run test` after changes.
- **CSS**: BEM-style classes prefixed with `hj-` (e.g., `.hj-viewer`, `.hj-controls`)
- **Exports**: Core exports `HyperJumpViewer`, `HyperJumpViewerProps`, `HyperJumpAPI`, `FileRenderer`, `RendererProps`, `ZoomConfig`. PDF subpath exports `PdfRenderer`, `HyperJumpPdfViewerAPI`, `HyperJumpPdfViewerProps`, `ScrollBehavior`. Video subpath exports `VideoRenderer`, `HyperJumpVideoViewerAPI`, `HyperJumpVideoViewerProps`. Markdown subpath exports `MarkdownRenderer`, `HyperJumpMarkdownViewerAPI`, `HyperJumpMarkdownViewerProps`.
- **Unified API**: All renderers share `HyperJumpAPI` (`jump(position)`), `initialPosition`, and `onPositionChange`. Renderer-specific API types (e.g. `HyperJumpPdfViewerAPI`) are aliases for `HyperJumpAPI`.
- **React**: Requires React 19+. Uses automatic JSX runtime.
- **Dependencies**: Heavy dependencies (`react-pdf`, `react-window`, `react-markdown`) are optional peer deps tied to specific renderers, not bundled in core. The video renderer uses the native `<video>` element and has no additional dependencies.
