export type TokenKind =
	| "string"
	| "escape"
	| "comment"
	| "number"
	| "keyword"
	| "literal"
	| "builtin"
	| "identifier"
	| "operator"
	| "punctuation"
	| "plain";

export interface Token {
	text: string;
	kind: TokenKind;
}

export const keywords = new Set<string>([
	"const", "var", "function", "class", "extends", "super", "return", "if", "elif", "else",
	"while", "for", "in", "and", "or", "not",
	"cfor", "cif", "celse", "break", "continue", "switch", "case", "default",
	"this", "public", "private", "protected", "try", "catch", "throw",
	"import", "as",
]);
export const literals = new Set<string>(["true", "false", "null"]);
export const builtins = new Set<string>(["print", "input", "str", "int", "float", "bool", "len", "range", "open", "read_file", "write_file", "append_file", "file_exists", "remove_file", "math", "algo"]);
export const moduleMembers: Record<string, Set<string>> = {
	math: new Set(["ceil", "floor", "round", "sqrt", "abs", "pow", "log", "sin", "cos", "tan", "min", "max"]),
	algo: new Set([
		"fibonacci", "fibonacciList", "factorial", "factorialList", "removeDuplicates", "findMatches",
		"takeInventory", "findPlace", "isPrime", "rainwater", "medianSorted", "mergeKSorted",
		"editDistance", "regexMatch", "slidingWindowMax", "slidingWindowSumMax", "slidingWindowMinLen",
		"slidingWindowLongestUnique", "slidingWindowMinSubstring", "palindromeValid", "palindromeCanBeValid",
		"palindromeLongest", "palindromeCount", "palindromeMinCuts",
	]),
};
const tokenPattern = /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|"(?:\\[^\r\n]|[^"\\\r\n])*\\?"?|'(?:\\[^\r\n]|[^'\\\r\n])*\\?'?|[0-9]+(?:\.[0-9]+)?(?:[eE][+-]?[0-9]*)?|[\p{L}_][\p{L}\p{Nd}_]*|\+\+|--|\*\*|&&|\|\||[=!<>+*%\-]=|[=<>+*/%\-]|[()[\]{}:;,.]|\s+|[^]/gu;
const escapes = new Set(["n", "r", "t", "\\", '"', "'"]);

export function tokenize(source: string): Token[] {
	const result: Token[] = [];
	let position = 0;

	function stringLiteral(): void {
		const quote = source[position++];
		let start = position - 1;
		while (position < source.length && source[position] !== quote) {
			if (source[position] === "\\" && position + 1 < source.length && escapes.has(source[position + 1])) {
				if (position > start) result.push({ text: source.slice(start, position), kind: "string" });
				result.push({ text: source.slice(position, position + 2), kind: "escape" });
				position += 2;
				start = position;
			} else if (source[position] === "\n" || source[position] === "\r") {
				break;
			} else {
				position++;
			}
		}
		if (position < source.length && source[position] === quote) position++;
		if (position > start) result.push({ text: source.slice(start, position), kind: "string" });
	}

	// True for `math.sqrt` / `algo.isPrime`, allowing whitespace around the dot.
	function isModuleMember(name: string): boolean {
		const previous = result.filter(({ text }, index) => index >= result.length - 4 && !/^\s+$/.test(text));
		const [module, dot] = previous.slice(-2);
		return dot?.text === "." && module?.kind === "builtin" && moduleMembers[module.text]?.has(name) === true;
	}

	function consume(depth = 0): void {
		if (depth < 512 && /^[fF]["']/.test(source.slice(position, position + 2))) {
			formatted(depth + 1);
			return;
		}
		if (source[position] === '"' || source[position] === "'") {
			stringLiteral();
			return;
		}
		tokenPattern.lastIndex = position;
		const match = tokenPattern.exec(source);
		if (!match) return;
		const text = match[0];
		position += text.length;
		let kind: TokenKind = "plain";
		if (text.startsWith("//") || text.startsWith("/*")) kind = "comment";
		else if (/^[0-9]/.test(text)) kind = "number";
		else if (keywords.has(text)) kind = "keyword";
		else if (literals.has(text)) kind = "literal";
		else if (builtins.has(text)) kind = "builtin";
		else if (isModuleMember(text)) kind = "builtin";
		else if (/^[\p{L}_]/u.test(text)) kind = "identifier";
		else if (/^(?:[=<>!+*/%\-]|&&|\|\|)/.test(text)) kind = "operator";
		else if (/^[()[\]{}:;,.]/.test(text)) kind = "punctuation";
		result.push({ text, kind });
	}

	function formatted(depth: number): void {
		const quote = source[position + 1];
		let start = position;
		position += 2;
		function flush() {
			if (position > start) result.push({ text: source.slice(start, position), kind: "string" });
		}
		while (position < source.length) {
			const char = source[position];
			if (char === "\n" || char === "\r") break;
			if (char === "\\") {
				if (position + 1 < source.length && escapes.has(source[position + 1])) {
					flush();
					result.push({ text: source.slice(position, position + 2), kind: "escape" });
					position += 2;
					start = position;
				} else {
					position++;
					if (position < source.length && !/[\r\n]/.test(source[position])) position++;
				}
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