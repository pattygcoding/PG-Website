import React, { useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Container, Form, Button } from "react-bootstrap";
import { PageTitle } from "@/components/page-title";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import { CodeBox } from "@/components/code-box";
import l from "@/assets/links/links.json";
import yaml from "js-yaml";
import "./Formatter.css";

const detectFormat = (input) => {
	const trimmed = input.trim();
	if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "json";
	return "yaml";
};

const lintJSON = (input) => {
	try {
		const parsed = JSON.parse(input);
		return { valid: true, formatted: JSON.stringify(parsed, null, 4), error: null, warning: null };
	} catch (err) {
		return { valid: false, formatted: null, error: err.message, warning: null };
	}
};

const isSpacingOnlyError = (input) => {
	try {
		// Strip all leading whitespace from each line and re-join
		const stripped = input
			.split("\n")
			.map((line) => line.trimStart())
			.join("\n");
		const parsed = yaml.load(stripped);
		if (parsed === undefined || parsed === null) return null;
		return parsed;
	} catch {
		return null;
	}
};

const lintYAML = (input) => {
	try {
		const parsed = yaml.load(input);
		const formatted = yaml.dump(parsed, { indent: 2, lineWidth: -1, noRefs: true });
		return { valid: true, formatted, error: null, warning: null };
	} catch (err) {
		// Check if it's only a spacing/indentation issue
		const fixedParsed = isSpacingOnlyError(input);
		if (fixedParsed !== null) {
			const formatted = yaml.dump(fixedParsed, { indent: 2, lineWidth: -1, noRefs: true });
			return { valid: true, formatted, error: null, warning: err.message };
		}
		return { valid: false, formatted: null, error: err.message, warning: null };
	}
};

const Formatter = () => {
	const { t } = useLang();

	const [input, setInput] = useState("");
	const [formatMode, setFormatMode] = useState("auto");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [warning, setWarning] = useState("");

	const handleFormat = () => {
		if (!input.trim()) {
			setError(t("formatter.empty_input"));
			setSuccess("");
			setWarning("");
			return;
		}

		if (input.length > 1000000) {
			setError(t("formatter.too_large"));
			setSuccess("");
			setWarning("");
			return;
		}

		setError("");
		setSuccess("");
		setWarning("");

		const mode = formatMode === "auto" ? detectFormat(input) : formatMode;
		const result = mode === "json" ? lintJSON(input) : lintYAML(input);

		if (result.valid) {
			setInput(result.formatted);
			if (result.warning) {
				setWarning(t("formatter.fixed_yaml_spacing"));
			} else {
				setSuccess(
					mode === "json"
						? t("formatter.valid_json")
						: t("formatter.valid_yaml")
				);
			}
		} else {
			setError(
				(mode === "json"
					? t("formatter.invalid_json")
					: t("formatter.invalid_yaml")) +
				": " +
				result.error
			);
		}
	};

	return (
		<HelmetProvider>
			<Container>
				<Tab title={t("formatter.title")} />
				<PageTitle title={t("formatter.title")} />

				<p>{t("formatter.description")}</p>
				<p>
					{t("formatter.more_info1")}{" "}
					<a href={l.formatter} target="_blank" rel="noopener noreferrer">
						{t("formatter.more_info2")}
					</a>.
				</p>

				<Form.Group className="mt-4">
					<Form.Label>{t("formatter.format_as")}</Form.Label>
					<Form.Select value={formatMode} onChange={(e) => setFormatMode(e.target.value)}>
						<option value="auto">{t("formatter.auto_detect")}</option>
						<option value="json">JSON</option>
						<option value="yaml">YAML</option>
					</Form.Select>
				</Form.Group>

				{error && (
					<div className="text-danger mt-2" style={{ fontWeight: "bold" }}>
						{error}
					</div>
				)}

				{warning && (
					<div className="text-warning mt-2" style={{ fontWeight: "bold" }}>
						{warning}
					</div>
				)}

				{success && (
					<div className="text-success mt-2" style={{ fontWeight: "bold" }}>
						{success}
					</div>
				)}

				<div className="mt-4">
					<CodeBox
						initialCode={input}
						language={formatMode === "yaml" ? "yaml" : "json"}
						onCodeChange={setInput}
					/>
				</div>

				<Button className="mt-4" onClick={handleFormat}>
					{t("formatter.format")}
				</Button>

			</Container>
		</HelmetProvider>
	);
};

export default Formatter;
