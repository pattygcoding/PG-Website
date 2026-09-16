import React, { createContext, useContext, useState, useEffect } from "react";
import en_us from "@/assets/lang/en_us.json";

const LanguageContext = createContext();

export const getLanguageTag = (locale) => {
	const [language, region] = locale.split("_");
	return Intl.getCanonicalLocales(language.includes("-") ? language : `${language}-${region}`)[0];
};

export const LanguageProvider = ({ children }) => {
	const [lang, setLang] = useState("en_us");
	const [languageFile, setLanguageFile] = useState(en_us);

	useEffect(() => {
		let cancelled = false;
		const loadLanguage = async () => {
			if (lang === "en_us") {
				setLanguageFile(en_us);
				document.documentElement.lang = "en-US";
				return;
			}
			try {
				const module = await import(`@/assets/lang/${lang}.json`);
				if (cancelled) return;
				setLanguageFile(module.default);
				document.documentElement.lang = getLanguageTag(lang);
			} catch (error) {
				if (cancelled) return;
				console.error(`Failed to load language file: ${lang}`, error);
				setLanguageFile(en_us); // fallback
				document.documentElement.lang = "en-US";
			}
		};
		loadLanguage();
		return () => { cancelled = true; };
	}, [lang]);

	const t = (key) => {
		const parts = key.split(".");
		let val = parts.reduce((acc, part) => acc && acc[part], languageFile);
		if (val === undefined) {
			val = parts.reduce((acc, part) => acc && acc[part], en_us);
		}
		return val || key;
	};

	return (
		<LanguageContext.Provider value={{ lang, setLang, t }}>
			{children}
		</LanguageContext.Provider>
	);
};

export const useLang = () => useContext(LanguageContext);
