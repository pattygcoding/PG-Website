// GitHub Pages serves an extension-less path from the matching .html file
// (see generate-og-pages.ts), so a static stub moves a retired route onto its
// new home without JavaScript and without losing link previews.
import fs from "fs";
import path from "path";
import links from "../src/assets/links/links.json";

const BUILD_DIR = path.join(__dirname, "..", "build");

// On-site routes retired once the arcade projects moved to
// arcade.pattygcoding.com: every arcade destination except its root. Kept in
// sync with the SPA routes in src/routes/AppRoutes.tsx.
const redirects = Object.entries(links.arcade as Record<string, string>)
	.filter(([key]) => key !== "home")
	.map(([route, to]) => ({ route, to }));

const renderRedirect = ({ route, to }: { route: string; to: string }) => `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <title>Moved to the arcade | Patrick Goodwin</title>
    <meta name="robots" content="noindex, follow" />
    <link rel="canonical" href="${to}" />
    <meta http-equiv="refresh" content="0; url=${to}" />
    <script>window.location.replace("${to}");</script>
</head>

<body>
    <p>The ${route} project now lives at <a href="${to}">${to}</a>.</p>
</body>

</html>
`;

for (const redirect of redirects) {
	fs.writeFileSync(path.join(BUILD_DIR, `${redirect.route}.html`), renderRedirect(redirect));
}

console.log(`Generated redirects for: ${redirects.map(({ route }) => `/${route}`).join(", ")}`);