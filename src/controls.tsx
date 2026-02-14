import {
	ActionIcon,
	Button,
	Divider,
	Flex,
	Paper,
	Select,
	Text,
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import type { ZoomConfig } from "./types";

interface IProps {
	showSidebar: boolean;
	onToggleSidebar(): void;
	onChangeZoom(value: string | null): void;
	pageIndex: number;
	numPages: number;
	zoomConfig: ZoomConfig;
	onNextPage(): void;
	onPrevPage(): void;
}

export default function PDFViewerControls(props: IProps) {
	const {
		showSidebar,
		onToggleSidebar,
		onChangeZoom,
		pageIndex,
		numPages,
		zoomConfig,
		onNextPage,
		onPrevPage,
	} = props;
	return (
		<Flex
			pos={"absolute"}
			justify={"center"}
			align={"center"}
			bottom={12}
			left={12}
			right={12}
			style={{ zIndex: 10 }}
		>
			<Paper shadow="md" radius={"md"} p="xs" withBorder>
				<Flex align="center" gap="md">
					<Button
						size="xs"
						variant="default"
						onClick={onToggleSidebar}
						disabled
					>
						{`${showSidebar ? "Hide" : "Show"} Contents`}
					</Button>
					<Divider orientation="vertical" />
					<Flex align="center" gap={6}>
						<ActionIcon
							size="md"
							variant="default"
							onClick={onPrevPage}
							disabled={pageIndex <= 0}
							aria-label="Previous Page"
						>
							<IconChevronLeft size="1rem" />
						</ActionIcon>
						<Text size="sm" style={{ minWidth: "50px", textAlign: "center" }}>
							{pageIndex + 1} / {numPages}
						</Text>
						<ActionIcon
							size="md"
							variant="default"
							onClick={onNextPage}
							disabled={pageIndex >= numPages + 1}
							aria-label="Next Page"
						>
							<IconChevronRight size="1rem" />
						</ActionIcon>
					</Flex>
					<Divider orientation="vertical" />
					<Flex gap={4} align={"center"}>
						<Select
							size="xs"
							w={130}
							data={[
								{ label: "Auto Width", value: "automatic" },
								{ label: "50%", value: "0.5" },
								{ label: "75%", value: "0.75" },
								{ label: "100%", value: "1" },
								{ label: "125%", value: "1.25" },
								{ label: "150%", value: "1.5" },
								{ label: "200%", value: "2" },
								{ label: "300%", value: "3" },
								{ label: "400%", value: "4" },
							]}
							onChange={onChangeZoom}
							value={
								zoomConfig.mode === "automatic" ||
								zoomConfig.mode === "page-width"
									? zoomConfig.mode
									: zoomConfig.value.toString()
							}
							aria-label="Zoom Level"
						/>
					</Flex>
				</Flex>
			</Paper>
		</Flex>
	);
}
