import React, { Suspense, lazy, useEffect, useRef } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { SocialMedia } from "@/components/social-media";

// Lazy-load all page components so heavy deps (react-simple-maps, prismjs,
// large JSON data) are split into separate chunks.
const Home = lazy(() => import("@/pages/home/Home"));
const About = lazy(() => import("@/pages/about/About"));
const Portfolio = lazy(() => import("@/pages/portfolio/Portfolio"));
const Contact = lazy(() => import("@/pages/contact/Contact"));
const ErrorPage = lazy(() => import("@/pages/error/Error"));
const Tiger = lazy(() => import("@/pages/projects/tiger/Tiger"));
const Languages = lazy(() => import("@/pages/projects/languages/Languages"));
const Formatter = lazy(() => import("@/pages/projects/formatter/Formatter"));
const Snake = lazy(() => import("@/pages/projects/snake/Snake"));

function AppRoutes() {
	const { pathname } = useLocation();
	const previousPath = useRef(pathname);
	const contentRef = useRef(null);

	useEffect(() => {
		if (previousPath.current === pathname) return;
		previousPath.current = pathname;
		const timeout = window.setTimeout(() => contentRef.current?.focus({ preventScroll: true }), 0);
		return () => window.clearTimeout(timeout);
	}, [pathname]);

	return (
		<div className="s_c" id="main-content" tabIndex={-1} ref={contentRef}>
			<Suspense fallback={<div role="status" className="visually-hidden">Loading page...</div>}>
				<Routes>
					<Route exact path="/" element={<Home />} />
					<Route path="/about" element={<About />} />
					<Route path="/portfolio" element={<Portfolio />} />
					<Route path="/contact" element={<Contact />} />
					<Route path="/error" element={<ErrorPage />} />
					<Route path="/tiger" element={<Tiger />} />
					<Route path="/snake" element={<Snake />} />
					<Route path="/languages" element={<Languages />} />
					<Route path="/formatter" element={<Formatter />} />
					<Route path="*" element={<Home />} />
				</Routes>
			</Suspense>
			<SocialMedia />
		</div>
	);
}

export default AppRoutes;
