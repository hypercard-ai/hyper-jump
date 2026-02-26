import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { FileRenderer, HyperJumpAPI, RendererProps } from "../lib/types";
import "./video-viewer.css";

export type HyperJumpVideoViewerAPI = HyperJumpAPI;

export interface HyperJumpVideoViewerProps extends RendererProps {
	/** Whether the video should autoplay (default: false). */
	autoPlay?: boolean;
}

const VideoViewerComponent = forwardRef<
	HyperJumpVideoViewerAPI,
	HyperJumpVideoViewerProps
>(function VideoViewerComponent(props, ref) {
	const { url, autoPlay = false, initialPosition, onPositionChange } = props;
	const videoRef = useRef<HTMLVideoElement>(null);
	const hasAppliedInitialPosition = useRef(false);

	useImperativeHandle(
		ref,
		() => ({
			jump: (position: number) => {
				if (videoRef.current) {
					videoRef.current.currentTime = position;
				}
			},
		}),
		[],
	);

	useEffect(() => {
		if (
			!hasAppliedInitialPosition.current &&
			initialPosition !== undefined &&
			videoRef.current
		) {
			hasAppliedInitialPosition.current = true;
			videoRef.current.currentTime = initialPosition;
		}
	}, [initialPosition]);

	return (
		<div className="hj-video">
			{/* biome-ignore lint/a11y/useMediaCaption: captions are the consumer's responsibility */}
			<video
				ref={videoRef}
				src={url}
				autoPlay={autoPlay}
				controls
				onTimeUpdate={() => {
					if (videoRef.current) {
						onPositionChange?.(videoRef.current.currentTime);
					}
				}}
			/>
		</div>
	);
});

/** Renderer descriptor for video files. Pass this to HyperJumpViewer's `renderers` prop. */
export const VideoRenderer: FileRenderer = {
	type: "video",
	extensions: ["mp4", "mov", "webm", "ogg"],
	Component: VideoViewerComponent as React.ComponentType<
		RendererProps & Record<string, unknown>
	>,
};
