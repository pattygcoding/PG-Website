import React, { createContext, useContext, useState } from "react";
import en_us from "@/assets/lang/en_us.json";
import es_mx from "@/assets/lang/es_mx.json";
import fr_ca from "@/assets/lang/fr_ca.json";
import fr_fr from "@/assets/lang/fr_ca.json";
import it_it from "@/assets/lang/it_it.json";
import pt_br from "@/assets/lang/pt_br.json";
import cn_cn from "@/assets/lang/cn_cn.json";
import ar_sa from "@/assets/lang/ar_sa.json";
import jp_jp from "@/assets/lang/jp_jp.json";
import de_de from "@/assets/lang/de_de.json";
import id_id from "@/assets/lang/id_id.json";

const languageFiles = {
	en_us: en_us,
	es_mx: es_mx,
	fr_ca: fr_ca,
	fr_fr: fr_fr,
	it_it: it_it,
	pt_br: pt_br,
	cn_cn: cn_cn,
	ar_sa: ar_sa,
	jp_jp: jp_jp,
	de_de: de_de,
	id_id: id_id,
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
