import React, { createContext, useContext, useState } from "react";
import en_us from "@/assets/lang/en_us.json";
import es_mx from "@/assets/lang/es_mx.json";
import fr_ca from "@/assets/lang/fr_ca.json";

const languageFiles = {
	en_us: en_us,
	es_mx: es_mx,
	fr_ca: fr_ca,
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
	const [lang, setLang] = useState("en_us");

	const t = (key) => {
		const parts = key.split(".");
		let val = parts.reduce((acc, part) => acc && acc[part], languageFiles[lang]);
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
