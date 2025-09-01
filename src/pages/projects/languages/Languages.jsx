import React, { useState, useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Container } from "react-bootstrap";
import { PageTitle } from "@/components/page-title";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import ReactCountryFlag from "react-country-flag";
import "./Languages.css";

// Import the same language options from Lang component
const LANG_OPTIONS = [
	{ code: "en_us", label: "EN", country: "US", name: "English" },
	{ code: "es_mx", label: "ES", country: "MX", name: "Español" },
	{ code: "af_za", label: "AF", country: "ZA", name: "Afrikaans" },
	{ code: "am_et", label: "AM", country: "ET", name: "አማርኛ" },
	{ code: "ar_sa", label: "AR", country: "SA", name: "العربية" },
	{ code: "ay_bo", label: "AY", country: "BO", name: "Aymar aru" },
	{ code: "az_az", label: "AZ", country: "AZ", name: "Azərbaycan" },
	{ code: "be_by", label: "BE", country: "BY", name: "Беларуская" },
	{ code: "bg_bg", label: "BG", country: "BG", name: "Български" },
	{ code: "bm_ml", label: "BM", country: "ML", name: "Bamanankan" },
	{ code: "bn_bd", label: "BN", country: "BD", name: "বাংলা" },
	{ code: "bs_ba", label: "BS", country: "BA", name: "Bosanski" },
	{ code: "ca_ad", label: "CA", country: "AD", name: "Català" },
	{ code: "ceb_ph", label: "CEB", country: "PH", name: "Cebuano" },
	{ code: "cs_cz", label: "CS", country: "CZ", name: "Čeština" },
	{ code: "cy_gb", label: "CY", country: "GB", name: "Cymraeg" },
	{ code: "da_dk", label: "DA", country: "DK", name: "Dansk" },
	{ code: "de_de", label: "DE", country: "DE", name: "Deutsch" },
	{ code: "dv_mv", label: "DV", country: "MV", name: "ދިވެހި" },
	{ code: "ee_gh", label: "EE", country: "GH", name: "Eʋegbe" },
	{ code: "el_gr", label: "EL", country: "GR", name: "Ελληνικά" },
	{ code: "et_ee", label: "ET", country: "EE", name: "Eesti" },
	{ code: "fa_ir", label: "FA", country: "IR", name: "فارسی" },
	{ code: "fi_fi", label: "FI", country: "FI", name: "Suomi" },
	{ code: "fr_fr", label: "FR", country: "FR", name: "Français" },
	{ code: "ga_ie", label: "GA", country: "IE", name: "Gaeilge" },
	{ code: "gd_gb", label: "GD", country: "GB", name: "Gàidhlig" },
	{ code: "gn_py", label: "GN", country: "PY", name: "Guaraní" },
	{ code: "ha_ng", label: "HA", country: "NG", name: "Hausa" },
	{ code: "haw_us", label: "HAW", country: "US", name: "ʻŌlelo Hawaiʻi" },
	{ code: "hi_in", label: "HI", country: "IN", name: "हिन्दी" },
	{ code: "hr_hr", label: "HR", country: "HR", name: "Hrvatski" },
	{ code: "ht_ht", label: "HT", country: "HT", name: "Kreyòl ayisyen" },
	{ code: "hu_hu", label: "HU", country: "HU", name: "Magyar" },
	{ code: "hy_am", label: "HY", country: "AM", name: "Հայերեն" },
	{ code: "id_id", label: "ID", country: "ID", name: "Bahasa Indonesia" },
	{ code: "ig_ng", label: "IG", country: "NG", name: "Igbo" },
	{ code: "is_is", label: "IS", country: "IS", name: "Íslenska" },
	{ code: "it_it", label: "IT", country: "IT", name: "Italiano" },
	{ code: "iw_il", label: "HE", country: "IL", name: "עברית" },
	{ code: "ja_jp", label: "JA", country: "JP", name: "日本語" },
	{ code: "jw_id", label: "JW", country: "ID", name: "Javanese" },
	{ code: "ka_ge", label: "KA", country: "GE", name: "ქართული" },
	{ code: "kk_kz", label: "KK", country: "KZ", name: "Қазақ тілі" },
	{ code: "km_kh", label: "KM", country: "KH", name: "ខ្មែរ" },
	{ code: "kn_in", label: "KN", country: "IN", name: "ಕನ್ನಡ" },
	{ code: "ko_kr", label: "KO", country: "KR", name: "한국어" },
	{ code: "kri_sl", label: "KRI", country: "SL", name: "Krio" },
	{ code: "ky_kg", label: "KY", country: "KG", name: "Кыргызча" },
	{ code: "la_va", label: "LA", country: "VA", name: "Latina" },
	{ code: "lb_lu", label: "LB", country: "LU", name: "Lëtzebuergesch" },
	{ code: "lo_la", label: "LO", country: "LA", name: "ລາວ" },
	{ code: "ln_cd", label: "LN", country: "CD", name: "Lingála" },
	{ code: "lt_lt", label: "LT", country: "LT", name: "Lietuvių" },
	{ code: "lv_lv", label: "LV", country: "LV", name: "Latviešu" },
	{ code: "mg_mg", label: "MG", country: "MG", name: "Malagasy" },
	{ code: "mi_nz", label: "MI", country: "NZ", name: "Māori" },
	{ code: "mk_mk", label: "MK", country: "MK", name: "Македонски" },
	{ code: "mn_mn", label: "MN", country: "MN", name: "Монгол" },
	{ code: "mr_in", label: "MR", country: "IN", name: "मराठी" },
	{ code: "ms_my", label: "MS", country: "MY", name: "Bahasa Melayu" },
	{ code: "mt_mt", label: "MT", country: "MT", name: "Malti" },
	{ code: "my_mm", label: "MY", country: "MM", name: "မြန်မာ" },
	{ code: "ne_np", label: "NE", country: "NP", name: "नेपाली" },
	{ code: "nl_nl", label: "NL", country: "NL", name: "Nederlands" },
	{ code: "no_no", label: "NO", country: "NO", name: "Norsk" },
	{ code: "ny_mw", label: "NY", country: "MW", name: "Chichewa" },
	{ code: "pl_pl", label: "PL", country: "PL", name: "Polski" },
	{ code: "ps_af", label: "PS", country: "AF", name: "پښتو" },
	{ code: "pt_br", label: "PT", country: "BR", name: "Português" },
	{ code: "qu_pe", label: "QU", country: "PE", name: "Runa Simi" },
	{ code: "ro_md", label: "RO", country: "MD", name: "Română" },
	{ code: "ro_ro", label: "RO", country: "RO", name: "Română" },
	{ code: "ru_ru", label: "RU", country: "RU", name: "Русский" },
	{ code: "si_lk", label: "SI", country: "LK", name: "සිංහල" },
	{ code: "sk_sk", label: "SK", country: "SK", name: "Slovenčina" },
	{ code: "sl_si", label: "SL", country: "SI", name: "Slovenščina" },
	{ code: "sn_zw", label: "SN", country: "ZW", name: "chiShona" },
	{ code: "so_so", label: "SO", country: "SO", name: "Soomaali" },
	{ code: "sq_al", label: "SQ", country: "AL", name: "Shqip" },
	{ code: "sr_rs", label: "SR", country: "RS", name: "Српски" },
	{ code: "su_id", label: "SU", country: "ID", name: "Sundanese" },
	{ code: "st_ls", label: "ST", country: "LS", name: "Sesotho" },
	{ code: "sv_se", label: "SV", country: "SE", name: "Svenska" },
	{ code: "sw_tz", label: "SW", country: "TZ", name: "Kiswahili" },
	{ code: "ta_in", label: "TA", country: "IN", name: "தமிழ்" },
	{ code: "te_in", label: "TE", country: "IN", name: "తెలుగు" },
	{ code: "tg_tj", label: "TG", country: "TJ", name: "Тоҷикӣ" },
	{ code: "ti_er", label: "TI", country: "ER", name: "ትግርኛ" },
	{ code: "th_th", label: "TH", country: "TH", name: "ไทย" },
	{ code: "tk_tm", label: "TK", country: "TM", name: "Türkmen" },
	{ code: "tl_ph", label: "TL", country: "PH", name: "Filipino" },
	{ code: "tr_tr", label: "TR", country: "TR", name: "Türkçe" },
	{ code: "uk_ua", label: "UK", country: "UA", name: "Українська" },
	{ code: "ur_pk", label: "UR", country: "PK", name: "اردو" },
	{ code: "uz_uz", label: "UZ", country: "UZ", name: "Oʻzbekcha" },
	{ code: "vi_vn", label: "VI", country: "VN", name: "Tiếng Việt" },
	{ code: "yo_ng", label: "YO", country: "NG", name: "Yorùbá" },
	{ code: "zh-CN_cn", label: "ZH", country: "CN", name: "中文 (简体)" },
	{ code: "zh-TW_tw", label: "ZH", country: "TW", name: "中文 (繁體)" },
	{ code: "zu_za", label: "ZU", country: "ZA", name: "isiZulu" },
];

