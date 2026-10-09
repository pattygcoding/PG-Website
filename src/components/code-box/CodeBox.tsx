import React, { useState, useEffect } from "react";
import { CopyButton } from "@/components/copy-button";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-python";

import "./CodeBox.css";

const CodeBox = ({ initialCode, language, onCodeChange }) => {
	const [code, setCode] = useState(initialCode);

	useEffect(() => {
		if (onCodeChange) {
			onCodeChange(code);
		}
	}, [code, onCodeChange]);

	const highlight = (str) => {
		const grammar = Prism.languages[language] || Prism.languages.javascript;
		return Prism.highlight(str, grammar, language);
	};

	return (
		<div className="output-container">
			<CopyButton textToCopy={code} />
			<Editor
				value={code}
				onValueChange={setCode}
				highlight={highlight}
				padding={15}
				style={{
					backgroundColor: "var(--editor-bg)",
					color: "var(--editor-text)",
					border: "1px solid var(--editor-border)",
					fontFamily: "monospace",
					fontSize: 16,
					minHeight: "400px",
					borderRadius: "6px",
					overflowX: "auto",
					transition: "background-color 0.3s, color 0.3s, border-color 0.3s",
				}}
			/>
		</div>
	);
};

export default CodeBox;
