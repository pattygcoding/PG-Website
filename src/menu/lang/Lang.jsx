import React, { useState, useRef, useEffect } from "react";
import { useLang } from "@/lang/languageContext";
import "./Lang.css";

const LANG_OPTIONS = [
	{ code: "en_us", label: "🇺🇸 EN" },
	{ code: "ar_sa", label: "🇸🇦 AR" },
	{ code: "cn_cn", label: "🇨🇳 CN" },
	{ code: "de_de", label: "🇩🇪 DE" },
	{ code: "es_mx", label: "🇲🇽 ES" },
	{ code: "fr_ca", label: "🇨🇦 FR" },
	{ code: "fr_fr", label: "🇫🇷 FR" },
	{ code: "id_id", label: "🇮🇩 ID" },
	{ code: "it_it", label: "🇮🇹 IT" },
	{ code: "jp_jp", label: "🇯🇵 JP" },
	{ code: "pt_br", label: "🇧🇷 PT" },
];

const Lang = () => {
	const { lang, setLang } = useLang();
	const [open, setOpen] = useState(false);
	const dropdownRef = useRef(null);

	useEffect(() => {
		const close = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setOpen(false);
			}
		};
		document.addEventListener("click", close);
		return () => document.removeEventListener("click", close);
	}, []);

	return (
		<div className="lang-wrapper" ref={dropdownRef}>
			<button
				className="lang-toggle"
				onClick={() => setOpen((prev) => !prev)}
			>
				{LANG_OPTIONS.find((l) => l.code === lang)?.label || "🌐"}
			</button>

			{open && (
				<div className="lang-dropdown">
					{LANG_OPTIONS.map(({ code, label }) => (
						<div
							key={code}
							className={`lang-option ${lang === code ? "active" : ""}`}
							onClick={() => {
								setLang(code);
								setOpen(false);
							}}
						>
							{label}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Lang;
