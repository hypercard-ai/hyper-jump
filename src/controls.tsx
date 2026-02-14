import type { ZoomConfig } from "./types";

const ZOOM_OPTIONS = [
	{ label: "Auto Width", value: "automatic" },
	{ label: "50%", value: "0.5" },
	{ label: "75%", value: "0.75" },
	{ label: "100%", value: "1" },
	{ label: "125%", value: "1.25" },
	{ label: "150%", value: "1.5" },
	{ label: "200%", value: "2" },
	{ label: "300%", value: "3" },
	{ label: "400%", value: "4" },
];

interface IProps {
	onChangeZoom(value: string): void;
	pageIndex: number;
	numPages: number;
	zoomConfig: ZoomConfig;
	onNextPage(): void;
	onPrevPage(): void;
}

function ChevronLeft() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<title>Previous Page</title>
			<path d="M15 18l-6-6 6-6" />
		</svg>
	);
}

function ChevronRight() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<title>Next Page</title>
			<path d="M9 18l6-6-6 6" />
		</svg>
	);
}

export default function PDFViewerControls(props: IProps) {
	const {
		onChangeZoom,
		pageIndex,
		numPages,
		zoomConfig,
		onNextPage,
		onPrevPage,
	} = props;

	const zoomValue =
		zoomConfig.mode === "automatic" || zoomConfig.mode === "page-width"
			? zoomConfig.mode
			: zoomConfig.value.toString();

	return (
		<div className="hj-controls">
			<div className="hj-controls-bar">
				<div className="hj-controls-group">
					<button
						type="button"
						className="hj-icon-btn"
						onClick={onPrevPage}
						disabled={pageIndex <= 0}
						aria-label="Previous Page"
					>
						<ChevronLeft />
					</button>
					<span className="hj-page-indicator">
						{pageIndex + 1} / {numPages}
					</span>
					<button
						type="button"
						className="hj-icon-btn"
						onClick={onNextPage}
						disabled={pageIndex >= numPages - 1}
						aria-label="Next Page"
					>
						<ChevronRight />
					</button>
				</div>
				<div className="hj-divider" />
				<select
					className="hj-select"
					value={zoomValue}
					onChange={(e) => onChangeZoom(e.target.value)}
					aria-label="Zoom Level"
				>
					{ZOOM_OPTIONS.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}
