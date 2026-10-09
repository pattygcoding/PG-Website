import React from "react";
import type { IconType } from "react-icons";

interface SocialIconProps {
	url: string;
	Icon: IconType;
	label: string;
}

export const SocialIcon = ({ url, Icon, label }: SocialIconProps) => {
	if (!url) return null;

	return (
		<li>
			<a href={url} target="_blank" rel="noopener noreferrer" aria-label={label}>
				<Icon aria-hidden="true" />
			</a>
		</li>
	);
};
