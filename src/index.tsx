import React from 'react';
import ReactDOM from "react-dom/client";
import App from './app/App';
import { LanguageProvider } from "@/lang/languageContext";
import './index.css';

// React 19 hoists the <title> rendered by each page into <head>. index.html and
// the per-route files built by scripts/generate-og-pages.ts keep a static
// <title> for crawlers that do not run JavaScript, so drop that stale element
// before mounting and let the rendered title be the only one in the document.
document.head.querySelector("title")?.remove();

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
    <LanguageProvider>
        <App />
    </LanguageProvider>
);
