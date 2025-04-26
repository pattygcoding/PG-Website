import React, { createContext, useContext, useState } from "react";
import am_et from "@/assets/lang/am_et.json";
import ar_sa from "@/assets/lang/ar_sa.json";
import az_az from "@/assets/lang/az_az.json";
import be_by from "@/assets/lang/be_by.json";
import bg_bg from "@/assets/lang/bg_bg.json";
import bn_bd from "@/assets/lang/bn_bd.json";
import bs_ba from "@/assets/lang/bs_ba.json";
import ca_ad from "@/assets/lang/ca_ad.json";
import zh_CN_cn from "@/assets/lang/zh-CN_cn.json";
import cs_cz from "@/assets/lang/cs_cz.json";
import cy_gb from "@/assets/lang/cy_gb.json";
import da_dk from "@/assets/lang/da_dk.json";
import de_de from "@/assets/lang/de_de.json";
import dv_mv from "@/assets/lang/dv_mv.json";
import el_gr from "@/assets/lang/el_gr.json";
import en_us from "@/assets/lang/en_us.json";
import es_mx from "@/assets/lang/es_mx.json";
import et_ee from "@/assets/lang/et_ee.json";
import fa_ir from "@/assets/lang/fa_ir.json";
import fi_fi from "@/assets/lang/fi_fi.json";
import fr_fr from "@/assets/lang/fr_fr.json";
import ga_ie from "@/assets/lang/ga_ie.json";
import hi_in from "@/assets/lang/hi_in.json";
import hr_hr from "@/assets/lang/hr_hr.json";
import ht_ht from "@/assets/lang/ht_ht.json";
import hu_hu from "@/assets/lang/hu_hu.json";
import hy_am from "@/assets/lang/hy_am.json";
import id_id from "@/assets/lang/id_id.json";
import is_is from "@/assets/lang/is_is.json";
import it_it from "@/assets/lang/it_it.json";
import ja_jp from "@/assets/lang/ja_jp.json";
import ka_ge from "@/assets/lang/ka_ge.json";
import kk_kz from "@/assets/lang/kk_kz.json";
import km_kh from "@/assets/lang/km_kh.json";
import kn_in from "@/assets/lang/kn_in.json";
import ko_kr from "@/assets/lang/ko_kr.json";
import ky_kg from "@/assets/lang/ky_kg.json";
import lb_lu from "@/assets/lang/lb_lu.json";
import lo_la from "@/assets/lang/lo_la.json";
import lt_lt from "@/assets/lang/lt_lt.json";
import lv_lv from "@/assets/lang/lv_lv.json";
import mg_mg from "@/assets/lang/mg_mg.json";
import mn_mn from "@/assets/lang/mn_mn.json";
import mr_in from "@/assets/lang/mr_in.json";
import ms_my from "@/assets/lang/ms_my.json";
import mt_mt from "@/assets/lang/mt_mt.json";
import my_mm from "@/assets/lang/my_mm.json";
import ne_np from "@/assets/lang/ne_np.json";
import nl_nl from "@/assets/lang/nl_nl.json";
import no_no from "@/assets/lang/no_no.json";
import pl_pl from "@/assets/lang/pl_pl.json";
import pt_br from "@/assets/lang/pt_br.json";
import ro_md from "@/assets/lang/ro_md.json";
import ro_ro from "@/assets/lang/ro_ro.json";
import ru_ru from "@/assets/lang/ru_ru.json";
import si_lk from "@/assets/lang/si_lk.json";
import sk_sk from "@/assets/lang/sk_sk.json";
import sl_si from "@/assets/lang/sl_si.json";
import so_so from "@/assets/lang/so_so.json";
import sq_al from "@/assets/lang/sq_al.json";
import sr_rs from "@/assets/lang/sr_rs.json";
import st_ls from "@/assets/lang/st_ls.json";
import sv_se from "@/assets/lang/sv_se.json";
import sw_tz from "@/assets/lang/sw_tz.json";
import ta_in from "@/assets/lang/ta_in.json";
import te_in from "@/assets/lang/te_in.json";
import tg_tj from "@/assets/lang/tg_tj.json";
import th_th from "@/assets/lang/th_th.json";
import tk_tm from "@/assets/lang/tk_tm.json";
import tr_tr from "@/assets/lang/tr_tr.json";
import uk_ua from "@/assets/lang/uk_ua.json";
import ur_pk from "@/assets/lang/ur_pk.json";
import uz_uz from "@/assets/lang/uz_uz.json";
import vi_vn from "@/assets/lang/vi_vn.json";

const languageFiles = {
	am_et,
	ar_sa,
	az_az,
	be_by,
	bg_bg,
	bn_bd,
	bs_ba,
	ca_ad,
	zh_CN_cn,
	cs_cz,
	cy_gb,
	da_dk,
	de_de,
	dv_mv,
	el_gr,
	en_us,
	es_mx,
	et_ee,
	fa_ir,
	fi_fi,
	fr_fr,
	ga_ie,
	hi_in,
	hr_hr,
	ht_ht,
	hu_hu,
	hy_am,
	id_id,
	is_is,
	it_it,
	ja_jp,
	ka_ge,
	kk_kz,
	km_kh,
	kn_in,
	ko_kr,
	ky_kg,
	lb_lu,
	lo_la,
	lt_lt,
	lv_lv,
	mg_mg,
	mn_mn,
	mr_in,
	ms_my,
	mt_mt,
	my_mm,
	ne_np,
	nl_nl,
	no_no,
	pl_pl,
	pt_br,
	ro_md,
	ro_ro,
	ru_ru,
	si_lk,
	sk_sk,
	sl_si,
	so_so,
	sq_al,
	sr_rs,
	st_ls,
	sv_se,
	sw_tz,
	ta_in,
	te_in,
	tg_tj,
	th_th,
	tk_tm,
	tr_tr,
	uk_ua,
	ur_pk,
	uz_uz,
	vi_vn,
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
