import React from "react";
import { Route, Routes } from "react-router-dom";
import withRouter from "@/hooks/withRouter"
import { Home } from "@/pages/home";
import Portfolio  from "@/pages/portfolio/Portfolio";
import { Contact } from "@/pages/contact";
import { About } from "@/pages/about";
import { Tiger } from "@/pages/tiger";
import { SocialMedia } from "@/components/social-media";
import { CSSTransition, TransitionGroup } from "react-transition-group";

const AnimatedRoutes = withRouter(({ location }) => (
	<TransitionGroup>
		<CSSTransition
			key={location.key}
			timeout={{
				enter: 400,
				exit: 400,
			}}
			classNames="page"
			unmountOnExit
		>
			<Routes location={location}>
				<Route exact path="/" element={<Home />} />
				<Route path="/about" element={<About />} />
				<Route path="/portfolio" element={<Portfolio />} />
				<Route path="/contact" element={<Contact />} />
				<Route path="/tiger" element={<Tiger />} />
				<Route path="*" element={<Home />} />
			</Routes>
		</CSSTransition>
	</TransitionGroup>
));

function AppRoutes() {
	return (
		<div className="s_c">
			<AnimatedRoutes />
			<SocialMedia />
		</div>
	);
}

export default AppRoutes;
