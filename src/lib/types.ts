type ZoomMode = "automatic" | "page-width" | "manual";

export interface ZoomConfig {
	mode: ZoomMode;
	value: number; // Stores the manual zoom level
}

/** Props that the core viewer passes to every renderer. */
export interface RendererProps {
	url: string;
	containerWidth: number;
	containerHeight: number;
}

/** A renderer descriptor that tells the core viewer how to handle a file type. */
export interface FileRenderer {
	/** Unique identifier for this renderer type (e.g. "pdf", "video"). */
	type: string;
	/** File extensions this renderer handles, without dots (e.g. ["pdf"]). */
	extensions: string[];
	/** The component that renders the file. */
	Component: React.ComponentType<RendererProps & Record<string, unknown>>;
}
