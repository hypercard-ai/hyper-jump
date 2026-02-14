import { Flex } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
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
import type { ZoomConfig } from "./types";
import { getPageDimensions } from "./utils";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
	"pdfjs-dist/build/pdf.worker.min.mjs",
	import.meta.url,
).toString();

const PAGE_MARGIN = 12;

export interface PDFViewerProps {
	selectedFile: {url: string},
	pendingPageJump: {page: number}
}

export function PDFViewer(props: PDFViewerProps) {
	const { selectedFile, pendingPageJump } = props;
	const [document, setDocument] = useState<PDFDocumentProxy>();
	const [pageIndex, setPageIndex] = useState(0);
	const [showSidebar, setShowSidebar] = useState(false);
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
			console.log("Calc dimensions");
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
			if (pendingPageJump) {
				setTimeout(() => {
					scrollToPage(pendingPageJump.page);
				}, 250);
			}
		},
		[scrollToPage, pendingPageJump],
	);

	useEffect(() => {
		if (pendingPageJump !== undefined) {
			listRef.current?.scrollToItem(pendingPageJump.page, "start");
			setPageIndex(pendingPageJump.page);
		}
	}, [pendingPageJump]);

	const file = useMemo(() => {
		return { url: selectedFile.url };
	}, [selectedFile]);

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

	const onToggleSidebar = useCallback(() => {
		setShowSidebar((prev) => !prev);
	}, []);

	const onChangeZoom = useCallback((value: string | null) => {
		if (value) {
			if (value === "automatic") {
				setZoomConfig({ mode: "automatic", value: 1 });
			} else {
				setZoomConfig({ mode: "manual", value: Number.parseFloat(value) });
			}
		}
	}, []);

	const getItemSize = useCallback(
		(index: number) => {
			// Ensure the dimension for the index exists before accessing it
			if (pageDimensions[index]) {
				return pageDimensions[index].height + PAGE_MARGIN;
			}
			return 0; // Default size if dimensions aren't calculated yet
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
		<Flex
			pos={"relative"}
			align={"center"}
			justify={"center"}
			h={"100%"}
			w={"100%"}
			ref={containerRef}
		>
			{file ? (
				<Document
					file={file}
					onLoadSuccess={onLoadSuccess}
					error={PDFErrorPage}
					loading={PDFLoadingPage}
				>
					{pageDimensions.length && pageDimensions.length === numPages && (
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
				onToggleSidebar={onToggleSidebar}
				showSidebar={showSidebar}
			/>
		</Flex>
	);
}
