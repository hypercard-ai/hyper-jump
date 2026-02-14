import type { Meta, StoryObj } from "@storybook/react";
import { HyperJumpViewer } from "./viewer";

const meta = {
	title: "HyperJumpViewer",
	component: HyperJumpViewer,
} satisfies Meta<typeof HyperJumpViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		url: "https://pdfobject.com/pdf/sample.pdf",
	},
};

export const WithPage: Story = {
	args: {
		url: "https://pdfobject.com/pdf/sample.pdf",
		page: 3,
	},
};
