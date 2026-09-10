const keywords = new Set([
	"const", "def", "class", "super", "return", "if", "elif", "else",
	"while", "for", "in", "and", "or", "not",
]);
const literals = new Set(["true", "false", "null"]);
const builtins = new Set(["print", "str", "len"]);
const tokenPattern = /#[^\n]*|\/\/[^\n]*|"(?:\\[^\r\n]|[^"\\\r\n])*\\?"?|'(?:\\[^\r\n]|[^'\\\r\n])*\\?'?|[0-9]+(?:\.[0-9]+)?(?:[eE][+-]?[0-9]*)?|[\p{L}_][\p{L}\p{Nd}_]*|[=!<>]=|[=<>+*/%\-]|[()[\]{}:;,.]|\s+|[^]/gu;

export function tokenize(source) {
	return Array.from(source.matchAll(tokenPattern), ([text]) => {
		let kind = "plain";
		if (text.startsWith("#") || text.startsWith("//")) kind = "comment";
		else if (text[0] === '"' || text[0] === "'") kind = "string";
		else if (/^[0-9]/.test(text)) kind = "number";
		else if (keywords.has(text)) kind = "keyword";
		else if (literals.has(text)) kind = "literal";
		else if (builtins.has(text)) kind = "builtin";
		else if (/^[\p{L}_]/u.test(text)) kind = "identifier";
		else if (/^[=<>!+*/%\-]/.test(text)) kind = "operator";
		else if (/^[()[\]{}:;,.]/.test(text)) kind = "punctuation";
		return { text, kind };
	});
}