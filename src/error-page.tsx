import { PAGE_HEIGHT, PAGE_WIDTH } from "./constants";

export default function PDFErrorPage() {
	return (
		<div
			className="hj-error"
			style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }}
		>
			Error loading file
		</div>
	);
}
