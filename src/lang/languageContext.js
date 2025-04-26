import React, { createContext, useContext, useState, useEffect } from "react";
import en_us from "@/assets/lang/en_us.json";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
	const [lang, setLang] = useState("en_us");
	const [languageFile, setLanguageFile] = useState(en_us);

	useEffect(() => {
		const loadLanguage = async () => {
			if (lang === "en_us") {
				setLanguageFile(en_us);
				return;
			}
			try {
				const module = await import(`@/assets/lang/${lang}.json`);
				setLanguageFile(module.default);
			} catch (error) {
				console.error(`Failed to load language file: ${lang}`, error);
				setLanguageFile(en_us); // fallback
			}
		};
		loadLanguage();
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
