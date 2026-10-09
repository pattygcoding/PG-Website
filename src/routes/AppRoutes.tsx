import React, { Suspense, lazy, useEffect, useRef } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { SocialMedia } from "@/components/social-media";
import links from "@/assets/links/links.json";

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

// The arcade projects now live on their own subdomain, so their old on-site
// routes redirect there. window.location.replace is used instead of <Navigate>
// because history.pushState cannot cross origins. Kept in sync with the stubs
// built by scripts/generate-redirects.js.
const arcadeRedirects = (Object.keys(links.arcade) as Array<keyof typeof links.arcade>)
	.filter((key) => key !== "home")
	.map((key) => ({ path: `/${key}`, to: links.arcade[key] }));

function ArcadeRedirect({ to }: { to: string }) {
	useEffect(() => {
		window.location.replace(to);
	}, [to]);
	return <p className="visually-hidden">Redirecting to <a href={to}>{to}</a></p>;
}

function AppRoutes() {
	const { pathname } = useLocation();
	const previousPath = useRef(pathname);
	const contentRef = useRef<HTMLDivElement>(null);

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
					<Route path="/" element={<Home />} />
					<Route path="/about" element={<About />} />
					<Route path="/portfolio" element={<Portfolio />} />
					<Route path="/contact" element={<Contact />} />
					<Route path="/error" element={<ErrorPage />} />
					<Route path="/tiger" element={<Tiger />} />
					<Route path="/languages" element={<Languages />} />
					<Route path="/formatter" element={<Formatter />} />
					{arcadeRedirects.map(({ path: routePath, to }) => <Route key={routePath} path={routePath} element={<ArcadeRedirect to={to} />} />)}
					<Route path="*" element={<Home />} />
				</Routes>
			</Suspense>
			<SocialMedia />
		</div>
	);
}

export default AppRoutes;
