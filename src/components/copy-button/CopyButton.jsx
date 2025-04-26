import React, { useState } from "react";
import "./CopyButton.css";

const CopyButton = ({ textToCopy }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(textToCopy).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		});
	};

	return (
		<div className="copy-icon-wrapper">
			<button className="copy-icon-button" onClick={handleCopy} aria-label="Copy">
				{copied ? (
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="limegreen" viewBox="0 0 24 24">
						<path d="M20.285 6.709l-11.002 11.002-5.568-5.568 1.414-1.414 4.154 4.154 9.588-9.588z"/>
					</svg>
				) : (
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
						<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 18H8V7h11v16z"/>
					</svg>
				)}
			</button>

			{copied && <div className="copied-tag">Copied!</div>}
		</div>
	);
};

export default CopyButton;
