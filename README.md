# hyper-jump

[![npm version](https://img.shields.io/npm/v/@hypercard-ai/hyper-jump)](https://www.npmjs.com/package/@hypercard-ai/hyper-jump)
[![CI](https://github.com/hypercard-ai/hyper-jump/actions/workflows/ci.yml/badge.svg)](https://github.com/hypercard-ai/hyper-jump/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@hypercard-ai/hyper-jump)](./LICENSE)

A pluggable React document viewer built for RAG (Retrieval-Augmented Generation). Originally developed as part of [HyperCard.AI](https://hypercard.ai)'s chatbot platform, hyper-jump provides fast navigation that pairs with RAG citations to deliver an excellent document viewing experience.

Renderers are opt-in — only bundle what you use.

## Features

- **Pluggable renderers** — import only the file types you need (PDF, video, and more coming soon)
- Virtualized rendering via `react-window` for smooth viewing of large PDFs
- Unified `jump()` API for instant navigation to cited content across all file types
- Zoom controls with preset levels and automatic fit-to-width
- Responsive layout that adapts to container size
- Lightweight, self-contained CSS with no external styling dependencies

## Installation

```bash
# Core + PDF renderer
npm install @hypercard-ai/hyper-jump react-pdf react-window

# Core + Video renderer
npm install @hypercard-ai/hyper-jump @vidstack/react
```

Renderer dependencies are optional peer dependencies — only install those needed by the renderers you use.

## Usage

```tsx
import { HyperJumpViewer } from "@hypercard-ai/hyper-jump";
import { PdfRenderer } from "@hypercard-ai/hyper-jump/pdf";

function App() {
  return (
    <HyperJumpViewer
      url="/path/to/document.pdf"
      renderers={[PdfRenderer]}
    />
  );
}
```

### Open at a specific position

Pass `initialPosition` to start at a specific location when the file loads. The meaning depends on the renderer — page index for PDF, seconds for video:

```tsx
// PDF: open at page 4 (0-indexed)
<HyperJumpViewer url="/doc.pdf" renderers={[PdfRenderer]} initialPosition={3} />

// Video: start at 30 seconds
<HyperJumpViewer url="/clip.mp4" renderers={[VideoRenderer]} initialPosition={30} />
```

### Jump to a position imperatively

Use a ref to jump to any position at any time — ideal for navigating to RAG citations. The `jump()` method works the same across all renderers:

```tsx
import { useRef } from "react";
import { HyperJumpViewer, type HyperJumpAPI } from "@hypercard-ai/hyper-jump";
import { PdfRenderer } from "@hypercard-ai/hyper-jump/pdf";

function App() {
  const viewerRef = useRef<HyperJumpAPI>(null);

  return (
    <>
      <button onClick={() => viewerRef.current?.jump(5)}>
        Go to page 6
      </button>
      <HyperJumpViewer
        url="/path/to/document.pdf"
        renderers={[PdfRenderer]}
        ref={viewerRef}
      />
    </>
  );
}
```

## API

### `<HyperJumpViewer />`

The core component. It detects the file type from the URL extension (or an explicit `type` prop), picks the first matching renderer, and forwards all remaining props to it.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `url` | `string` | Yes | URL or path to the file |
| `renderers` | `FileRenderer[]` | Yes | Renderers the viewer can use (first match wins) |
| `type` | `string` | No | Explicit file type override (e.g. `"pdf"`). If omitted, detected from URL extension |
| `ref` | `Ref<HyperJumpAPI>` | No | Forwarded to the active renderer for the `jump()` API |

All other props are forwarded to the matched renderer.

### Shared props

These props are supported by all renderers with consistent names:

| Prop | Type | Description |
| --- | --- | --- |
| `initialPosition` | `number` | Position to start at when the file loads (page index for PDF, seconds for video) |
| `onPositionChange` | `(position: number) => void` | Called when the current position changes |

### `HyperJumpAPI` (exposed via ref)

All renderers expose the same imperative API:

| Method | Description |
| --- | --- |
| `jump(position: number)` | Jump to a position. Page index for PDF (0-indexed, clamped), seconds for video. |

### PDF Renderer

Imported from `@hypercard-ai/hyper-jump/pdf`. Requires `react-pdf` and `react-window` as peer dependencies.

#### PDF-specific props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `scrollBehavior` | `"auto" \| "instant" \| "smooth"` | No | Scroll behavior when navigating between pages (default: `"instant"`) |

### Video Renderer

Imported from `@hypercard-ai/hyper-jump/video`. Requires `@vidstack/react` as a peer dependency.

```tsx
import { HyperJumpViewer } from "@hypercard-ai/hyper-jump";
import { VideoRenderer } from "@hypercard-ai/hyper-jump/video";
import "@hypercard-ai/hyper-jump/video/styles.css";

function App() {
  return (
    <HyperJumpViewer
      url="/path/to/video.mp4"
      renderers={[VideoRenderer]}
    />
  );
}
```

#### Video-specific props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `title` | `string` | No | Video title shown by the player |
| `autoPlay` | `boolean` | No | Whether the video should autoplay (default: `false`) |

### Exports

#### `@hypercard-ai/hyper-jump` (core)

| Export | Type | Description |
| --- | --- | --- |
| `HyperJumpViewer` | Component | The core viewer component |
| `HyperJumpViewerProps` | Type | Props for the viewer component |
| `HyperJumpAPI` | Type | Shared imperative API (`jump`) exposed via ref |
| `FileRenderer` | Type | Renderer descriptor interface |
| `RendererProps` | Type | Base props every renderer receives |
| `ZoomConfig` | Type | Zoom configuration interface |

#### `@hypercard-ai/hyper-jump/pdf`

| Export | Type | Description |
| --- | --- | --- |
| `PdfRenderer` | `FileRenderer` | Renderer descriptor for PDF files |
| `HyperJumpPdfViewerAPI` | Type | Alias for `HyperJumpAPI` |
| `HyperJumpPdfViewerProps` | Type | Full props for the PDF renderer |
| `ScrollBehavior` | Type | Scroll behavior union type |

#### `@hypercard-ai/hyper-jump/video`

| Export | Type | Description |
| --- | --- | --- |
| `VideoRenderer` | `FileRenderer` | Renderer descriptor for video files |
| `HyperJumpVideoViewerAPI` | Type | Alias for `HyperJumpAPI` |
| `HyperJumpVideoViewerProps` | Type | Full props for the video renderer |

### Creating a custom renderer

Implement the `FileRenderer` interface to add support for any file type:

```tsx
import type { FileRenderer, RendererProps } from "@hypercard-ai/hyper-jump";

const MyVideoRenderer: FileRenderer = {
  type: "video",
  extensions: ["mp4", "webm", "mov"],
  Component: ({ url, containerWidth, containerHeight, ...props }) => (
    <video src={url} width={containerWidth} height={containerHeight} controls />
  ),
};

<HyperJumpViewer url="/clip.mp4" renderers={[PdfRenderer, MyVideoRenderer]} />
```

## Requirements

- React 19+
- react-pdf 10+ (when using `PdfRenderer`)
- react-window 2+ (when using `PdfRenderer`)
- @vidstack/react 1+ (when using `VideoRenderer`)

## Development

```bash
npm install
npm run storybook    # Start Storybook on port 6006
npm run test         # Run tests
npm run check        # Format and lint with Biome
npm run build        # Build the package
```

## License

MIT
