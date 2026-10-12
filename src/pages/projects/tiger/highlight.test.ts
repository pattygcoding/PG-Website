import { moduleMembers, tokenize } from "./highlight";

function tokens(source: string) {
	return tokenize(source).filter(({ kind }) => kind !== "plain");
}

test("all reserved words, literals, and built-ins", () => {
	for (const text of "const var function class extends super this public private protected return if elif else while do for in and or not div break continue switch match case default try catch finally throw import as".split(" ")) {
		expect(tokens(text)).toEqual([{ text, kind: "keyword" }]);
	}
	for (const text of ["true", "false", "null"]) {
		expect(tokens(text)).toEqual([{ text, kind: "literal" }]);
	}
	for (const text of ["print", "input", "str", "int", "float", "bool", "len", "range", "type", "isinstance", "graphemes", "sum", "min", "max", "any", "all", "zip", "enumerate", "map", "filter", "sorted", "open", "read_file", "write_file", "append_file", "file_exists", "remove_file", "list_dir", "math", "algo", "random", "json", "time", "regex"]) {
		expect(tokens(text)).toEqual([{ text, kind: "builtin" }]);
	}
});

test("math and algo members are built-ins only after their module", () => {
	for (const [module, members] of Object.entries(moduleMembers)) {
		for (const member of members) {
			expect(tokens(`${module}.${member}(1)`).slice(0, 3)).toEqual([
				{ text: module, kind: "builtin" },
				{ text: ".", kind: "punctuation" },
				{ text: member, kind: "builtin" },
			]);
		}
	}
	expect(tokens("math . sqrt").map(({ kind }) => kind)).toEqual(["builtin", "punctuation", "builtin"]);
	expect(tokens(`f"{math.floor(x)}"`)[4]).toEqual({ text: "floor", kind: "builtin" });
	for (const source of ["sqrt", "point.sqrt", "math.isPrime", "algo.sqrt", "math.tau", "print.tau", "math sqrt"]) {
		const last = tokens(source);
		expect(last[last.length - 1].kind).toBe("identifier");
	}
});

test("identifiers include Unicode and do not invent type keywords", () => {
	for (const text of ["def", "number", "string", "self", "true_value", "printable", "caf\u00e9", "\u53d8\u91cf\u0661"]) {
		expect(tokens(text)).toEqual([{ text, kind: "identifier" }]);
	}
});

test("decimal and exponent numbers, operators, and punctuation", () => {
	expect(tokens("12 3.5 1e2 2E-3 4e+").map(({ kind }) => kind)).toEqual(Array(5).fill("number"));
	for (const text of "= += -= *= %= == != < <= > >= + - * / % ++ -- ** && || ! << >> & | ^ ~".split(" ")) {
		expect(tokens(text)).toEqual([{ text, kind: "operator" }]);
	}
	for (const text of "()[]{}:;,.") {
		expect(tokens(text)).toEqual([{ text, kind: "punctuation" }]);
	}
});

test("raw strings keep backslashes literal", () => {
	expect(tokens(String.raw`r"\n\d+"`)).toEqual([{ text: String.raw`r"\n\d+"`, kind: "string" }]);
	expect(tokens(String.raw`R'\t'`)).toEqual([{ text: String.raw`R'\t'`, kind: "string" }]);
});

test("strings protect comment markers and handle escapes", () => {
	for (const text of ['"# // /* true */"', "'hello'"]) {
		expect(tokens(text)).toEqual([{ text, kind: "string" }]);
	}
	expect(tokens(String.raw`"a\"b\\c\n\r\t"`)).toEqual([
		{ text: '"a', kind: "string" }, { text: '\\"', kind: "escape" },
		{ text: "b", kind: "string" }, { text: "\\\\", kind: "escape" },
		{ text: "c", kind: "string" }, { text: "\\n", kind: "escape" },
		{ text: "\\r", kind: "escape" }, { text: "\\t", kind: "escape" },
		{ text: '"', kind: "string" },
	]);
	expect(tokens(String.raw`'it\'s'`)).toEqual([
		{ text: "'it", kind: "string" }, { text: "\\'", kind: "escape" }, { text: "s'", kind: "string" },
	]);
	expect(tokens('// "hello"\n// true')).toEqual([
		{ text: '// "hello"', kind: "comment" },
		{ text: "// true", kind: "comment" },
	]);
});

test("variadic and unpack markers tokenize as operators", () => {
	expect(tokens("*args")).toEqual([
		{ text: "*", kind: "operator" },
		{ text: "args", kind: "identifier" },
	]);
	expect(tokens("**kwargs")).toEqual([
		{ text: "**", kind: "operator" },
		{ text: "kwargs", kind: "identifier" },
	]);
	expect(tokens("f(*items, **mapping)")).toEqual([
		{ text: "f", kind: "identifier" },
		{ text: "(", kind: "punctuation" },
		{ text: "*", kind: "operator" },
		{ text: "items", kind: "identifier" },
		{ text: ",", kind: "punctuation" },
		{ text: "**", kind: "operator" },
		{ text: "mapping", kind: "identifier" },
		{ text: ")", kind: "punctuation" },
	]);
});

test("unfinished strings recover on the next line", () => {
	for (const text of ['"unfinished', "'unfinished", '"escape\\']) {
		expect(tokens(`${text}\nconst`)).toEqual([
			{ text, kind: "string" }, { text: "const", kind: "keyword" },
		]);
	}
});

test("tokenization preserves all source, including incomplete or HTML-like input", () => {
	for (const source of ["", "\n\n", "\tconst x = 12;  \n", '<img src=x onerror="alert(1)">', "\ud83d\udc05 ! & | ` \\ \\r\\n", "/* a block comment */"]) {
		expect(tokenize(source).map(({ text }) => text).join("")).toBe(source);
		expect(tokenize(source)).toEqual(tokenize(source));
	}
});

test("block comments span lines and tolerate unfinished input", () => {
	for (const text of ["/**/", "/* first\nfunction var # // second */", "/* unfinished\ncomment"]) {
		expect(tokens(text)).toEqual([{ text, kind: "comment" }]);
	}
	expect(tokens("/* done */var")).toEqual([
		{ text: "/* done */", kind: "comment" },
		{ text: "var", kind: "keyword" },
	]);
	expect(tokens("# old")).toEqual([{ text: "old", kind: "identifier" }]);
});

test("formatted strings highlight embedded expressions and preserve nested source", () => {
	expect(tokens('f"Hello {name}, {1 + 2}!"')).toEqual([
		{ text: 'f"Hello ', kind: "string" },
		{ text: "{", kind: "punctuation" },
		{ text: "name", kind: "identifier" },
		{ text: "}", kind: "punctuation" },
		{ text: ", ", kind: "string" },
		{ text: "{", kind: "punctuation" },
		{ text: "1", kind: "number" },
		{ text: "+", kind: "operator" },
		{ text: "2", kind: "number" },
		{ text: "}", kind: "punctuation" },
		{ text: '!"', kind: "string" },
	]);
	for (const source of ['F"{{literal}}"', 'f"{data["key"]}"', `f"{f'{range(3)}'}"`, 'f"{ {"key": 1}["key"] }"', 'f"{1 /* } */ + 2}"', 'f"unfinished {', 'f"text\\', 'f"text\nconst']) {
		expect(tokenize(source).map(({ text }) => text).join("")).toBe(source);
		expect(tokenize(source)).toEqual(tokenize(source));
	}
	expect(tokens('F"{{literal}}"')).toEqual([{ text: 'F"{{literal}}"', kind: "string" }]);
});
