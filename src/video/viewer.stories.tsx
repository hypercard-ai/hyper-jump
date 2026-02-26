import type { Meta, StoryObj } from "@storybook/react";
import { type ReactNode, useRef, useState } from "react";
import { HyperJumpViewer } from "../viewer/viewer";
import { type HyperJumpVideoViewerAPI, VideoRenderer } from "./video-viewer";

const meta = {
	title: "HyperJumpViewer/Video",
	component: HyperJumpViewer,
} satisfies Meta<typeof HyperJumpViewer>;

export default meta;

function Container(props: { children: ReactNode }) {
	return (
		<div style={{ height: "90vh", width: "90vw", backgroundColor: "#f1f3f5" }}>
			{props.children}
		</div>
	);
}

const SAMPLE_VIDEO =
	"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export const Playground: StoryObj<typeof meta> = {
	args: { url: SAMPLE_VIDEO, renderers: [VideoRenderer] },
	render: () => {
		const viewerRef = useRef<HyperJumpVideoViewerAPI>(null);
		const [currentTime, setCurrentTime] = useState(0);

		const seekPoints = [
			{ label: "Start", time: 0 },
			{ label: "30s", time: 30 },
			{ label: "1m", time: 60 },
			{ label: "2m", time: 120 },
		];

		return (
			<Container>
				<div style={{ display: "flex", height: "90vh", width: "100%", gap: 0 }}>
					<div
						style={{
							width: 240,
							flexShrink: 0,
							borderRight: "1px solid #e0e0e0",
							padding: 16,
							overflowY: "auto",
							fontFamily: "system-ui, sans-serif",
							fontSize: 14,
						}}
					>
						<h3 style={{ margin: "0 0 4px" }}>Seek Points</h3>
						<p style={{ margin: "0 0 12px", color: "#666", fontSize: 12 }}>
							Click to jump to a timestamp
						</p>
						{seekPoints.map((point) => (
							<button
								type="button"
								key={point.time}
								onClick={() => viewerRef.current?.jump(point.time)}
								style={{
									display: "block",
									width: "100%",
									textAlign: "left",
									padding: "10px 12px",
									marginBottom: 6,
									border: "1px solid #e0e0e0",
									borderRadius: 6,
									background: "#fff",
									cursor: "pointer",
									transition: "all 0.15s",
									fontWeight: 600,
								}}
							>
								{point.label}
							</button>
						))}

						<hr
							style={{
								margin: "16px 0",
								border: "none",
								borderTop: "1px solid #e0e0e0",
							}}
						/>

						<h3 style={{ margin: "0 0 8px" }}>Seek to time</h3>
						<div style={{ display: "flex", gap: 6 }}>
							<input
								id="time-input"
								type="number"
								min={0}
								placeholder="Seconds"
								style={{
									flex: 1,
									padding: "6px 8px",
									border: "1px solid #e0e0e0",
									borderRadius: 4,
									fontSize: 14,
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										const val = Number.parseFloat(
											(e.target as HTMLInputElement).value,
										);
										if (!Number.isNaN(val)) {
											viewerRef.current?.jump(val);
										}
									}
								}}
							/>
							<button
								type="button"
								onClick={() => {
									const input = document.getElementById(
										"time-input",
									) as HTMLInputElement;
									const val = Number.parseFloat(input.value);
									if (!Number.isNaN(val)) {
										viewerRef.current?.jump(val);
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
							Current time: <strong>{currentTime.toFixed(1)}s</strong>
						</div>
					</div>

					<div style={{ flex: 1, minWidth: 0 }}>
						<HyperJumpViewer
							url={SAMPLE_VIDEO}
							renderers={[VideoRenderer]}
							ref={viewerRef}
							onPositionChange={setCurrentTime}
						/>
					</div>
				</div>
			</Container>
		);
	},
};
