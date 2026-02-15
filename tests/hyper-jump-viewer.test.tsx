import { act, fireEvent, render, screen } from "@testing-library/react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { HyperJumpViewer } from "../src";

// Track the most recent scrollToRow call
const scrollToRow = vi.fn();

// Capture onRowsRendered so tests can simulate scroll events
let capturedOnRowsRendered: (visibleRows: {
	startIndex: number;
	stopIndex: number;
}) => void;

vi.mock("react-pdf", () => {
	const mockGetPage = (_pageNum: number) =>
		Promise.resolve({
			getViewport: ({ scale }: { scale: number }) => ({
				width: 595 * scale,
				height: 842 * scale,
			}),
		});

	return {
		Document: ({
			children,
			onLoadSuccess,
		}: {
			children: React.ReactNode;
			onLoadSuccess: (doc: PDFDocumentProxy) => void;
			file: { url: string };
			error: React.ComponentType;
			loading: React.ComponentType;
		}) => {
			// Trigger onLoadSuccess on first render
			setTimeout(() => {
				onLoadSuccess({
					numPages: 5,
					getPage: mockGetPage,
				} as unknown as PDFDocumentProxy);
			}, 0);
			return <div data-testid="pdf-document">{children}</div>;
		},
		Page: ({ pageIndex, scale }: { pageIndex: number; scale: number }) => (
			<div data-testid={`pdf-page-${pageIndex}`} data-scale={scale} />
		),
		pdfjs: {
			GlobalWorkerOptions: { workerSrc: "" },
		},
	};
});

vi.mock("react-window", () => ({
	List: ({
		rowCount,
		rowComponent: RowComponent,
		rowProps,
		listRef,
		onRowsRendered,
	}: {
		rowCount: number;
		rowComponent: React.ComponentType<{
			index: number;
			style: React.CSSProperties;
			scale: number;
		}>;
		rowProps: { scale: number };
		listRef: React.MutableRefObject<{ scrollToRow: typeof scrollToRow }>;
		onRowsRendered: (visibleRows: {
			startIndex: number;
			stopIndex: number;
		}) => void;
		rowHeight: (index: number) => number;
		style: React.CSSProperties;
	}) => {
		// Expose imperative API
		if (listRef) {
			listRef.current = { scrollToRow };
		}
		// Capture onRowsRendered for test use
		capturedOnRowsRendered = onRowsRendered;

		// Render first 3 rows to simulate virtualization
		const rows = [];
		for (let i = 0; i < Math.min(rowCount, 3); i++) {
			rows.push(
				<RowComponent
					key={i}
					index={i}
					style={{ height: 842 }}
					scale={rowProps.scale}
				/>,
			);
		}
		return <div data-testid="virtual-list">{rows}</div>;
	},
}));

