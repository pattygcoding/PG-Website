const keywords = new Set([
	"const", "var", "function", "class", "super", "return", "if", "elif", "else",
	"while", "for", "in", "and", "or", "not",
	"cfor", "break", "continue", "switch", "case", "default",
	"this", "public", "private", "protected", "try", "catch", "throw",
]);
const literals = new Set(["true", "false", "null"]);
const builtins = new Set(["print", "str", "len", "range", "size", "length"]);
const tokenPattern = /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|"(?:\\[^\r\n]|[^"\\\r\n])*\\?"?|'(?:\\[^\r\n]|[^'\\\r\n])*\\?'?|[0-9]+(?:\.[0-9]+)?(?:[eE][+-]?[0-9]*)?|[\p{L}_][\p{L}\p{Nd}_]*|[=!<>]=|\+=|-=|\*=|\/=|%=|\+\+|--|[=<>+*/%\-]|[()[\]{}:;,.]|\s+|[^]/gu;

export function tokenize(source) {
	const result = [];
	let position = 0;

	function pushString(text) {
		let start = 0;
		for (let index = 0; index < text.length - 1; index++) {
			if (text[index] !== "\\") continue;
			if (index > start) result.push({ text: text.slice(start, index), kind: "string" });
			result.push({ text: text.slice(index, index + 2), kind: "string-escape" });
			index++;
			start = index + 1;
		}
		if (start < text.length) result.push({ text: text.slice(start), kind: "string" });
	}

	function consume(depth = 0) {
		if (depth < 512 && /^[fF]["']/.test(source.slice(position, position + 2))) {
			formatted(depth + 1);
			return;
		}
		tokenPattern.lastIndex = position;
		const text = tokenPattern.exec(source)[0];
		position += text.length;
		let kind = "plain";
		if (text.startsWith("//") || text.startsWith("/*")) kind = "comment";
		else if (text[0] === '"' || text[0] === "'") {
			pushString(text);
			return;
		}
		else if (/^[0-9]/.test(text)) kind = "number";
		else if (keywords.has(text)) kind = "keyword";
		else if (literals.has(text)) kind = "literal";
		else if (builtins.has(text)) kind = "builtin";
		else if (/^[\p{L}_]/u.test(text)) kind = "identifier";
		else if (/^[=<>!+*/%\-]/.test(text)) kind = "operator";
		else if (/^[()[\]{}:;,.]/.test(text)) kind = "punctuation";
		result.push({ text, kind });
	}

	function formatted(depth) {
		const quote = source[position + 1];
		let start = position;
		position += 2;
		function flush() {
			if (position > start) pushString(source.slice(start, position));
		}
		while (position < source.length) {
			const char = source[position];
			if (char === "\n" || char === "\r") break;
			if (char === "\\") {
				position++;
				if (position < source.length && !/[\r\n]/.test(source[position])) position++;
			} else if (char === quote) {
				position++;
				break;
			} else if ((char === "{" || char === "}") && source[position + 1] === char) {
				position += 2;
			} else if (char === "{") {
				flush();
				result.push({ text: "{", kind: "punctuation" });
				position++;
				let braces = 0;
				while (position < source.length) {
					if (source[position] === "}" && braces === 0) {
						result.push({ text: "}", kind: "punctuation" });
						position++;
						break;
					}
					const char = source[position];
					if (char === "{") braces++;
					if (char === "}") braces--;
					consume(depth);
				}
				start = position;
			} else {
				position++;
			}
		}
		flush();
	}

	while (position < source.length) consume();
	return result;
}