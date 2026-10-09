import React from 'react';
import ReactDOM from "react-dom/client";
import App from './app/App';
import { LanguageProvider } from "@/lang/languageContext";
import './index.css';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <LanguageProvider>
        <App />
    </LanguageProvider>
);
