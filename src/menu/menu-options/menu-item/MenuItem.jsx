import React from "react";
import { Link } from "react-router-dom";
import "./MenuItem.css";

const MenuItem = ({ to, label, onClick }) => (
	<li className="menu_item">
		<Link to={to} className="my-3" onClick={onClick}>
			{label}
		</Link>
	</li>
);

export default MenuItem;
