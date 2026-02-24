import { useMemo } from "react";
import type { FileRenderer } from "../lib/types";
import { useElementSize } from "../lib/use-element-size";
import "./viewer.css";

export interface HyperJumpViewerProps {
	/** URL of the file to display */
	url: string;
	/** Explicit file type override (e.g. "pdf", "video"). If omitted, detected from URL extension. */
	type?: string;
	/** Renderers that this viewer can use. The first matching renderer wins. */
	renderers: FileRenderer[];
	/** Ref forwarded to the active renderer (e.g. for imperative APIs like jump). */
	ref?: React.Ref<unknown>;
	/** All other props are forwarded to the matched renderer. */
	[key: string]: unknown;
}

function getExtension(url: string): string | null {
	try {
		const pathname = new URL(url, "https://placeholder.com").pathname;
		const dot = pathname.lastIndexOf(".");
		if (dot === -1) return null;
		return pathname.slice(dot + 1).toLowerCase();
	} catch {
		return null;
	}
}

export function HyperJumpViewer(props: HyperJumpViewerProps) {
	const { url, type, renderers, ref, ...rest } = props;

	const {
		ref: containerRef,
		width: containerWidth,
		height: containerHeight,
	} = useElementSize();

	const renderer = useMemo(() => {
		const ext = type ?? getExtension(url);
		if (!ext) return null;
		return renderers.find((r) => r.type === ext || r.extensions.includes(ext));
	}, [url, type, renderers]);

	return (
		<div className="hj-viewer" ref={containerRef}>
			{renderer ? (
				<renderer.Component
					ref={ref}
					url={url}
					containerWidth={containerWidth}
					containerHeight={containerHeight}
					{...rest}
				/>
			) : (
				<div className="hj-error">Unsupported file type</div>
			)}
		</div>
	);
}
