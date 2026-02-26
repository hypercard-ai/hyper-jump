import type { PDFDocumentProxy } from "pdfjs-dist";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import { Document, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import type { OnDocumentLoadSuccess } from "react-pdf/dist/shared/types.js";
import { List, type ListImperativeAPI } from "react-window";
import type {
	FileRenderer,
	HyperJumpAPI,
	RendererProps,
	ZoomConfig,
} from "../lib/types";
import PDFViewerControls from "./controls";
import PDFErrorPage from "./error-page";
import PDFLoadingPage from "./loading-page";
import "./pdf-viewer.css";
import PDFPageRenderer from "./renderer";
import { getPageDimensions } from "./utils";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PAGE_MARGIN = 12;

export type HyperJumpPdfViewerAPI = HyperJumpAPI;

export type ScrollBehavior = "auto" | "instant" | "smooth";

export interface HyperJumpPdfViewerProps extends RendererProps {
	/** Scroll behavior when navigating between pages (default: "instant") */
	scrollBehavior?: ScrollBehavior;
}

const PdfViewerComponent = forwardRef<
	HyperJumpPdfViewerAPI,
	HyperJumpPdfViewerProps
>(function PdfViewerComponent(props, ref) {
	const {
		url,
		initialPosition,
		onPositionChange,
		scrollBehavior = "instant",
	} = props;
	const [document, setDocument] = useState<PDFDocumentProxy>();
	const [pageIndex, setPageIndex] = useState(0);
	const [pageDimensions, setPageDimensions] = useState<
		{ width: number; height: number }[]
	>([]);
	const [zoomConfig, setZoomConfig] = useState<ZoomConfig>({
		mode: "automatic",
		value: 1,
	});
	const scrollPageRef = useRef(0);

	const listRef = useRef<ListImperativeAPI>(null);

	const numPages = useMemo(() => {
		return document?.numPages || 0;
	}, [document]);

	useEffect(() => {
		if (document) {
			getPageDimensions(document, zoomConfig.value).then((value) => {
				setPageDimensions(value);
			});
		}
	}, [document, zoomConfig]);

	const scrollToPage = useCallback(
		(target: number) => {
			if (numPages === 0 || pageDimensions.length !== numPages) return;
			const clamped = Math.max(0, Math.min(Math.floor(target), numPages - 1));
			listRef.current?.scrollToRow({
				index: clamped,
				align: "start",
				behavior: scrollBehavior,
			});
			setPageIndex(clamped);
		},
		[numPages, pageDimensions, scrollBehavior],
	);

	useImperativeHandle(ref, () => ({ jump: scrollToPage }), [scrollToPage]);

	const hasAppliedInitialPosition = useRef(false);

	const onLoadSuccess: OnDocumentLoadSuccess = useCallback((response) => {
		hasAppliedInitialPosition.current = false;
		setDocument(response);
	}, []);

	// Scroll to initialPosition once when dimensions are first available.
	// Deferred by a frame so the List's scroll container is fully initialized.
	useEffect(() => {
		if (
			!hasAppliedInitialPosition.current &&
			initialPosition !== undefined &&
			pageDimensions.length === numPages &&
			numPages > 0
		) {
			hasAppliedInitialPosition.current = true;
			const id = requestAnimationFrame(() => scrollToPage(initialPosition));
			return () => cancelAnimationFrame(id);
		}
	}, [initialPosition, pageDimensions, numPages, scrollToPage]);

	const file = useMemo(() => {
		return { url };
	}, [url]);

	const onPrevPage = useCallback(() => {
		if (pageIndex > 0) {
			const newPageIndex = pageIndex - 1;
			listRef.current?.scrollToRow({
				index: newPageIndex,
				align: "start",
				behavior: scrollBehavior,
			});
			setPageIndex(newPageIndex);
		}
	}, [pageIndex, scrollBehavior]);

	const onNextPage = useCallback(() => {
		if (pageIndex < numPages - 1) {
			const newPageIndex = pageIndex + 1;
			listRef.current?.scrollToRow({
				index: newPageIndex,
				align: "start",
				behavior: scrollBehavior,
			});
			setPageIndex(newPageIndex);
		}
	}, [pageIndex, numPages, scrollBehavior]);

	const onChangeZoom = useCallback((value: string) => {
		if (value === "automatic") {
			setZoomConfig({ mode: "automatic", value: 1 });
		} else {
			setZoomConfig({ mode: "manual", value: Number.parseFloat(value) });
		}
	}, []);

	const getItemSize = useCallback(
		(index: number) => {
			if (pageDimensions[index]) {
				return pageDimensions[index].height + PAGE_MARGIN;
			}
			return 0;
		},
		[pageDimensions],
	);

	const onRowsRendered = useCallback(
		(visibleRows: { startIndex: number; stopIndex: number }) => {
			const prev = scrollPageRef.current;
			scrollPageRef.current = visibleRows.startIndex;
			if (visibleRows.startIndex !== prev) {
				setPageIndex(visibleRows.startIndex);
				onPositionChange?.(visibleRows.startIndex);
			}
		},
		[onPositionChange],
	);

	return (
		<>
			{file ? (
				<Document
					file={file}
					onLoadSuccess={onLoadSuccess}
					error={PDFErrorPage}
					loading={PDFLoadingPage}
				>
					{pageDimensions.length > 0 && pageDimensions.length === numPages && (
						<List
							listRef={listRef}
							rowCount={numPages}
							rowHeight={getItemSize}
							onRowsRendered={onRowsRendered}
							rowProps={{ scale: zoomConfig.value }}
							rowComponent={PDFPageRenderer}
						/>
					)}
				</Document>
			) : (
				<PDFLoadingPage />
			)}
			<PDFViewerControls
				pageIndex={pageIndex}
				numPages={numPages}
				onPrevPage={onPrevPage}
				onNextPage={onNextPage}
				zoomConfig={zoomConfig}
				onChangeZoom={onChangeZoom}
			/>
		</>
	);
});

/** Renderer descriptor for PDF files. Pass this to HyperJumpViewer's `renderers` prop. */
export const PdfRenderer: FileRenderer = {
	type: "pdf",
	extensions: ["pdf"],
	Component: PdfViewerComponent as React.ComponentType<
		RendererProps & Record<string, unknown>
	>,
};
