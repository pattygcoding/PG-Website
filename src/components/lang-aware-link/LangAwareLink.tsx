// components/LangAwareLink.jsx
import React from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import type { Path } from "react-router-dom";
import type { AnchorHTMLAttributes, ReactNode } from "react";

// A project that lives on another host leaves the app entirely, so an absolute URL
// renders as a plain anchor in a new tab. Everything else stays an in-app route,
// which is the whole point of this component: it keeps the active ?lang= param.
interface LangAwareLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
	to: string | Partial<Path>;
	children?: ReactNode;
}

const isExternal = (to: LangAwareLinkProps["to"]): to is string => typeof to === "string" && /^https?:\/\//i.test(to);

const LangAwareLink = ({ to, ...props }: LangAwareLinkProps) => {
	const [searchParams] = useSearchParams();
	const lang = searchParams.get("lang");
	const location = useLocation();

	if (isExternal(to)) {
		return <a href={to} target="_blank" rel="noopener noreferrer" {...props} />;
	}

	// Convert 'to' into a string with lang param
	const getToWithLang = (): string | Partial<Path> => {
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
