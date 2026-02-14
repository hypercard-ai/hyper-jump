import type { PDFDocumentProxy } from "pdfjs-dist";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import type { OnDocumentLoadSuccess } from "react-pdf/dist/shared/types.js";
import { type ListOnItemsRenderedProps, VariableSizeList } from "react-window";
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
}

export function HyperJumpViewer(props: HyperJumpViewerProps) {
	const { url, page } = props;
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

	const {
		ref: containerRef,
		width: containerWidth,
		height: containerHeight,
	} = useElementSize();
	const listRef = useRef<VariableSizeList>(null);

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

	useEffect(() => {
		if (listRef.current && pageDimensions.length > 0) {
			listRef.current.resetAfterIndex(0);
		}
	}, [pageDimensions]);

	const scrollToPage = useCallback((index: number) => {
		listRef.current?.scrollToItem(index, "start");
		setPageIndex(index);
	}, []);

	const onLoadSuccess: OnDocumentLoadSuccess = useCallback(
		(response) => {
			setDocument(response);
			if (page !== undefined) {
				setTimeout(() => {
					scrollToPage(page);
				}, 250);
			}
		},
		[scrollToPage, page],
	);

	useEffect(() => {
		if (page !== undefined) {
			listRef.current?.scrollToItem(page, "start");
			setPageIndex(page);
		}
	}, [page]);

	const file = useMemo(() => {
		return { url };
	}, [url]);

	const onPrevPage = useCallback(() => {
		if (pageIndex > 0) {
			const newPageIndex = pageIndex - 1;
			listRef.current?.scrollToItem(newPageIndex, "start");
			setPageIndex(newPageIndex);
		}
	}, [pageIndex]);

	const onNextPage = useCallback(() => {
		if (pageIndex < numPages - 1) {
			const newPageIndex = pageIndex + 1;
			listRef.current?.scrollToItem(newPageIndex, "start");
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

	const onItemsRendered = useCallback(
		({ visibleStartIndex }: ListOnItemsRenderedProps) => {
			scrollPageRef.current = visibleStartIndex;
		},
		[],
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
						<VariableSizeList
							ref={listRef}
							height={containerHeight}
							width={containerWidth}
							itemCount={numPages}
							itemSize={getItemSize}
							onItemsRendered={onItemsRendered}
							itemData={{ scale: zoomConfig.value }}
						>
							{PDFPageRenderer}
						</VariableSizeList>
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
