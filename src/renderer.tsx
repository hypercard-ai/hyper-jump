import { Flex } from "@mantine/core";
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
		<Flex style={style} align={"center"} justify={"center"}>
			<Page pageIndex={index} scale={scale} loading={PDFLoadingPage} />
		</Flex>
	);
}