describe("HyperJumpViewer", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders the document and controls", async () => {
		await act(async () => {
			render(<HyperJumpViewer url="test.pdf" />);
		});

		// Wait for async page dimension loading
		await act(async () => {
			await new Promise((r) => setTimeout(r, 50));
		});

		expect(screen.getByTestId("pdf-document")).toBeInTheDocument();
		expect(screen.getByLabelText("Previous Page")).toBeInTheDocument();
		expect(screen.getByLabelText("Next Page")).toBeInTheDocument();
		expect(screen.getByLabelText("Zoom Level")).toBeInTheDocument();
	});

	it("renders the virtual list after document loads", async () => {
		await act(async () => {
			render(<HyperJumpViewer url="test.pdf" />);
		});

		await act(async () => {
			await new Promise((r) => setTimeout(r, 50));
		});

		expect(screen.getByTestId("virtual-list")).toBeInTheDocument();
		expect(screen.getByTestId("pdf-page-0")).toBeInTheDocument();
	});

	it("shows page 1 / 5 initially", async () => {
		await act(async () => {
			render(<HyperJumpViewer url="test.pdf" />);
		});

		await act(async () => {
			await new Promise((r) => setTimeout(r, 50));
		});

		expect(screen.getByText("1 / 5")).toBeInTheDocument();
	});

	it("scrolls to the specified page when page prop is provided", async () => {
		await act(async () => {
			render(<HyperJumpViewer url="test.pdf" page={3} />);
		});

		await act(async () => {
			await new Promise((r) => setTimeout(r, 50));
		});

		expect(scrollToRow).toHaveBeenCalledWith({ index: 3, align: "start" });
	});

	it("scrolls when the page prop changes", async () => {
		const { rerender } = await act(async () =>
			render(<HyperJumpViewer url="test.pdf" page={0} />),
		);

		await act(async () => {
			await new Promise((r) => setTimeout(r, 50));
		});

		scrollToRow.mockClear();

		await act(async () => {
			rerender(<HyperJumpViewer url="test.pdf" page={4} />);
		});

		expect(scrollToRow).toHaveBeenCalledWith({ index: 4, align: "start" });
	});

	it("calls onPageChange when the visible page changes via scroll", async () => {
		const onPageChange = vi.fn();

		await act(async () => {
			render(<HyperJumpViewer url="test.pdf" onPageChange={onPageChange} />);
		});

		await act(async () => {
			await new Promise((r) => setTimeout(r, 50));
		});

		// Simulate scrolling to page 2
		act(() => {
			capturedOnRowsRendered({ startIndex: 2, stopIndex: 3 });
		});

		expect(onPageChange).toHaveBeenCalledWith(2);
		expect(screen.getByText("3 / 5")).toBeInTheDocument();
	});

	it("does not call onPageChange when the page stays the same", async () => {
		const onPageChange = vi.fn();

		await act(async () => {
			render(<HyperJumpViewer url="test.pdf" onPageChange={onPageChange} />);
		});

		await act(async () => {
			await new Promise((r) => setTimeout(r, 50));
		});

		onPageChange.mockClear();

		// Simulate scroll event with same startIndex
		act(() => {
			capturedOnRowsRendered({ startIndex: 0, stopIndex: 1 });
		});

		expect(onPageChange).not.toHaveBeenCalled();
	});

	it("navigates with prev/next buttons", async () => {
		await act(async () => {
			render(<HyperJumpViewer url="test.pdf" />);
		});

		await act(async () => {
			await new Promise((r) => setTimeout(r, 50));
		});

		// Initially on page 0, prev should be disabled
		expect(screen.getByLabelText("Previous Page")).toBeDisabled();

		// Click next
		scrollToRow.mockClear();
		await act(async () => {
			fireEvent.click(screen.getByLabelText("Next Page"));
		});

		expect(scrollToRow).toHaveBeenCalledWith({ index: 1, align: "start" });
		expect(screen.getByText("2 / 5")).toBeInTheDocument();
	});

	it("clamps page prop that exceeds numPages to the last page", async () => {
		await act(async () => {
			render(<HyperJumpViewer url="test.pdf" page={100} />);
		});

		await act(async () => {
			await new Promise((r) => setTimeout(r, 50));
		});

		expect(scrollToRow).toHaveBeenCalledWith({ index: 4, align: "start" });
	});

	it("clamps negative page prop to 0", async () => {
		await act(async () => {
			render(<HyperJumpViewer url="test.pdf" page={-5} />);
		});

		await act(async () => {
			await new Promise((r) => setTimeout(r, 50));
		});

		expect(scrollToRow).toHaveBeenCalledWith({ index: 0, align: "start" });
	});

	it("floors fractional page prop values", async () => {
		await act(async () => {
			render(<HyperJumpViewer url="test.pdf" page={2.7} />);
		});

		await act(async () => {
			await new Promise((r) => setTimeout(r, 50));
		});

		expect(scrollToRow).toHaveBeenCalledWith({ index: 2, align: "start" });
	});

	it("changes zoom level via the select", async () => {
		await act(async () => {
			render(<HyperJumpViewer url="test.pdf" />);
		});

		await act(async () => {
			await new Promise((r) => setTimeout(r, 50));
		});

		await act(async () => {
			fireEvent.change(screen.getByLabelText("Zoom Level"), {
				target: { value: "2" },
			});
		});

		// After zoom change, page dimensions recalculate and list re-renders
		await act(async () => {
			await new Promise((r) => setTimeout(r, 50));
		});

		// Pages should now render at scale 2
		const page = screen.getByTestId("pdf-page-0");
		expect(page).toHaveAttribute("data-scale", "2");
	});
});
