# hyper-jump

[![npm version](https://img.shields.io/npm/v/@hypercard-ai/hyper-jump)](https://www.npmjs.com/package/@hypercard-ai/hyper-jump)
[![CI](https://github.com/hypercard-ai/hyper-jump/actions/workflows/ci.yml/badge.svg)](https://github.com/hypercard-ai/hyper-jump/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@hypercard-ai/hyper-jump)](./LICENSE)

A pluggable React document viewer built for RAG (Retrieval-Augmented Generation). Originally developed as part of [HyperCard.AI](https://hypercard.ai)'s chatbot platform, hyper-jump provides fast navigation that pairs with RAG citations to deliver an excellent document viewing experience.

Renderers are opt-in — only bundle what you use.

## Features

- **Pluggable renderers** — import only the file types you need (PDF today, video and more coming soon)
- Virtualized rendering via `react-window` for smooth viewing of large PDFs
- Jump-to-page navigation for instant access to cited content
- Zoom controls with preset levels and automatic fit-to-width
- Responsive layout that adapts to container size
- Lightweight, self-contained CSS with no external styling dependencies

## Installation

```bash
# Core + PDF renderer
npm install @hypercard-ai/hyper-jump react-pdf react-window
```

`react-pdf` and `react-window` are optional peer dependencies — only required when using `PdfRenderer`.

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

### Open a PDF at a specific page

Pass a zero-indexed `initialPage` to start at a specific page when the document loads:

```tsx
<HyperJumpViewer
  url="/path/to/document.pdf"
  renderers={[PdfRenderer]}
  initialPage={3}
/>
```

### Jump to a page imperatively

Use a ref to jump to any page at any time — ideal for navigating to RAG citations:

```tsx
import { useRef } from "react";
import { HyperJumpViewer } from "@hypercard-ai/hyper-jump";
import { PdfRenderer, type HyperJumpPdfViewerAPI } from "@hypercard-ai/hyper-jump/pdf";

function App() {
  const viewerRef = useRef<HyperJumpPdfViewerAPI>(null);

  return (
    <>
      <button onClick={() => viewerRef.current?.jumpToPage(5)}>
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
| `ref` | `Ref<unknown>` | No | Forwarded to the active renderer for imperative APIs |

All other props are forwarded to the matched renderer.

### PDF Renderer

Imported from `@hypercard-ai/hyper-jump/pdf`. Requires `react-pdf` and `react-window` as peer dependencies.

#### PDF-specific props (forwarded through `HyperJumpViewer`)

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `initialPage` | `number` | No | Zero-indexed page to show when the document loads |
| `onPageChange` | `(page: number) => void` | No | Called when the visible page changes (zero-indexed) |
| `scrollBehavior` | `"auto" \| "instant" \| "smooth"` | No | Scroll behavior when navigating between pages (default: `"instant"`) |

#### `HyperJumpPdfViewerAPI` (exposed via ref)

| Method | Description |
| --- | --- |
| `jumpToPage(page: number)` | Scroll to a zero-indexed page. Clamps to valid range. |

### Exports

#### `@hypercard-ai/hyper-jump` (core)

| Export | Type | Description |
| --- | --- | --- |
| `HyperJumpViewer` | Component | The core viewer component |
| `HyperJumpViewerProps` | Type | Props for the viewer component |
| `FileRenderer` | Type | Renderer descriptor interface |
| `RendererProps` | Type | Base props every renderer receives |
| `ZoomConfig` | Type | Zoom configuration interface |

#### `@hypercard-ai/hyper-jump/pdf`

| Export | Type | Description |
| --- | --- | --- |
| `PdfRenderer` | `FileRenderer` | Renderer descriptor for PDF files |
| `HyperJumpPdfViewerAPI` | Type | Imperative API exposed via ref |
| `HyperJumpPdfViewerProps` | Type | Full props for the PDF renderer |
| `ScrollBehavior` | Type | Scroll behavior union type |

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
