import { createContext, useContext, useState, useEffect } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import en_us from "@/assets/lang/en_us.json";

type LanguageMessages = Record<string, unknown>;

export interface LanguageContextValue {
	lang: string;
	setLang: Dispatch<SetStateAction<string>>;
	/** Returns a translated string for leaf keys, or a nested messages object for branch keys. */
	t: (key: string) => any;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const getLanguageTag = (locale: string): string => {
	const [language, region] = locale.split("_");
	return Intl.getCanonicalLocales(language.includes("-") ? language : `${language}-${region}`)[0];
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
	const [lang, setLang] = useState("en_us");
	const [languageFile, setLanguageFile] = useState<LanguageMessages>(en_us as LanguageMessages);

	useEffect(() => {
		let cancelled = false;
		const loadLanguage = async () => {
			if (lang === "en_us") {
				setLanguageFile(en_us as LanguageMessages);
				document.documentElement.lang = "en-US";
				return;
			}
			try {
				const module = await import(`@/assets/lang/${lang}.json`);
				if (cancelled) return;
				setLanguageFile(module.default as LanguageMessages);
				document.documentElement.lang = getLanguageTag(lang);
			} catch (error) {
				if (cancelled) return;
				console.error(`Failed to load language file: ${lang}`, error);
				setLanguageFile(en_us as LanguageMessages); // fallback
				document.documentElement.lang = "en-US";
			}
		};
		loadLanguage();
		return () => { cancelled = true; };
	}, [lang]);

	const t = (key: string): any => {
		const parts = key.split(".");
		let val: any = parts.reduce((acc: any, part) => acc && acc[part], languageFile);
		if (val === undefined) {
			val = parts.reduce((acc: any, part) => acc && acc[part], en_us);
		}
		return val || key;
	};

	return (
		<LanguageContext.Provider value={{ lang, setLang, t }}>
			{children}
		</LanguageContext.Provider>
	);
};

export const useLang = (): LanguageContextValue => useContext(LanguageContext) as LanguageContextValue;
