import type { Meta, StoryObj } from "@storybook/react";
import { useRef, useState } from "react";
import { HyperJumpViewer, type HyperJumpViewerAPI } from "./viewer";

const meta = {
	title: "HyperJumpViewer/Playground",
	component: HyperJumpViewer,
} satisfies Meta<typeof HyperJumpViewer>;

export default meta;

const pdfs = [
	{ url: "/hypercard_ai_overview.pdf", label: "HyperCard AI Overview" },
	{ url: "/hyper-jump.pdf", label: "Hyper Jump" },
];

const citations = [
	{
		pdf: 0,
		page: 0,
		label: "Introduction",
		snippet: "Overview of HyperCard AI",
	},
	{
		pdf: 0,
		page: 1,
		label: "Architecture",
		snippet: "System design and components",
	},
	{
		pdf: 0,
		page: 2,
		label: "Features",
		snippet: "Key capabilities and integrations",
	},
	{
		pdf: 0,
		page: 3,
		label: "Data Flow",
		snippet: "How data moves through the system",
	},
	{
		pdf: 0,
		page: 4,
		label: "API Reference",
		snippet: "Endpoints and usage examples",
	},
	{
		pdf: 0,
		page: 5,
		label: "Deployment",
		snippet: "Infrastructure and scaling",
	},
	{
		pdf: 1,
		page: 0,
		label: "Hyper Jump Intro",
		snippet: "Getting started with Hyper Jump",
	},
	{
		pdf: 1,
		page: 1,
		label: "Hyper Jump Usage",
		snippet: "Component API and props",
	},
	{
		pdf: 1,
		page: 2,
		label: "Hyper Jump Internals",
		snippet: "Virtualized rendering details",
	},
];

export const CitationJumps: StoryObj<typeof meta> = {
	args: { url: "" },
	render: () => {
		const viewerRef = useRef<HyperJumpViewerAPI>(null);
		const [currentPage, setCurrentPage] = useState(0);
		const [activePdf, setActivePdf] = useState(0);

		const handleCitation = (pdfIndex: number, page: number) => {
			if (pdfIndex !== activePdf) {
				setActivePdf(pdfIndex);
				// jumpToPage will be stale after URL swap, so defer until next load
				setTimeout(() => viewerRef.current?.jumpToPage(page), 300);
			} else {
				viewerRef.current?.jumpToPage(page);
			}
		};

		return (
			<div style={{ display: "flex", height: "100vh", gap: 0 }}>
				<div
					style={{
						width: 280,
						flexShrink: 0,
						borderRight: "1px solid #e0e0e0",
						padding: 16,
						overflowY: "auto",
						fontFamily: "system-ui, sans-serif",
						fontSize: 14,
					}}
				>
					<h3 style={{ margin: "0 0 4px" }}>Citations</h3>
					<p style={{ margin: "0 0 12px", color: "#666", fontSize: 12 }}>
						Click to jump — citations span two PDFs
					</p>
					{citations.map((c, i) => {
						const isActive = activePdf === c.pdf && currentPage === c.page;
						const pdfColor = c.pdf === 0 ? "#2563eb" : "#9333ea";
						return (
							<button
								type="button"
								key={`${c.pdf}-${c.page}-${i}`}
								onClick={() => handleCitation(c.pdf, c.page)}
								style={{
									display: "block",
									width: "100%",
									textAlign: "left",
									padding: "10px 12px",
									marginBottom: 6,
									border: isActive
										? `1px solid ${pdfColor}`
										: "1px solid #e0e0e0",
									borderRadius: 6,
									background: isActive
										? c.pdf === 0
											? "#eff6ff"
											: "#faf5ff"
										: "#fff",
									cursor: "pointer",
									transition: "all 0.15s",
								}}
							>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: 6,
									}}
								>
									<span
										style={{
											fontSize: 10,
											padding: "1px 5px",
											borderRadius: 3,
											background: pdfColor,
											color: "#fff",
											flexShrink: 0,
										}}
									>
										{pdfs[c.pdf].label}
									</span>
									<span style={{ fontWeight: 600 }}>
										p. {c.page + 1} — {c.label}
									</span>
								</div>
								<div
									style={{
										color: "#666",
										fontSize: 12,
										marginTop: 2,
									}}
								>
									{c.snippet}
								</div>
							</button>
						);
					})}

					<hr
						style={{
							margin: "16px 0",
							border: "none",
							borderTop: "1px solid #e0e0e0",
						}}
					/>

					<h3 style={{ margin: "0 0 8px" }}>Jump to page</h3>
					<div style={{ display: "flex", gap: 6 }}>
						<input
							id="page-input"
							type="number"
							min={1}
							placeholder="Page #"
							style={{
								flex: 1,
								padding: "6px 8px",
								border: "1px solid #e0e0e0",
								borderRadius: 4,
								fontSize: 14,
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									const val = Number.parseInt(
										(e.target as HTMLInputElement).value,
										10,
									);
									if (!Number.isNaN(val)) {
										viewerRef.current?.jumpToPage(val - 1);
									}
								}
							}}
						/>
						<button
							type="button"
							onClick={() => {
								const input = document.getElementById(
									"page-input",
								) as HTMLInputElement;
								const val = Number.parseInt(input.value, 10);
								if (!Number.isNaN(val)) {
									viewerRef.current?.jumpToPage(val - 1);
								}
							}}
							style={{
								padding: "6px 12px",
								border: "1px solid #e0e0e0",
								borderRadius: 4,
								background: "#fff",
								cursor: "pointer",
								fontSize: 14,
							}}
						>
							Go
						</button>
					</div>

					<div
						style={{
							marginTop: 16,
							padding: "8px 12px",
							background: "#f5f5f5",
							borderRadius: 6,
							fontSize: 12,
							color: "#666",
						}}
					>
						Viewing: <strong>{pdfs[activePdf].label}</strong>
						<br />
						Current page: <strong>{currentPage + 1}</strong>
					</div>
				</div>

				<div style={{ flex: 1, minWidth: 0 }}>
					<HyperJumpViewer
						url={pdfs[activePdf].url}
						ref={viewerRef}
						onPageChange={setCurrentPage}
					/>
				</div>
			</div>
		);
	},
};

export const InitialPage: StoryObj<typeof meta> = {
	args: { url: "" },
	render: () => {
		const [currentPage, setCurrentPage] = useState<number | null>(null);

		return (
			<div style={{ height: "100vh", position: "relative" }}>
				<HyperJumpViewer
					url="/hypercard_ai_overview.pdf"
					initialPage={3}
					onPageChange={setCurrentPage}
				/>
				<div
					style={{
						position: "absolute",
						top: 8,
						right: 8,
						padding: "6px 12px",
						background: "rgba(0,0,0,0.7)",
						color: "#fff",
						borderRadius: 6,
						fontSize: 13,
						fontFamily: "system-ui, sans-serif",
					}}
				>
					initialPage=3 | current:{" "}
					{currentPage !== null ? currentPage + 1 : "..."}
				</div>
			</div>
		);
	},
};
