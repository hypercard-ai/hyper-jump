import { fireEvent, render, screen } from "@testing-library/react";
import PDFViewerControls from "../src/viewer/controls";

const defaultProps = {
	pageIndex: 0,
	numPages: 10,
	zoomConfig: { mode: "automatic" as const, value: 1 },
	onPrevPage: vi.fn(),
	onNextPage: vi.fn(),
	onChangeZoom: vi.fn(),
};

function renderControls(overrides = {}) {
	const props = { ...defaultProps, ...overrides };
	return render(<PDFViewerControls {...props} />);
}

describe("PDFViewerControls", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("page indicator", () => {
		it("displays the current page and total pages", () => {
			renderControls({ pageIndex: 4, numPages: 20 });
			expect(screen.getByText("5 / 20")).toBeInTheDocument();
		});

		it("displays 1 / 1 for a single-page document", () => {
			renderControls({ pageIndex: 0, numPages: 1 });
			expect(screen.getByText("1 / 1")).toBeInTheDocument();
		});
	});

	describe("previous page button", () => {
		it("is disabled on the first page", () => {
			renderControls({ pageIndex: 0 });
			expect(screen.getByLabelText("Previous Page")).toBeDisabled();
		});

		it("is enabled when not on the first page", () => {
			renderControls({ pageIndex: 3 });
			expect(screen.getByLabelText("Previous Page")).toBeEnabled();
		});

		it("calls onPrevPage when clicked", () => {
			const onPrevPage = vi.fn();
			renderControls({ pageIndex: 3, onPrevPage });
			fireEvent.click(screen.getByLabelText("Previous Page"));
			expect(onPrevPage).toHaveBeenCalledOnce();
		});
	});

	describe("next page button", () => {
		it("is disabled on the last page", () => {
			renderControls({ pageIndex: 9, numPages: 10 });
			expect(screen.getByLabelText("Next Page")).toBeDisabled();
		});

		it("is enabled when not on the last page", () => {
			renderControls({ pageIndex: 0, numPages: 10 });
			expect(screen.getByLabelText("Next Page")).toBeEnabled();
		});

		it("calls onNextPage when clicked", () => {
			const onNextPage = vi.fn();
			renderControls({ pageIndex: 0, onNextPage });
			fireEvent.click(screen.getByLabelText("Next Page"));
			expect(onNextPage).toHaveBeenCalledOnce();
		});
	});

	describe("zoom select", () => {
		it("shows automatic when zoom mode is automatic", () => {
			renderControls({
				zoomConfig: { mode: "automatic", value: 1 },
			});
			const select = screen.getByLabelText("Zoom Level");
			expect(select).toHaveValue("automatic");
		});

		it("shows the manual value when zoom mode is manual", () => {
			renderControls({
				zoomConfig: { mode: "manual", value: 1.5 },
			});
			const select = screen.getByLabelText("Zoom Level");
			expect(select).toHaveValue("1.5");
		});

		it("calls onChangeZoom with the selected value", () => {
			const onChangeZoom = vi.fn();
			renderControls({ onChangeZoom });
			fireEvent.change(screen.getByLabelText("Zoom Level"), {
				target: { value: "2" },
			});
			expect(onChangeZoom).toHaveBeenCalledWith("2");
		});
	});
});
