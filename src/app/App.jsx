import React, { useLayoutEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
	BrowserRouter as Router,
	useLocation,
} from "react-router-dom";
import withRouter from "../hooks/withRouter";
import { AppRoutes } from "@/routes";
import { Menu } from "@/menu";
import ThemeBackground from "../components/theme-background/ThemeBackground";
import "./App.css";

function _ScrollToTop(props) {
	const { pathname } = useLocation();
	useLayoutEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: "instant" });
	}, [pathname]);
	return props.children;
}
const ScrollToTop = withRouter(_ScrollToTop);

export default function App() {
	return (
		<Router basename={process.env.PUBLIC_URL}>
			<ThemeBackground />
			<a className="visually-hidden-focusable skip-link" href="#main-content">Skip to main content</a>
			<ScrollToTop>
				<Menu />
				<AppRoutes />
			</ScrollToTop>
		</Router>
	);
}
