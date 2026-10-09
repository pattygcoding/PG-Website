import React from "react";
import { useLocation } from "react-router-dom";
import { LangAwareLink } from "@/components/lang-aware-link";
import { VscArrowRight } from "react-icons/vsc";
import "./MenuItem.css";

const MenuItem = ({
	to,
	index,
	label,
	desc,
	tag,
	icon: Icon,
	onClick,
	isSubmenu = false,
	isActive: manualActive,
	isButton = false,
	children,
}) => {
	const location = useLocation();
	const isActive =
		manualActive !== undefined
			? manualActive
			: to && to !== "#" && location.pathname === to;

	const content = (
		<div className={`tech__menu_item_inner ${isActive ? "active" : ""}`}>
			<div className="tech__menu_item_left">
				{index && <span className="tech__item_index">{index}</span>}
				{Icon && (
					<span className="tech__item_icon">
						<Icon />
					</span>
				)}
				<div className="tech__item_text_group">
					<span className="tech__item_label">{label}</span>
					{desc && <span className="tech__item_desc">{desc}</span>}
				</div>
			</div>
			<div className="tech__menu_item_right">
				{tag && <span className="tech__item_tag">{tag}</span>}
				{children}
				{!children && <VscArrowRight className="tech__item_arrow" />}
			</div>
		</div>
	);

	if (isButton) {
		return (
			<li className={`menu_item tech__menu_item ${isSubmenu ? "is-submenu" : ""}`}>
				<button
					type="button"
					className={`tech__menu_link tech__menu_btn ${isActive ? "is-active" : ""}`}
					onClick={onClick}
				>
					{content}
				</button>
			</li>
		);
	}

	return (
		<li className={`menu_item tech__menu_item ${isSubmenu ? "is-submenu" : ""}`}>
			<LangAwareLink
				to={to}
				className={`tech__menu_link ${isActive ? "is-active" : ""}`}
				onClick={onClick}
			>
				{content}
			</LangAwareLink>
		</li>
	);
};

export default MenuItem;
