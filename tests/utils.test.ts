import type { PDFDocumentProxy } from "pdfjs-dist";
import { PAGE_HEIGHT, PAGE_WIDTH } from "../src/constants";
import { getPageDimensions } from "../src/utils";

function mockDocument(
	pages: { width: number; height: number }[],
): PDFDocumentProxy {
	return {
		numPages: pages.length,
		getPage: vi.fn((pageNum: number) =>
			Promise.resolve({
				getViewport: ({ scale }: { scale: number }) => ({
					width: pages[pageNum - 1].width * scale,
					height: pages[pageNum - 1].height * scale,
				}),
			}),
		),
	} as unknown as PDFDocumentProxy;
}

describe("getPageDimensions", () => {
	it("returns dimensions for all pages at scale 1", async () => {
		const doc = mockDocument([
			{ width: 595, height: 842 },
			{ width: 595, height: 842 },
		]);

		const dims = await getPageDimensions(doc, 1);

		expect(dims).toEqual([
			{ width: 595, height: 842 },
			{ width: 595, height: 842 },
		]);
		expect(doc.getPage).toHaveBeenCalledTimes(2);
	});

	it("applies scale to dimensions", async () => {
		const doc = mockDocument([{ width: 600, height: 800 }]);

		const dims = await getPageDimensions(doc, 2);

		expect(dims).toEqual([{ width: 1200, height: 1600 }]);
	});

	it("handles pages with different sizes", async () => {
		const doc = mockDocument([
			{ width: 595, height: 842 },
			{ width: 1190, height: 842 },
		]);

		const dims = await getPageDimensions(doc, 1);

		expect(dims[0].width).toBe(595);
		expect(dims[1].width).toBe(1190);
	});

	it("falls back to default dimensions when getPage fails", async () => {
		const doc = {
			numPages: 2,
			getPage: vi.fn((pageNum: number) => {
				if (pageNum === 1) return Promise.reject(new Error("corrupt page"));
				return Promise.resolve({
					getViewport: ({ scale }: { scale: number }) => ({
						width: 595 * scale,
						height: 842 * scale,
					}),
				});
			}),
		} as unknown as PDFDocumentProxy;

		const dims = await getPageDimensions(doc, 1);

		expect(dims[0]).toEqual({ width: PAGE_WIDTH, height: PAGE_HEIGHT });
		expect(dims[1]).toEqual({ width: 595, height: 842 });
	});

	it("returns empty array for a zero-page document", async () => {
		const doc = mockDocument([]);
		const dims = await getPageDimensions(doc, 1);
		expect(dims).toEqual([]);
	});
});
