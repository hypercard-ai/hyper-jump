import { useCallback, useRef, useState } from "react";

export function useElementSize<T extends HTMLElement = HTMLDivElement>() {
	const [size, setSize] = useState({ width: 0, height: 0 });
	const observerRef = useRef<ResizeObserver | null>(null);

	const ref = useCallback((node: T | null) => {
		if (observerRef.current) {
			observerRef.current.disconnect();
			observerRef.current = null;
		}

		if (node) {
			const observer = new ResizeObserver(([entry]) => {
				const { width, height } = entry.contentRect;
				setSize((prev) => {
					if (prev.width === width && prev.height === height) return prev;
					return { width, height };
				});
			});
			observer.observe(node);
			observerRef.current = observer;
		}
	}, []);

	return { ref, width: size.width, height: size.height };
}
