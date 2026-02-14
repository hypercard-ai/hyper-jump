import { Page } from "react-pdf";
import PDFLoadingPage from "./loading-page";

interface IProps {
	index: number;
	style: React.CSSProperties;
	data: { scale: number };
}

export default function PDFPageRenderer(props: IProps) {
	const { index, style, data } = props;
	const { scale } = data;
	return (
		<div className="hj-page" style={style}>
			<Page pageIndex={index} scale={scale} loading={PDFLoadingPage} />
		</div>
	);
}
