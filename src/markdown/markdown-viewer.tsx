import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import Markdown from "react-markdown";
import type { FileRenderer, HyperJumpAPI, RendererProps } from "../lib/types";
import "./markdown-viewer.css";

export type HyperJumpMarkdownViewerAPI = HyperJumpAPI;

export interface HyperJumpMarkdownViewerProps extends RendererProps {}

const MarkdownViewerComponent = forwardRef<
	HyperJumpMarkdownViewerAPI,
	HyperJumpMarkdownViewerProps
>(function MarkdownViewerComponent(props, ref) {
	const { url, initialPosition, onPositionChange } = props;
	const containerRef = useRef<HTMLDivElement>(null);
	const hasAppliedInitialPosition = useRef(false);
	const [content, setContent] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useImperativeHandle(
		ref,
		() => ({
			jump: (position: number) => {
				if (containerRef.current) {
					containerRef.current.scrollTop = position;
				}
			},
		}),
		[],
	);

	useEffect(() => {
		let cancelled = false;
		setContent(null);
		setError(null);
		hasAppliedInitialPosition.current = false;

		fetch(url)
			.then((res) => {
				if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
				return res.text();
			})
			.then((text) => {
				if (!cancelled) setContent(text);
			})
			.catch((err) => {
				if (!cancelled) setError(err.message);
			});

		return () => {
			cancelled = true;
		};
	}, [url]);

	useEffect(() => {
		if (
			!hasAppliedInitialPosition.current &&
			initialPosition !== undefined &&
			content !== null &&
			containerRef.current
		) {
			hasAppliedInitialPosition.current = true;
			containerRef.current.scrollTop = initialPosition;
		}
	}, [initialPosition, content]);

	const handleScroll = useCallback(() => {
		if (containerRef.current) {
			onPositionChange?.(containerRef.current.scrollTop);
		}
	}, [onPositionChange]);

	if (error) {
		return <div className="hj-markdown hj-markdown--error">{error}</div>;
	}

	if (content === null) {
		return <div className="hj-markdown hj-markdown--loading">Loading…</div>;
	}

	return (
		<div className="hj-markdown" ref={containerRef} onScroll={handleScroll}>
			<Markdown>{content}</Markdown>
		</div>
	);
});

export const MarkdownRenderer: FileRenderer = {
	type: "markdown",
	extensions: ["md", "markdown"],
	Component: MarkdownViewerComponent as React.ComponentType<
		RendererProps & Record<string, unknown>
	>,
};
