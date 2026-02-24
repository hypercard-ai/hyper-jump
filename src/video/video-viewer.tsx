import {
	MediaPlayer,
	type MediaPlayerInstance,
	MediaProvider,
} from "@vidstack/react";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { FileRenderer, HyperJumpAPI, RendererProps } from "../lib/types";
import "./video-viewer.css";

export type HyperJumpVideoViewerAPI = HyperJumpAPI;

export interface HyperJumpVideoViewerProps extends RendererProps {
	/** Video title shown by the player. */
	title?: string;
	/** Whether the video should autoplay (default: false). */
	autoPlay?: boolean;
	/** Time in seconds to start playback at. */
	initialPosition?: number;
	/** Called on each time update with the current time in seconds. */
	onPositionChange?: (position: number) => void;
}

const VideoViewerComponent = forwardRef<
	HyperJumpVideoViewerAPI,
	HyperJumpVideoViewerProps
>(function VideoViewerComponent(props, ref) {
	const {
		url,
		title,
		autoPlay = false,
		initialPosition,
		onPositionChange,
	} = props;
	const playerRef = useRef<MediaPlayerInstance>(null);
	const hasAppliedInitialPosition = useRef(false);

	useImperativeHandle(
		ref,
		() => ({
			jump: (position: number) => {
				if (playerRef.current) {
					playerRef.current.currentTime = position;
				}
			},
		}),
		[],
	);

	useEffect(() => {
		if (
			!hasAppliedInitialPosition.current &&
			initialPosition !== undefined &&
			playerRef.current
		) {
			hasAppliedInitialPosition.current = true;
			playerRef.current.currentTime = initialPosition;
		}
	}, [initialPosition]);

	return (
		<div className="hj-video">
			<MediaPlayer
				ref={playerRef}
				src={url}
				title={title ?? ""}
				autoPlay={autoPlay}
				controls
				onTimeUpdate={(detail) => {
					onPositionChange?.(detail.currentTime);
				}}
			>
				<MediaProvider />
			</MediaPlayer>
		</div>
	);
});

/** Renderer descriptor for video files. Pass this to HyperJumpViewer's `renderers` prop. */
export const VideoRenderer: FileRenderer = {
	type: "video",
	extensions: ["mp4", "mov", "webm", "ogg", "m3u8"],
	Component: VideoViewerComponent as React.ComponentType<
		RendererProps & Record<string, unknown>
	>,
};
