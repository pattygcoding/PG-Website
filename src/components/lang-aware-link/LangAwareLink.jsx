// components/LangAwareLink.jsx
import React from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

const LangAwareLink = ({ to, ...props }) => {
	const [searchParams] = useSearchParams();
	const lang = searchParams.get("lang");
	const location = useLocation();

	// Convert 'to' into a string with lang param
	const getToWithLang = () => {
		if (typeof to === "string") {
			const url = new URL(to, "http://dummy"); // dummy base
			if (lang) {
				url.searchParams.set("lang", lang);
			}
			return url.pathname + url.search;
		}
		if (typeof to === "object") {
			const newSearchParams = new URLSearchParams(to.search || location.search);
			if (lang) {
				newSearchParams.set("lang", lang);
			}
			return {
				...to,
				search: newSearchParams.toString(),
			};
		}
		return to;
	};

	return <Link to={getToWithLang()} {...props} />;
};

export default LangAwareLink;
