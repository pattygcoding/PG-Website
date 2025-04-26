import React, { useState, useRef, useEffect } from "react";
import { useLang } from "@/lang/languageContext";
import { useSearchParams } from "react-router-dom";
import "./Lang.css";

const LANG_OPTIONS = [
	{ code: "en_us", label: "🇺🇸 EN" },
	{ code: "es_mx", label: "🇲🇽 ES" },
	{ code: "am_et", label: "🇪🇹 AM" },
	{ code: "ar_sa", label: "🇸🇦 AR" },
	{ code: "az_az", label: "🇦🇿 AZ" },
	{ code: "be_by", label: "🇧🇾 BE" },
	{ code: "bg_bg", label: "🇧🇬 BG" },
	{ code: "bn_bd", label: "🇧🇩 BN" },
	{ code: "bs_ba", label: "🇧🇦 BS" },
	{ code: "ca_ad", label: "🇦🇩 CA" },
	{ code: "zh_CN_cn", label: "🇨🇳 CN" },
	{ code: "cs_cz", label: "🇨🇿 CS" },
	{ code: "cy_gb", label: "🏴 CY" },
	{ code: "da_dk", label: "🇩🇰 DA" },
	{ code: "de_de", label: "🇩🇪 DE" },
	{ code: "dv_mv", label: "🇲🇻 DV" },
	{ code: "el_gr", label: "🇬🇷 EL" },
	{ code: "et_ee", label: "🇪🇪 ET" },
	{ code: "fa_ir", label: "🇮🇷 FA" },
	{ code: "fi_fi", label: "🇫🇮 FI" },
	{ code: "fr_fr", label: "🇫🇷 FR" },
	{ code: "ga_ie", label: "🇮🇪 GA" },
	{ code: "hi_in", label: "🇮🇳 HI" },
	{ code: "hr_hr", label: "🇭🇷 HR" },
	{ code: "ht_ht", label: "🇭🇹 HT" },
	{ code: "hu_hu", label: "🇭🇺 HU" },
	{ code: "hy_am", label: "🇦🇲 HY" },
	{ code: "id_id", label: "🇮🇩 ID" },
	{ code: "is_is", label: "🇮🇸 IS" },
	{ code: "it_it", label: "🇮🇹 IT" },
	{ code: "ja_jp", label: "🇯🇵 JA" },
	{ code: "ka_ge", label: "🇬🇪 KA" },
	{ code: "kk_kz", label: "🇰🇿 KK" },
	{ code: "km_kh", label: "🇰🇭 KM" },
	{ code: "kn_in", label: "🇮🇳 KN" },
	{ code: "ko_kr", label: "🇰🇷 KO" },
	{ code: "ky_kg", label: "🇰🇬 KY" },
	{ code: "lb_lu", label: "🇱🇺 LB" },
	{ code: "lo_la", label: "🇱🇦 LO" },
	{ code: "lt_lt", label: "🇱🇹 LT" },
	{ code: "lv_lv", label: "🇱🇻 LV" },
	{ code: "mg_mg", label: "🇲🇬 MG" },
	{ code: "mn_mn", label: "🇲🇳 MN" },
	{ code: "mr_in", label: "🇮🇳 MR" },
	{ code: "ms_my", label: "🇲🇾 MS" },
	{ code: "mt_mt", label: "🇲🇹 MT" },
	{ code: "my_mm", label: "🇲🇲 MY" },
	{ code: "ne_np", label: "🇳🇵 NE" },
	{ code: "nl_nl", label: "🇳🇱 NL" },
	{ code: "no_no", label: "🇳🇴 NO" },
	{ code: "pl_pl", label: "🇵🇱 PL" },
	{ code: "pt_br", label: "🇧🇷 PT" },
	{ code: "ro_md", label: "🇲🇩 MD" },
	{ code: "ro_ro", label: "🇷🇴 RO" },
	{ code: "ru_ru", label: "🇷🇺 RU" },
	{ code: "si_lk", label: "🇱🇰 SI" },
	{ code: "sk_sk", label: "🇸🇰 SK" },
	{ code: "sl_si", label: "🇸🇮 SL" },
	{ code: "so_so", label: "🇸🇴 SO" },
	{ code: "sq_al", label: "🇦🇱 SQ" },
	{ code: "sr_rs", label: "🇷🇸 SR" },
	{ code: "st_ls", label: "🇱🇸 ST" },
	{ code: "sv_se", label: "🇸🇪 SV" },
	{ code: "sw_tz", label: "🇹🇿 SW" },
	{ code: "ta_in", label: "🇮🇳 TA" },
	{ code: "te_in", label: "🇮🇳 TE" },
	{ code: "th_th", label: "🇹🇭 TH" },
	{ code: "tk_tm", label: "🇹🇲 TK" },
	{ code: "tr_tr", label: "🇹🇷 TR" },
	{ code: "tg_tj", label: "🇹🇯 TG" },
	{ code: "uk_ua", label: "🇺🇦 UK" },
	{ code: "ur_pk", label: "🇵🇰 UR" },
	{ code: "uz_uz", label: "🇺🇿 UZ" },
	{ code: "vi_vn", label: "🇻🇳 VI" }
];


const Lang = () => {
	const { lang, setLang } = useLang();
	const [open, setOpen] = useState(false);
	const dropdownRef = useRef(null);
	const [searchParams, setSearchParams] = useSearchParams();

	useEffect(() => {
		const urlLang = searchParams.get("lang");
		if (urlLang && LANG_OPTIONS.some(l => l.code === urlLang)) {
			setLang(urlLang);
		}
	}, []);

	useEffect(() => {
		const close = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setOpen(false);
			}
		};
		document.addEventListener("click", close);
		return () => document.removeEventListener("click", close);
	}, []);

	const handleSelect = (code) => {
		setLang(code);
		setSearchParams((prev) => {
			prev.set("lang", code);
			return prev;
		});
		setOpen(false);
	};

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
							onClick={() => handleSelect(code)}
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