import type { PDFDocumentProxy } from "pdfjs-dist";
import {
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
import PDFViewerControls from "./controls";
import PDFErrorPage from "./error-page";
import PDFLoadingPage from "./loading-page";
import PDFPageRenderer from "./renderer";
import "./styles.css";
import type { ZoomConfig } from "./types";
import { useElementSize } from "./use-element-size";
import { getPageDimensions } from "./utils";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
	"pdfjs-dist/build/pdf.worker.min.mjs",
	import.meta.url,
).toString();

const PAGE_MARGIN = 12;

export interface HyperJumpViewerAPI {
	/** Imperatively scroll to a page (0-indexed). Clamps to valid range. */
	jumpToPage: (page: number) => void;
}

export type ScrollBehavior = "auto" | "instant" | "smooth";

export interface HyperJumpViewerProps {
	/** URL of the PDF file to display */
	url: string;
	/** Page to show when the document first loads (0-indexed) */
	initialPage?: number;
	/** Called when the visible page changes (0-indexed) */
	onPageChange?: (page: number) => void;
	/** Scroll behavior when navigating between pages (default: "instant") */
	scrollBehavior?: ScrollBehavior;
	/** Ref exposing imperative jumpToPage method */
	ref?: React.Ref<HyperJumpViewerAPI>;
}

export function HyperJumpViewer(props: HyperJumpViewerProps) {
	const {
		url,
		initialPage,
		onPageChange,
		scrollBehavior = "instant",
		ref,
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

	const { ref: containerRef } = useElementSize();
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

	useImperativeHandle(ref, () => ({ jumpToPage: scrollToPage }), [
		scrollToPage,
	]);

	const hasAppliedInitialPage = useRef(false);

	const onLoadSuccess: OnDocumentLoadSuccess = useCallback((response) => {
		hasAppliedInitialPage.current = false;
		setDocument(response);
	}, []);

	// Scroll to initialPage once when dimensions are first available.
	// Deferred by a frame so the List's scroll container is fully initialized.
	useEffect(() => {
		if (
			!hasAppliedInitialPage.current &&
			initialPage !== undefined &&
			pageDimensions.length === numPages &&
			numPages > 0
		) {
			hasAppliedInitialPage.current = true;
			const id = requestAnimationFrame(() => scrollToPage(initialPage));
			return () => cancelAnimationFrame(id);
		}
	}, [initialPage, pageDimensions, numPages, scrollToPage]);

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
				onPageChange?.(visibleRows.startIndex);
			}
		},
		[onPageChange],
	);

	return (
		<div className="hj-viewer" ref={containerRef}>
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
		</div>
	);
}
