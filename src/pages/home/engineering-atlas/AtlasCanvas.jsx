import { useEffect, useRef } from "react";
import { ATLAS_PROJECTS, ATLAS_CONNECTIONS } from "./atlasModel";

const pointOnCurve = (start, control, end, progress) => ({
    x: (1 - progress) ** 2 * start.x + 2 * (1 - progress) * progress * control.x + progress ** 2 * end.x,
    y: (1 - progress) ** 2 * start.y + 2 * (1 - progress) * progress * control.y + progress ** 2 * end.y,
});

export default function AtlasCanvas({ selected, visibleIds, paused }) {
    const canvasRef = useRef(null);
    const stateRef = useRef({ selected, visibleIds, paused });
    const invalidateRef = useRef(() => {});
    useEffect(() => {
        stateRef.current = { selected, visibleIds, paused };
        invalidateRef.current();
    }, [selected, visibleIds, paused]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return undefined;
        const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        let width = 0;
        let height = 0;
        let frame = 0;
        let active = false;
        let phase = 0;
        let lastTime = 0;
        let lastPaint = 0;
        let ink = "";
        let accent = "";
        let muted = "";

        const requestDraw = () => {
            if (active && !frame) frame = requestAnimationFrame(draw);
        };
        const readColors = () => {
            const style = getComputedStyle(canvas);
            ink = style.getPropertyValue("--atlas-ink").trim();
            accent = style.getPropertyValue("--atlas-signal").trim();
            muted = style.getPropertyValue("--atlas-grid").trim();
            requestDraw();
        };
        const resize = () => {
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            readColors();
        };
        const draw = (time) => {
            frame = 0;
            if (!active) return;
            const state = stateRef.current;
            const animated = !state.paused && !motionQuery.matches;
            if (animated) requestDraw();
            if (animated && time - lastPaint < 32) return;
            const delta = lastTime ? Math.min(time - lastTime, 80) : 0;
            lastTime = time;
            lastPaint = time;
            if (animated) phase += delta / 6500;
            context.clearRect(0, 0, width, height);
            context.lineWidth = 1;
            context.strokeStyle = muted;
            for (let column = 16; column < width; column += 32) {
                for (let row = 16; row < height; row += 32) {
                    context.beginPath();
                    context.moveTo(column - 1.5, row);
                    context.lineTo(column + 1.5, row);
                    context.moveTo(column, row - 1.5);
                    context.lineTo(column, row + 1.5);
                    context.stroke();
                }
            }
            const points = Object.fromEntries(ATLAS_PROJECTS.map((project) => [project.id, {
                x: width * project.x / 100,
                y: height * project.y / 100,
            }]));
            ATLAS_CONNECTIONS.forEach((connection, index) => {
                if (!state.visibleIds.includes(connection.source) || !state.visibleIds.includes(connection.target)) return;
                const start = points[connection.source];
                const end = points[connection.target];
                const highlighted = connection.source === state.selected || connection.target === state.selected;
                const hubConnection = connection.family === "portfolio";
                const curvature = hubConnection ? 0 : 0.08;
                const control = {
                    x: (start.x + end.x) / 2 + (end.y - start.y) * curvature,
                    y: (start.y + end.y) / 2 - (end.x - start.x) * curvature,
                };
                context.globalAlpha = highlighted ? 0.85 : 0.07;
                context.strokeStyle = highlighted ? accent : ink;
                context.lineWidth = highlighted ? 2 : 1;
                context.setLineDash(!highlighted && hubConnection ? [5, 9] : []);
                context.beginPath();
                context.moveTo(start.x, start.y);
                context.quadraticCurveTo(control.x, control.y, end.x, end.y);
                context.stroke();
                context.setLineDash([]);
                if (!highlighted) return;
                for (let trail = 0; trail < 12; trail += 1) {
                    const progress = ((phase + index * 0.137 - trail * 0.005) % 1 + 1) % 1;
                    const point = pointOnCurve(start, control, end, progress);
                    context.globalAlpha = (1 - trail / 12) * 0.95;
                    context.fillStyle = accent;
                    context.fillRect(point.x - 2, point.y - 2, trail === 0 ? 5 : 3, trail === 0 ? 5 : 3);
                }
            });
            context.globalAlpha = 1;
        };
        const observer = new ResizeObserver(resize);
        observer.observe(canvas);
        const themeObserver = new MutationObserver(readColors);
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        themeObserver.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
        let intersecting = false;
        const updateActivity = () => {
            const nextActive = intersecting && !document.hidden;
            if (nextActive === active) return;
            active = nextActive;
            cancelAnimationFrame(frame);
            frame = 0;
            lastTime = 0;
            requestDraw();
        };
        const visibilityObserver = new IntersectionObserver(([entry]) => {
            intersecting = entry.isIntersecting;
            updateActivity();
        });
        visibilityObserver.observe(canvas);
        document.addEventListener("visibilitychange", updateActivity);
        motionQuery.addEventListener("change", requestDraw);
        invalidateRef.current = requestDraw;
        resize();
        return () => {
            active = false;
            cancelAnimationFrame(frame);
            observer.disconnect();
            themeObserver.disconnect();
            visibilityObserver.disconnect();
            document.removeEventListener("visibilitychange", updateActivity);
            motionQuery.removeEventListener("change", requestDraw);
            invalidateRef.current = () => {};
        };
    }, []);

    return <canvas ref={canvasRef} className="atlas-canvas" aria-hidden="true" />;
}