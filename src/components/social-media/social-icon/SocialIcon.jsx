import React from "react";

export const SocialIcon = ({ url, Icon }) => {
	if (!url) return null;

	return (
		<li>
			<a href={url} target="_blank" rel="noopener noreferrer">
				<Icon />
			</a>
		</li>
	);
};