const Languages = () => {
	const { t } = useLang();
	const [hoveredCountry, setHoveredCountry] = useState(null);
	const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: "" });

	// Group languages by country
	const countryLanguages = LANG_OPTIONS.reduce((acc, lang) => {
		if (!acc[lang.country]) {
			acc[lang.country] = [];
		}
		acc[lang.country].push(lang);
		return acc;
	}, {});

	const handleCountryHover = (event, countryCode) => {
		const languages = countryLanguages[countryCode];
		if (languages) {
			const content = languages.map(lang => `${lang.name} (${lang.label})`).join(", ");
			setTooltip({
				visible: true,
				x: event.clientX + 10,
				y: event.clientY - 10,
				content
			});
			setHoveredCountry(countryCode);
		}
	};

	const handleCountryLeave = () => {
		setTooltip({ visible: false, x: 0, y: 0, content: "" });
		setHoveredCountry(null);
	};

	return (
		<HelmetProvider>
			<Container>
				<Tab title={t("languages.title") || "Portfolio Translator"} />
				<PageTitle title={t("languages.title") || "Portfolio Translator"} />

				<div className="languages-content">
					<section className="languages-intro">
						<h2>Global Accessibility</h2>
						<p>
							My portfolio is available in over <strong>{LANG_OPTIONS.length} languages</strong>, 
							making it accessible to visitors from around the world. This multilingual approach 
							demonstrates my commitment to inclusivity and global reach in software development.
						</p>
						
						<div className="language-stats">
							<div className="stat-item">
								<h3>{LANG_OPTIONS.length}</h3>
								<p>Languages Supported</p>
							</div>
							<div className="stat-item">
								<h3>{Object.keys(countryLanguages).length}</h3>
								<p>Countries Represented</p>
							</div>
							<div className="stat-item">
								<h3>6</h3>
								<p>Continents Covered</p>
							</div>
						</div>
					</section>

					<section className="language-features">
						<h2>Features</h2>
						<ul>
							<li><strong>Real-time Translation:</strong> Switch languages instantly with the language selector</li>
							<li><strong>URL-based Language:</strong> Language preferences are preserved in the URL</li>
							<li><strong>Native Script Support:</strong> Proper rendering of scripts like Arabic, Chinese, Hindi, and more</li>
							<li><strong>Cultural Sensitivity:</strong> Translations consider cultural context, not just literal meanings</li>
							<li><strong>SEO Optimized:</strong> Each language variant is optimized for search engines</li>
						</ul>
					</section>

					<section className="language-grid">
						<h2>Supported Languages</h2>
						<div className="languages-grid">
							{LANG_OPTIONS.map((lang) => (
								<div key={lang.code} className="language-card">
									<ReactCountryFlag 
										countryCode={lang.country}
										svg
										style={{ width: '2em', height: '1.5em' }}
										className="language-flag"
									/>
									<div className="language-info">
										<span className="language-label">{lang.label}</span>
										<span className="language-name">{lang.name}</span>
									</div>
								</div>
							))}
						</div>
					</section>

					<section className="interactive-map-section">
						<h2>Interactive Country Map</h2>
						<p>Hover over countries below to see their supported languages:</p>
						<div className="country-map">
							{Object.keys(countryLanguages).map((country) => (
								<div
									key={country}
									className={`country-item ${hoveredCountry === country ? 'hovered' : ''}`}
									onMouseEnter={(e) => handleCountryHover(e, country)}
									onMouseLeave={handleCountryLeave}
								>
									<ReactCountryFlag 
										countryCode={country}
										svg
										style={{ width: '3em', height: '2em' }}
									/>
									<span className="country-code">{country}</span>
									<span className="language-count">
										{countryLanguages[country].length} language{countryLanguages[country].length > 1 ? 's' : ''}
									</span>
								</div>
							))}
						</div>
					</section>
				</div>

				{tooltip.visible && (
					<div 
						className="country-tooltip"
						style={{
							position: 'fixed',
							left: tooltip.x,
							top: tooltip.y,
							zIndex: 1000
						}}
					>
						{tooltip.content}
					</div>
				)}
			</Container>
		</HelmetProvider>
	);
};

export default Languages;
