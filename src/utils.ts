import type { PDFDocumentProxy } from "pdfjs-dist";
import { PAGE_HEIGHT, PAGE_WIDTH } from "./constants";

export async function getPageDimensions(
	document: PDFDocumentProxy,
	scale: number,
) {
	const dims = [];
	for (let i = 1; i <= document.numPages; i++) {
		try {
			const page = await document.getPage(i);
			const viewport = page.getViewport({ scale });
			const { height, width } = viewport;
			dims.push({ height, width });
		} catch (error) {
			console.error("Failed to get page dimensions", error);
			dims.push({
				width: PAGE_WIDTH,
				height: PAGE_HEIGHT,
			});
		}
	}
	return dims;
}
