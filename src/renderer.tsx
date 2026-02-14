import { Page } from "react-pdf";
import type { RowComponentProps } from "react-window";
import PDFLoadingPage from "./loading-page";

interface RowProps {
	scale: number;
}

export default function PDFPageRenderer(props: RowComponentProps<RowProps>) {
	const { index, style, scale } = props;
	return (
		<div className="hj-page" style={style}>
			<Page pageIndex={index} scale={scale} loading={PDFLoadingPage} />
		</div>
	);
}
