import { Center, Stack, Text } from "@mantine/core";
import { PAGE_HEIGHT, PAGE_WIDTH } from "./constants";

export default function PDFErrorPage() {
	return (
		<Center bg={"#fff"} h={PAGE_HEIGHT} w={PAGE_WIDTH}>
			<Stack justify="center">
				<Text>{"Error loading file"}</Text>
			</Stack>
		</Center>
	);
}
