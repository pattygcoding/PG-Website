import React from "react";
import { LangAwareLink } from "@/components/lang-aware-link";
import "./MenuItem.css";

const MenuItem = ({ to, label, onClick }) => (
	<li className="menu_item">
		<LangAwareLink to={to} className="my-3" onClick={onClick}>
			{label}
		</LangAwareLink>
	</li>
);

export default MenuItem;
