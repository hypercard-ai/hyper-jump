import { Center, Loader } from "@mantine/core";
import { PAGE_HEIGHT, PAGE_WIDTH } from "./constants";

export default function PDFLoadingPage() {
	return (
		<Center bg={"#fff"} h={PAGE_HEIGHT} w={PAGE_WIDTH} pos={"relative"}>
			<Loader />
		</Center>
	);
}
