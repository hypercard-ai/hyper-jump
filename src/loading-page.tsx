import { PAGE_HEIGHT, PAGE_WIDTH } from "./constants";

export default function PDFLoadingPage() {
	return (
		<div
			className="hj-loading"
			style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }}
		>
			<div className="hj-spinner" />
		</div>
	);
}
