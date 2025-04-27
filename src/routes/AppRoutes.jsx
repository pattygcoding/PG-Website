import React from "react";
import { Route, Routes } from "react-router-dom";
import withRouter from "@/hooks/withRouter"
import { Home } from "@/pages/home";
import { Portfolio } from "@/pages/portfolio";
import { Contact } from "@/pages/contact";
import { About } from "@/pages/about";
import { Tiger } from "@/pages/projects/tiger";
import { Formatter } from "@/pages/projects/formatter";
import { CubeSolver } from "@/pages/projects/cube-solver";
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
				<Route path="/formatter" element={<Formatter />} />
				<Route path="/cube_solver" element={<CubeSolver />} />
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
