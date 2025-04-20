import React, { useState, useContext } from "react";
import { useLang } from "@/lang/languageContext";
import "./Lang.css";

const Lang = () => {
	const { lang, setLang } = useLang();

	return (
		<select
			className="form-select mx-2"
			value={lang}
			onChange={(e) => setLang(e.target.value)}
			style={{ width: "auto" }}
		>
			<option value="en_us">🇺🇸 EN</option>
			<option value="es_mx">🇲🇽 ES</option>
			<option value="fr_ca">🇨🇦 FR</option>
		</select>
	);
};

export default Lang;
