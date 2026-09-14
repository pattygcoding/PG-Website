import React, { useEffect, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { FiCrosshair, FiMaximize, FiMinus, FiPlus } from "react-icons/fi";
import { ATLAS_PROJECTS, ATLAS_SIZE } from "./atlasModel";

export default function AtlasMap({ children, selected, disabled, labels }) {
    const transformRef = useRef(null);
    const viewportRef = useRef(null);
    const pointerRef = useRef(null);
    const draggedRef = useRef(false);
    const selectedRef = useRef(selected);
    const previousSelectionRef = useRef(selected);
    const [scale, setScale] = useState(1);
    selectedRef.current = selected;

    const centerProject = (api, id) => {
        const project = ATLAS_PROJECTS.find((entry) => entry.id === id);
        const viewport = viewportRef.current;
        if (!project || !viewport || !api) return;
        const nextScale = Math.min(Math.max(0.85, api.instance.transformState.scale), (viewport.clientWidth - 32) / 190);
        api.setTransform(viewport.clientWidth / 2 - project.x / 100 * ATLAS_SIZE.width * nextScale,
            viewport.clientHeight / 2 - project.y / 100 * ATLAS_SIZE.height * nextScale, nextScale, 0);
    };
    const fitAll = (api) => {
        const viewport = viewportRef.current;
        if (!api || !viewport) return;
        const nextScale = Math.min(viewport.clientWidth / ATLAS_SIZE.width, viewport.clientHeight / ATLAS_SIZE.height) * 0.96;
        api.centerView(nextScale, 0);
    };

    useEffect(() => {
        if (!disabled && previousSelectionRef.current !== selected) centerProject(transformRef.current, selected);
        previousSelectionRef.current = selected;
    }, [selected, disabled]);

    useEffect(() => {
        if (disabled || !viewportRef.current) return undefined;
        let previousWidth = viewportRef.current.clientWidth;
        const observer = new ResizeObserver(([entry]) => {
            if (Math.abs(entry.contentRect.width - previousWidth) < 1) return;
            previousWidth = entry.contentRect.width;
            centerProject(transformRef.current, selectedRef.current);
        });
        observer.observe(viewportRef.current);
        return () => observer.disconnect();
    }, [disabled]);

    if (disabled) return children;

    return (
        <div className="atlas-map-viewport" ref={viewportRef} tabIndex={0} role="group" aria-label={labels.map_navigation}
            onKeyDown={(event) => {
                if (event.target !== event.currentTarget || !transformRef.current) return;
                const api = transformRef.current;
                const state = api.instance.transformState;
                const directions = { ArrowLeft: [80, 0], ArrowRight: [-80, 0], ArrowUp: [0, 80], ArrowDown: [0, -80] };
                if (directions[event.key]) {
                    event.preventDefault();
                    const [horizontal, vertical] = directions[event.key];
                    api.setTransform(state.positionX + horizontal, state.positionY + vertical, state.scale, 0);
                } else if (event.key === "+" || event.key === "=") { event.preventDefault(); api.zoomIn(0.2, 0); }
                else if (event.key === "-") { event.preventDefault(); api.zoomOut(0.2, 0); }
                else if (event.key === "Home") { event.preventDefault(); fitAll(api); }
            }}>
            <TransformWrapper ref={transformRef} minScale={0.1} maxScale={2} initialScale={0.85}
                limitToBounds centerZoomedOut
                panning={{ velocityDisabled: true }} wheel={{ step: 0.12 }}
                doubleClick={{ disabled: true }} alignmentAnimation={{ disabled: true }}
                onInit={(api) => viewportRef.current?.clientWidth < 600 ? centerProject(api, selectedRef.current) : fitAll(api)}
                onTransformed={(_, state) => setScale(state.scale)}
                onPinchingStart={() => { draggedRef.current = true; }}>
                {({ zoomIn, zoomOut }) => <>
                    <TransformComponent wrapperClass="atlas-pan-wrapper" contentClass="atlas-pan-content">
                        <div className="atlas-world" style={{ width: ATLAS_SIZE.width, height: ATLAS_SIZE.height }}
                            onPointerDown={(event) => {
                                pointerRef.current = { x: event.clientX, y: event.clientY };
                                draggedRef.current = false;
                            }}
                            onPointerMove={(event) => {
                                if (pointerRef.current && Math.hypot(event.clientX - pointerRef.current.x, event.clientY - pointerRef.current.y) > 5) draggedRef.current = true;
                            }}
                            onPointerUp={() => { pointerRef.current = null; }}
                            onPointerCancel={() => { pointerRef.current = null; draggedRef.current = true; }}
                            onClickCapture={(event) => {
                                if (draggedRef.current && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); }
                            }}
                            onFocusCapture={(event) => {
                                const node = event.target.closest("[data-project-id]");
                                if (node && node.matches(":focus-visible")) centerProject(transformRef.current, node.dataset.projectId);
                            }}>
                            {children}
                        </div>
                    </TransformComponent>
                    <div className="atlas-map-controls" role="group" aria-label={labels.map_navigation}>
                        <button type="button" title={labels.zoom_out} aria-label={labels.zoom_out} disabled={scale <= 0.101} onClick={() => zoomOut(0.2, 0)}><FiMinus aria-hidden="true" /></button>
                        <output aria-label={labels.zoom_level}>{Math.round(scale * 100)}%</output>
                        <button type="button" title={labels.zoom_in} aria-label={labels.zoom_in} disabled={scale >= 1.999} onClick={() => zoomIn(0.2, 0)}><FiPlus aria-hidden="true" /></button>
                        <button type="button" title={labels.fit_all} aria-label={labels.fit_all} onClick={() => fitAll(transformRef.current)}><FiMaximize aria-hidden="true" /></button>
                        <button type="button" title={labels.center_selected} aria-label={labels.center_selected} onClick={() => centerProject(transformRef.current, selected)}><FiCrosshair aria-hidden="true" /></button>
                    </div>
                </>}
            </TransformWrapper>
        </div>
    );
}