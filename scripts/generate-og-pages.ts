// Link-preview crawlers (LinkedIn, Slack, etc.) don't run JS, so each route needs static OG tags.
import fs from "fs";
import path from "path";
import t from "../src/assets/lang/en_us.json";

const SITE = "https://www.pattygcoding.com";
const BUILD_DIR = path.join(__dirname, "..", "build");
const IMG = (name: string): string => `${SITE}/assets/images/${name}`;

const pages = [
	{ route: "about", title: t.about.title, description: t.tab.description, image: IMG("professional.png") },
	{ route: "portfolio", title: t.portfolio.title, description: "Projects spanning SaaS products, programming languages, WebAssembly apps, developer tools, and more.", image: IMG("logo.png") },
	{ route: "contact", title: t.contact.title, description: t.contact.description, image: IMG("logo.png") },
	{ route: "tiger", title: t.tiger.title, description: t.tiger.description, image: IMG("tiger.png") },
	{ route: "formatter", title: t.formatter.title, description: t.formatter.description, image: IMG("formatter.png") },
	{ route: "languages", title: t.languages.title, description: t.languages.description, image: IMG("map.png") },
];

const escapeAttr = (s: unknown): string => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const setMeta = (html: string, attr: string, key: string, value: string): string => {
	const re = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`);
	if (!re.test(html)) throw new Error(`Missing <meta ${attr}="${key}"> in build/index.html`);
	return html.replace(re, `$1${escapeAttr(value)}$2`);
};

const template = fs.readFileSync(path.join(BUILD_DIR, "index.html"), "utf8");

for (const { route, title, description, image } of pages) {
	const url = `${SITE}/${route}`;
	const fullTitle = `${title} - ${t.tab.title}`;
	let html = template
		.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(fullTitle)}</title>`)
		.replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${url}$2`);
	html = setMeta(html, "name", "description", description);
	html = setMeta(html, "property", "og:title", fullTitle);
	html = setMeta(html, "property", "og:description", description);
	html = setMeta(html, "property", "og:image", image);
	html = setMeta(html, "property", "og:image:alt", title);
	html = setMeta(html, "property", "og:url", url);
	html = setMeta(html, "name", "twitter:title", fullTitle);
	html = setMeta(html, "name", "twitter:description", description);
	html = setMeta(html, "name", "twitter:image", image);
	// GitHub Pages serves /about from about.html without a trailing-slash redirect.
	fs.writeFileSync(path.join(BUILD_DIR, `${route}.html`), html);
}

console.log(`Generated OG pages for: ${pages.map((p) => p.route).join(", ")}`);
