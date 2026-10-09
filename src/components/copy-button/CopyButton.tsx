import React, { useEffect, useRef, useState } from "react";
import "./CopyButton.css";

const CopyButton = ({ textToCopy }) => {
	const [copied, setCopied] = useState(false);
	const [status, setStatus] = useState("");
	const timeoutRef = useRef(null);

	useEffect(() => () => clearTimeout(timeoutRef.current), []);

	const handleCopy = async () => {
		clearTimeout(timeoutRef.current);
		setStatus("");
		try {
			await navigator.clipboard.writeText(textToCopy);
			setCopied(true);
			setStatus("Copied to clipboard.");
			timeoutRef.current = setTimeout(() => {
				setCopied(false);
				setStatus("");
			}, 1500);
		} catch {
			setCopied(false);
			setStatus("Unable to copy. Select the text and copy it manually.");
		}
	};

	return (
		<div className="copy-icon-wrapper">
			<button type="button" className="copy-icon-button" onClick={handleCopy} aria-label="Copy to clipboard">
				{copied ? (
					<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="limegreen" viewBox="0 0 24 24">
						<path d="M20.285 6.709l-11.002 11.002-5.568-5.568 1.414-1.414 4.154 4.154 9.588-9.588z"/>
					</svg>
				) : (
					<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
						<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 18H8V7h11v16z"/>
					</svg>
				)}
			</button>

			{copied && <div className="copied-tag">Copied!</div>}
			<span className="visually-hidden" role="status" aria-atomic="true" lang="en">{status}</span>
		</div>
	);
};

export default CopyButton;
