import React, { useEffect, useRef, useState } from "react";
import "./ThemeBackground.css";

const stars = Array.from({ length: 360 }, (_, index) => {
    const radius = 4 + Math.pow((index * 0.618034) % 1, 0.85) * 45;
    const angle = index % 3 === 0
        ? index * 2.39996
        : radius * 0.15 + (index % 2) * Math.PI + Math.sin(index * 7.31) * 0.45;
    const horizontal = 50 + Math.cos(angle) * radius;
    const vertical = 50 + Math.sin(angle) * radius;

    return {
        "--star-x": `${horizontal}%`,
        "--star-y": `${vertical}%`,
        "--star-size": `${index % 17 === 0 ? 6 : index % 4 === 0 ? 4 : 2.5}px`,
        "--star-opacity": 0.4 + (index % 6) / 10,
        "--star-delay": `${(index % 11) * -1.3}s`,
        "--star-duration": `${5 + (index % 5)}s`,
    };
});

export default function ThemeBackground() {
    const [compactScene, setCompactScene] = useState(() => window.matchMedia("(max-width: 800px), (pointer: coarse)").matches);

    useEffect(() => {
        const media = window.matchMedia("(max-width: 800px), (pointer: coarse)");
        const update = () => setCompactScene(media.matches);
        media.addEventListener("change", update);
        update();
        return () => media.removeEventListener("change", update);
    }, []);

    return <AnimatedThemeBackground compact={compactScene} />;
}

function AnimatedThemeBackground({ compact }) {
    const atmosphereRef = useRef(null);

    useEffect(() => {
        const atmosphere = atmosphereRef.current;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        let frame = null;
        let previousTime = null;
        let current = 0;
        let target = 0;
        let settleTimer;

        const settleTheme = () => {
            atmosphere.dataset.restingTheme = document.documentElement.dataset.theme || "dark";
        };
        const transitionTheme = () => {
            window.clearTimeout(settleTimer);
            delete atmosphere.dataset.restingTheme;
            if (reducedMotion.matches) settleTheme();
            else settleTimer = window.setTimeout(settleTheme, 1800);
        };
        const themeObserver = new MutationObserver(transitionTheme);
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        settleTheme();

        const paint = () => atmosphere.style.setProperty("--scroll-depth", `${current.toFixed(2)}px`);
        const animate = (time) => {
            const elapsed = previousTime === null ? 16 : Math.min(time - previousTime, 64);
            previousTime = time;
            current += (target - current) * (1 - Math.exp(-elapsed / 180));
            if (Math.abs(target - current) < 0.05) {
                current = target;
                frame = null;
                previousTime = null;
            } else {
                frame = window.requestAnimationFrame(animate);
            }
            paint();
        };
        const update = () => {
            if (reducedMotion.matches || document.hidden) {
                window.cancelAnimationFrame(frame);
                frame = null;
                previousTime = null;
                if (reducedMotion.matches) {
                    current = 0;
                    paint();
                }
                return;
            }
            target = Math.min(240, Math.log1p(Math.max(0, window.scrollY) / Math.max(1, window.innerHeight)) * 90);
            if (frame === null) frame = window.requestAnimationFrame(animate);
        };

        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        document.addEventListener("visibilitychange", update);
        reducedMotion.addEventListener("change", update);
        update();
        return () => {
            themeObserver.disconnect();
            window.clearTimeout(settleTimer);
            window.cancelAnimationFrame(frame);
            window.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
            document.removeEventListener("visibilitychange", update);
            reducedMotion.removeEventListener("change", update);
        };
    }, []);

    return (
        <div className="theme-atmosphere" aria-hidden="true" ref={atmosphereRef}>
            <div className="theme-atmosphere__night" />
            <div
                className="theme-atmosphere__day"
                style={{ "--cloud-texture": `url("${process.env.PUBLIC_URL}/assets/images/cirrus-clouds.jpg")` }}
            >
                <div className="theme-atmosphere__beach" />
                <div className="theme-atmosphere__sunlight" />
                <div className="theme-atmosphere__sun" />
                <div className="theme-atmosphere__clouds theme-atmosphere__clouds--distant">
                    <span className="theme-atmosphere__cloud" />
                    <span className="theme-atmosphere__cloud" />
                </div>
                <div className="theme-atmosphere__clouds theme-atmosphere__clouds--near">
                    <span className="theme-atmosphere__cloud" />
                </div>
                <div className="theme-atmosphere__horizon" />
            </div>
            <div className="theme-atmosphere__orbit">
                <div
                    className="theme-atmosphere__galaxy"
                    style={{ backgroundImage: `url("${process.env.PUBLIC_URL}/assets/images/galaxy-m101.jpg")` }}
                />
                {["distant", "near"].map((depth, layer) => (
                    <div className={`theme-atmosphere__stars theme-atmosphere__stars--${depth}`} key={depth}>
                        {stars.map((style, index) => index % 2 === layer && (!compact || index % 10 < 2) && (
                            <span className="theme-atmosphere__star" style={style} key={index}>
                                <span className={index % 17 === 0 ? "is-bright" : undefined} />
                            </span>
                        ))}
                    </div>
                ))}
            </div>
            <div className="theme-atmosphere__meteors">
                <span />
                <span />
            </div>
            <div className="theme-atmosphere__veil" />
        </div>
    );
}