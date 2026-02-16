# hyper-jump

[![npm version](https://img.shields.io/npm/v/@hypercard-ai/hyper-jump)](https://www.npmjs.com/package/@hypercard-ai/hyper-jump)
[![CI](https://github.com/hypercard-ai/hyper-jump/actions/workflows/ci.yml/badge.svg)](https://github.com/hypercard-ai/hyper-jump/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@hypercard-ai/hyper-jump)](./LICENSE)

A React PDF viewer built for RAG (Retrieval-Augmented Generation). Originally developed as part of [HyperCard.AI](https://hypercard.ai)'s chatbot platform, hyper-jump provides fast page navigation that pairs with RAG citations to deliver an excellent document viewing experience.

## Features

- Virtualized rendering via `react-window` for smooth viewing of large PDFs
- Jump-to-page navigation for instant access to cited content
- Zoom controls with preset levels and automatic fit-to-width
- Responsive layout that adapts to container size
- Lightweight, self-contained CSS with no external styling dependencies

## Installation

```bash
npm install @hypercard-ai/hyper-jump react-pdf
```

## Usage

```tsx
import { HyperJumpViewer } from "@hypercard-ai/hyper-jump";
import "@hypercard-ai/hyper-jump/styles.css";

function App() {
  return <HyperJumpViewer url="/path/to/document.pdf" />;
}
```

### Open a PDF at a specific page

Pass a zero-indexed `initialPage` to start at a specific page when the document loads:

```tsx
<HyperJumpViewer url="/path/to/document.pdf" initialPage={3} />
```

### Jump to a page imperatively

Use a ref to jump to any page at any time — ideal for navigating to RAG citations:

```tsx
import { useRef } from "react";
import { HyperJumpViewer, type HyperJumpViewerAPI } from "@hypercard-ai/hyper-jump";
import "@hypercard-ai/hyper-jump/styles.css";

function App() {
  const viewerRef = useRef<HyperJumpViewerAPI>(null);

  return (
    <>
      <button onClick={() => viewerRef.current?.jumpToPage(5)}>
        Go to page 6
      </button>
      <HyperJumpViewer url="/path/to/document.pdf" ref={viewerRef} />
    </>
  );
}
```

## API

### `<HyperJumpViewer />`

| Prop           | Type                          | Required | Description                                        |
| -------------- | ----------------------------- | -------- | -------------------------------------------------- |
| `url`          | `string`                      | Yes      | URL or path to the PDF file                        |
| `initialPage`  | `number`                      | No       | Zero-indexed page to show when the document loads  |
| `onPageChange` | `(page: number) => void`      | No       | Called when the visible page changes (zero-indexed) |
| `scrollBehavior` | `"auto" \| "instant" \| "smooth"` | No | Scroll behavior when navigating between pages (default: `"instant"`) |
| `ref`          | `Ref<HyperJumpViewerAPI>`     | No       | Ref exposing imperative `jumpToPage` method        |

### `HyperJumpViewerAPI`

| Method                      | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| `jumpToPage(page: number)`  | Scroll to a zero-indexed page. Clamps to valid range.|

### Exports

| Export                  | Type      | Description                          |
| ----------------------- | --------- | ------------------------------------ |
| `HyperJumpViewer`       | Component | The PDF viewer component             |
| `HyperJumpViewerAPI`    | Type      | Imperative API exposed via ref       |
| `HyperJumpViewerProps`  | Type      | Props for the viewer component       |
| `ZoomConfig`            | Type      | Zoom configuration interface         |

## Requirements

- React 19+
- react-pdf 10+

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
