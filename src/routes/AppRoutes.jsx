import React, { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import withRouter from "@/hooks/withRouter"
import { SocialMedia } from "@/components/social-media";
import { CSSTransition, TransitionGroup } from "react-transition-group";

// Lazy-load all page components so heavy deps (three.js, react-simple-maps,
// prismjs, cubejs, large JSON data) are split into separate chunks.
const Home = lazy(() => import("@/pages/home/Home"));
const About = lazy(() => import("@/pages/about/About"));
const Portfolio = lazy(() => import("@/pages/portfolio/Portfolio"));
const Contact = lazy(() => import("@/pages/contact/Contact"));
const Tiger = lazy(() => import("@/pages/projects/tiger/Tiger"));
const Languages = lazy(() => import("@/pages/projects/languages/Languages"));
const Formatter = lazy(() => import("@/pages/projects/formatter/Formatter"));
const CubeSolver = lazy(() => import("@/pages/projects/cube-solver/CubeSolver"));

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
			<Suspense fallback={<div />}>
				<Routes location={location}>
					<Route exact path="/" element={<Home />} />
					<Route path="/about" element={<About />} />
					<Route path="/portfolio" element={<Portfolio />} />
					<Route path="/contact" element={<Contact />} />
					<Route path="/tiger" element={<Tiger />} />
					<Route path="/languages" element={<Languages />} />
					<Route path="/formatter" element={<Formatter />} />
					<Route path="/cube_solver" element={<CubeSolver />} />
					<Route path="*" element={<Home />} />
				</Routes>
			</Suspense>
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
