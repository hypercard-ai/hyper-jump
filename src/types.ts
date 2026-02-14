type ZoomMode = "automatic" | "page-width" | "manual";

export interface ZoomConfig {
	mode: ZoomMode;
	value: number; // Stores the manual zoom level
}