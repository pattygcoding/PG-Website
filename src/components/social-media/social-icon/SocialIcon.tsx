import React from "react";

export const SocialIcon = ({ url, Icon, label }) => {
	if (!url) return null;

	return (
		<li>
			<a href={url} target="_blank" rel="noopener noreferrer" aria-label={label}>
				<Icon aria-hidden="true" />
			</a>
		</li>
	);
};
