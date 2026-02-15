import type { PDFDocumentProxy } from "pdfjs-dist";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

export interface HyperJumpViewerProps {
	/** URL of the PDF file to display */
	url: string;
	/** Page number to jump to (0-indexed) */
	page?: number;
	/** Called when the visible page changes (0-indexed) */
	onPageChange?: (page: number) => void;
}

export function HyperJumpViewer(props: HyperJumpViewerProps) {
	const { url, page, onPageChange } = props;
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

	const scrollToPage = useCallback((index: number) => {
		listRef.current?.scrollToRow({ index, align: "start" });
		setPageIndex(index);
	}, []);

	const onLoadSuccess: OnDocumentLoadSuccess = useCallback((response) => {
		setDocument(response);
	}, []);

	useEffect(() => {
		if (
			page !== undefined &&
			pageDimensions.length === numPages &&
			numPages > 0
		) {
			const clamped = Math.max(0, Math.min(Math.floor(page), numPages - 1));
			scrollToPage(clamped);
		}
	}, [page, pageDimensions, numPages, scrollToPage]);

	const file = useMemo(() => {
		return { url };
	}, [url]);

	const onPrevPage = useCallback(() => {
		if (pageIndex > 0) {
			const newPageIndex = pageIndex - 1;
			listRef.current?.scrollToRow({ index: newPageIndex, align: "start" });
			setPageIndex(newPageIndex);
		}
	}, [pageIndex]);

	const onNextPage = useCallback(() => {
		if (pageIndex < numPages - 1) {
			const newPageIndex = pageIndex + 1;
			listRef.current?.scrollToRow({ index: newPageIndex, align: "start" });
			setPageIndex(newPageIndex);
		}
	}, [pageIndex, numPages]);

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
