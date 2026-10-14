import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiGlobe, FiMinus, FiPlus, FiRefreshCw, FiType, FiZap } from "react-icons/fi";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import type { CssVariables } from "@/types/css";
import ReactCountryFlag from "react-country-flag";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { TransformWrapper, TransformComponent, useTransformEffect } from "react-zoom-pan-pinch";
import type { GeoProjection } from "d3-geo";
import langMapData from "@/assets/maps/lang_map.json";
import islandMarkers from "@/assets/maps/island_markers.json";
import {
    LABEL_FONT_PX,
    LABEL_ISLAND_MIN_SCALE,
    MAP_HEIGHT,
    MAP_WIDTH,
    isCountryLabelVisible,
    labelFontSizeForScale,
    labelPointFor,
    pixelsPerMapUnit,
    quantizeLabelScale,
} from "./mapLabels";
import "@/components/page-shell/PageShell.css";
import "./LanguageAtlas.css";

interface CountryLanguage { code: string; name: string; nativeName: string; iso: string; country: string; }
interface CountryRecord { name: string; iso2: string; iso3: string; languages: string[]; }
interface LanguageRecord { name: string; nativeName: string; iso: string; country: string; }
// react-simple-maps 5 types GeoJSON `properties` as Record<string, unknown> | null.
interface GeoFeature { properties?: Record<string, unknown> | null; rsmKey?: string; geometry?: unknown; }
interface IslandMarker { code: string; name: string; }

// react-simple-maps types the render prop's `path` as the path-string generator,
// but it hands over a full d3.geoPath instance, which also measures shapes.
type GeoPathExtras = {
    area: (object: unknown) => number;
};

const COUNTRIES = langMapData.countries as Record<string, CountryRecord>;
const LANGUAGES = langMapData.languages as Record<string, LanguageRecord>;
const COUNTRY_NAME_MAPPING = langMapData.countryNameMapping as Record<string, string>;

// Group languages by country for easy lookup (filtering out any unmapped or missing language codes)
const countryLanguages = Object.keys(COUNTRIES).reduce<Record<string, CountryLanguage[]>>((acc, countryCode) => {
    const country = COUNTRIES[countryCode];
    acc[countryCode] = (country.languages || [])
        .map((langCode) => {
            const langObj = LANGUAGES[langCode];
            if (!langObj) return null;
            return {
                code: langCode,
                ...langObj
            };
        })
        .filter((entry): entry is CountryLanguage => entry !== null);
    return acc;
}, {});

// Islands are drawn as dots rather than shapes and named by the marker layer, so the
// country layer skips them — otherwise Kiribati, which straddles the antimeridian,
// would be labelled at the far edge of the map as well as on its marker.
const ISLAND_MARKER_CODES = new Set(islandMarkers.map((marker) => marker.code));

// A TopoJSON feature can carry its name under several different keys.
const getGeoName = (geo: GeoFeature): string | null => {
    const name = geo.properties?.NAME ?? geo.properties?.NAME_EN ?? geo.properties?.name ?? geo.properties?.ADMIN;
    return typeof name === "string" ? name : null;
};

const resolveCountryISO2 = (geoOrName: string | GeoFeature | null | undefined): string | null => {
    if (!geoOrName) return null;
    const countryName = typeof geoOrName === "string"
        ? geoOrName
        : getGeoName(geoOrName);

    if (!countryName) return null;

    if (COUNTRY_NAME_MAPPING[countryName]) {
        return COUNTRY_NAME_MAPPING[countryName];
    }

    const variations = [
        countryName.replace(/\s+/g, ''),
        countryName.replace(' and ', ' & '),
        countryName.replace(' & ', ' and '),
        countryName.replace('Rep.', 'Republic'),
        countryName.replace('Republic', 'Rep.'),
        countryName.replace('Democratic Republic of the', 'DRC'),
        countryName.replace('United States', 'USA'),
        countryName.replace('United Kingdom', 'UK')
    ];

    for (const variation of variations) {
        if (COUNTRY_NAME_MAPPING[variation]) {
            return COUNTRY_NAME_MAPPING[variation];
        }
    }

    // Direct lookup by ISO2 code if countryName matches a code
    const upper = countryName.toUpperCase();
    if (COUNTRIES[upper]) return upper;

    // Search by country name in COUNTRIES object
    for (const [code, c] of Object.entries(COUNTRIES)) {
        if (c.name && c.name.toLowerCase() === countryName.toLowerCase()) {
            return code;
        }
    }

    return null;
};

// Country names are drawn inside the map so that they pan and zoom with it, while
// the caller converts LABEL_FONT_PX into map units to keep their on-screen size
// constant. The halo (paint-order, see LanguageAtlas.css) keeps them readable over
// land and sea alike, and they never swallow pointer events meant for the country.
const CountryLabelText = ({ text, fontSize, offset = 0 }: { text: string; fontSize: number; offset?: number }) => (
    <text
        className="map-country-label-text"
        aria-hidden="true"
        textAnchor="middle"
        dominantBaseline="central"
        y={offset}
        style={{ fontSize, strokeWidth: fontSize * 0.3 }}
    >
        {text}
    </text>
);

type LabelAnchor = { x: number; y: number; text: string; key: string };

/**
 * Anchor and text for a country's label, or null when the shape has no usable name
 * or its centre falls outside the map canvas. `labelPointFor` explains how the
 * anchor itself is chosen.
 */
const labelAnchorFor = (
    geo: GeoFeature,
    projection: GeoProjection,
    anchorCache: WeakMap<object, LabelAnchor | null>
): LabelAnchor | null => {
    const cached = anchorCache.get(geo as object);
    if (cached !== undefined) return cached;

    const iso2 = resolveCountryISO2(geo);
    const point = labelPointFor(geo.geometry, projection);
    // Prefer the name used elsewhere on the page: it is shorter than some TopoJSON
    // names ("United States" rather than "United States of America").
    const text = (iso2 ? COUNTRIES[iso2]?.name : "") || getGeoName(geo) || "";
    const onCanvas = point !== null && point[0] >= 0 && point[0] <= MAP_WIDTH && point[1] >= 0 && point[1] <= MAP_HEIGHT;

    const anchor = point && text && onCanvas ? { x: point[0], y: point[1], text, key: geo.rsmKey ?? text } : null;
    anchorCache.set(geo as object, anchor);
    return anchor;
};

/** On-screen size of a country in map units², which decides whether it earns a label. */
const countryAreaFor = (geo: GeoFeature, geoPath: GeoPathExtras, areaCache: WeakMap<object, number>): number => {
    const cached = areaCache.get(geo as object);
    if (cached !== undefined) return cached;
    const area = geoPath.area(geo);
    areaCache.set(geo as object, area);
    return area;
};

const MapLabels = React.memo(function MapLabels({ geographies, path, projection, visible, pixelsPerMapUnit }: {
    geographies: readonly GeoFeature[];
    path: unknown;
    projection: GeoProjection;
    visible: boolean;
    pixelsPerMapUnit: number;
}) {
    const [zoomStep, setZoomStep] = useState(1);
    // Areas and anchors depend on the projection and geometry, never on the zoom, and
    // react-simple-maps memoises the feature objects, so they are measured once per
    // shape instead of on every frame.
    const areaCache = useMemo(() => new WeakMap<object, number>(), []);
    const anchorCache = useMemo(() => new WeakMap<object, LabelAnchor | null>(), []);

    // The map reports every zoom *and pan* frame. Only the snapped step is stored,
    // and React bails out while the gesture stays inside one step — so panning costs
    // nothing and a zoom re-renders these labels a few dozen times over its whole
    // range, rather than on every frame.
    useTransformEffect(useCallback((ref) => {
        setZoomStep(quantizeLabelScale(ref.state?.scale || 1));
    }, []));

    if (!visible) return null;

    // A map unit is one SVG user unit, so this is how many CSS pixels one covers
    // right now; the label maths below is all expressed in CSS pixels.
    const screenScale = Math.max(zoomStep * pixelsPerMapUnit, 0.0001);
    const fontSize = labelFontSizeForScale(screenScale);
    const geoPath = path as GeoPathExtras;
    const nodes: React.ReactNode[] = [];
    const labelled = new Set<string>();

    for (const geo of geographies) {
        const iso2 = resolveCountryISO2(geo);
        // A country with no translated pages has nothing to claim, and two shapes can
        // represent one country (Somaliland resolves to Somalia), so only the first
        // one gets the name.
        if (!iso2 || ISLAND_MARKER_CODES.has(iso2) || !countryLanguages[iso2]?.length || labelled.has(iso2)) continue;
        // Measuring areas is cheap and cached; anchors are only worked out for the
        // countries that actually earn a label at this zoom.
        if (!isCountryLabelVisible(countryAreaFor(geo, geoPath, areaCache), screenScale)) continue;
        const anchor = labelAnchorFor(geo, projection, anchorCache);
        if (!anchor) continue;
        labelled.add(iso2);
        nodes.push(
            <g key={`label-${anchor.key}`} className="map-country-label" transform={`translate(${anchor.x}, ${anchor.y})`}>
                <CountryLabelText text={anchor.text} fontSize={fontSize} />
            </g>
        );
    }

    // Island nations are dots rather than shapes, so they only earn names once the
    // map is zoomed far enough in for their labels to stay clear of each other.
    if (zoomStep >= LABEL_ISLAND_MIN_SCALE) {
        const offset = -(LABEL_FONT_PX + 4) / screenScale;
        for (const marker of islandMarkers) {
            const point = projection(marker.coordinates as [number, number]);
            if (!point) continue;
            nodes.push(
                <g key={`label-island-${marker.code}`} className="map-country-label" transform={`translate(${point[0]}, ${point[1]})`}>
                    <CountryLabelText text={COUNTRIES[marker.code]?.name || marker.name} fontSize={fontSize} offset={offset} />
                </g>
            );
        }
    }

    return <>{nodes}</>;
});

const Languages = () => {
    const { t } = useLang();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const touchStartPos = useRef({ x: 0, y: 0 });
    const lastTapTime = useRef(0);
    const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: string; country: string | null }>({
        visible: false,
        x: 0,
        y: 0,
        content: "",
        country: null
    });
    const [mapScale, setMapScale] = useState(1);
    const [focusedCountry, setFocusedCountry] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= 768);
    const [showLabels, setShowLabels] = useState(true);
    const [mapWidth, setMapWidth] = useState(MAP_WIDTH);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            // Labels are sized in CSS pixels, so they depend on how wide the map is
            // actually rendered rather than on the map's own coordinate space.
            setMapWidth(mapContainerRef.current?.clientWidth || MAP_WIDTH);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Dismiss tooltip when clicking/tapping outside geography paths or markers
    useEffect(() => {
        if (!tooltip.visible) return;

        const handleOutsideClick = (e: Event) => {
            const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
            if (targetTag !== "path" && targetTag !== "circle") {
                setTooltip({ visible: false, x: 0, y: 0, content: "", country: null });
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setTooltip((previous) => ({ ...previous, visible: false }));
        };
        document.addEventListener("keydown", handleEscape);

        const timer = setTimeout(() => {
            document.addEventListener("click", handleOutsideClick);
            document.addEventListener("touchstart", handleOutsideClick);
        }, 100);

        return () => {
            clearTimeout(timer);
            document.removeEventListener("click", handleOutsideClick);
            document.removeEventListener("touchstart", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [tooltip.visible]);

    // Labels are sized in CSS pixels, so they need to know how wide the map is
    // actually rendered rather than where the map's own coordinate space ends.
    const pxPerMapUnit = pixelsPerMapUnit(mapWidth);
    const labelsToggleLabel = t(showLabels ? "languages.world_map.country_names.hide" : "languages.world_map.country_names.show")
        || (showLabels ? "Hide country names" : "Show country names");


    const getTooltipDataForCountry = (countryISO2: string | null, fallbackName?: string | null) => {
        const countryInfo = countryISO2 ? COUNTRIES[countryISO2] : null;
        const displayName = countryInfo?.name || fallbackName || countryISO2;

        if (countryISO2 && countryLanguages[countryISO2] && countryLanguages[countryISO2].length > 0) {
            const languages = countryLanguages[countryISO2];
            const languageNames = languages
                .map(lang => lang.nativeName || lang.name)
                .filter(Boolean)
                .join(", ");
            const content = `${displayName} ${t("languages.world_map.languages_label") || "Languages"}: ${languageNames}`;
            return { content, country: countryISO2 };
        } else if (displayName) {
            const content = `${displayName} - ${t("languages.tooltips.no_language_support") || "No language support"}`;
            return { content, country: null };
        }

        return null;
    };

    const getCountryTooltipData = (geo: GeoFeature) => {
        const countryName = getGeoName(geo);
        const countryISO2 = resolveCountryISO2(geo);
        return getTooltipDataForCountry(countryISO2, countryName);
    };

    const showCountryTooltipAt = (countryCode: string | null, fallbackName: string | null | undefined, clientX: number, clientY: number) => {
        const data = getTooltipDataForCountry(countryCode, fallbackName);
        if (!data) return;

        const padding = 12;
        const tooltipWidth = 260;
        const tooltipHeight = 50;

        let x = clientX + 12;
        let y = clientY - 40;

        if (x + tooltipWidth > window.innerWidth - padding) {
            x = Math.max(padding, clientX - tooltipWidth - 12);
        }
        if (x < padding) {
            x = padding;
        }
        if (y < padding) {
            y = clientY + 24;
        }
        if (y + tooltipHeight > window.innerHeight - padding) {
            y = window.innerHeight - tooltipHeight - padding;
        }

        setTooltip({
            visible: true,
            x,
            y,
            content: data.content,
            country: data.country
        });
    };

    const showTooltipAt = (geo: GeoFeature, clientX: number, clientY: number) => {
        const countryName = getGeoName(geo);
        const countryISO2 = resolveCountryISO2(geo);
        showCountryTooltipAt(countryISO2, countryName, clientX, clientY);
    };

    const handleMapCountryHover = (geo: GeoFeature, event: React.MouseEvent) => {
        if (isMobile) return;

        const data = getCountryTooltipData(geo);
        if (!data) return;

        moveTooltip(event);

        setTooltip({
            visible: true,
            x: event.clientX + 12,
            y: event.clientY - 12,
            content: data.content,
            country: data.country
        });
    };

    const handleMarkerHover = (marker: IslandMarker, event: React.MouseEvent) => {
        if (isMobile) return;

        const data = getTooltipDataForCountry(marker.code, marker.name);
        if (!data) return;

        moveTooltip(event);

        setTooltip({
            visible: true,
            x: event.clientX + 12,
            y: event.clientY - 12,
            content: data.content,
            country: data.country
        });
    };

    const handleMapCountryLeave = () => {
        if (isMobile) return;
        setTooltip({ visible: false, x: 0, y: 0, content: "", country: null });
    };

    const moveTooltip = (event: React.MouseEvent) => {
        if (isMobile) return;
        if (tooltipRef.current) {
            tooltipRef.current.style.transform = `translate3d(${event.clientX + 12}px, ${event.clientY - 12}px, 0)`;
        }
    };

    const handleTouchStart = (event: React.TouchEvent) => {
        if (event.touches && event.touches.length > 0) {
            touchStartPos.current = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        }
    };

    const handleTouchEnd = (geo: GeoFeature, event: React.TouchEvent) => {
        if (event.changedTouches && event.changedTouches.length > 0) {
            const touch = event.changedTouches[0];
            const dist = Math.hypot(
                touch.clientX - touchStartPos.current.x,
                touch.clientY - touchStartPos.current.y
            );
            if (dist < 10) {
                lastTapTime.current = Date.now();
                showTooltipAt(geo, touch.clientX, touch.clientY);
            }
        }
    };

    const handleMarkerTouchEnd = (marker: IslandMarker, event: React.TouchEvent) => {
        if (event.changedTouches && event.changedTouches.length > 0) {
            const touch = event.changedTouches[0];
            const dist = Math.hypot(
                touch.clientX - touchStartPos.current.x,
                touch.clientY - touchStartPos.current.y
            );
            if (dist < 10) {
                lastTapTime.current = Date.now();
                showCountryTooltipAt(marker.code, marker.name, touch.clientX, touch.clientY);
            }
        }
    };

    const handleMapCountryClick = (geo: GeoFeature, event: React.MouseEvent) => {
        if (Date.now() - lastTapTime.current < 500) return;
        const clientX = event.clientX || 0;
        const clientY = event.clientY || 0;
        showTooltipAt(geo, clientX, clientY);
    };

    const handleMarkerClick = (marker: IslandMarker, event: React.MouseEvent) => {
        if (Date.now() - lastTapTime.current < 500) return;
        const clientX = event.clientX || 0;
        const clientY = event.clientY || 0;
        showCountryTooltipAt(marker.code, marker.name, clientX, clientY);
    };

    const setMapTransforming = (isTransforming: boolean) => {
        mapContainerRef.current?.classList.toggle("is-transforming", isTransforming);
        if (isTransforming && !isMobile) {
            setTooltip({ visible: false, x: 0, y: 0, content: "", country: null });
        }
    };

    const focusCountry = (event: React.FocusEvent, id: string, countryCode: string | null, name: string | null) => {
        setFocusedCountry(id);
        const bounds = event.currentTarget.getBoundingClientRect();
        showCountryTooltipAt(countryCode, name, bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
    };

    const handleCountryKeyDown = (event: React.KeyboardEvent<Element>) => {
        const controls = Array.from(mapContainerRef.current?.querySelectorAll<HTMLElement | SVGElement>('[data-map-country]') ?? []);
        const currentIndex = controls.indexOf(event.currentTarget as HTMLElement | SVGElement);
        const offsets: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
        let nextIndex: number | undefined;
        if (event.key in offsets) nextIndex = (currentIndex + (offsets[event.key] ?? 0) + controls.length) % controls.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = controls.length - 1;
        else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.currentTarget.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
            return;
        }
        if (nextIndex !== undefined) {
            event.preventDefault();
            event.stopPropagation();
            controls[nextIndex].focus();
        }
    };

    return (
        <>
            <main className="languages-page portfolio-shell">
                <Tab title={t("languages.title") || "Portfolio Translator"} />

                <header className="page-heading">
                    <div className="page-eyebrow"><span>{t("languages.title")}</span><span><FiGlobe aria-hidden="true" /> I18N</span></div>
                    <h1>{t("languages.title") || "Portfolio Translator"}</h1>
                    <p>{t("languages.description") || "Discover how my portfolio is accessible to visitors from around the world with support for over 100 languages."}</p>
                </header>

                <div className="languages-content">
                    <section className="languages-intro" aria-label={t("languages.global_accessibility.title")}>
                        <div className="language-stats">
                            <div className="stat-item">
                                <span className="language-stat-number">101</span>
                                <p>{t("languages.global_accessibility.stats.languages_supported") || "Languages Supported"}</p>
                            </div>
                            <div className="stat-item">
                                <span className="language-stat-number">203</span>
                                <p>{t("languages.global_accessibility.stats.countries_represented") || "Countries Represented"}</p>
                            </div>
                            <div className="stat-item">
                                <span className="language-stat-number">7</span>
                                <p>{t("languages.global_accessibility.stats.continents_covered") || "Continents Covered"}</p>
                            </div>
                        </div>
                    </section>

                    <section className="world-map-section">
                        <div className="languages-section-heading">
                            <div>
                                <h2>{t("languages.world_map.title") || "Interactive World Map"}</h2>
                            </div>
                        </div>

                        <div className="world-map-container" ref={mapContainerRef}>
                            <div className="map-topbar"><span><FiGlobe aria-hidden="true" />{t("languages.world_map.title")}</span><strong>203</strong></div>
                            <TransformWrapper
                                initialScale={1}
                                minScale={0.5}
                                maxScale={12}
                                centerZoomedOut
                                limitToBounds
                                smooth
                                wheel={{ step: 0.15 }}
                                doubleClick={{ disabled: false, step: 1.5 }}
                                pinch={{ step: 5 }}
                                panning={{ excluded: ["button", "input", "textarea", "select"], velocityDisabled: true }}
                                onPanningStart={() => setMapTransforming(true)}
                                onPanningStop={() => setMapTransforming(false)}
                                onZoomStart={() => setMapTransforming(true)}
                                onZoomStop={(ref) => {
                                    setMapTransforming(false);
                                    if (ref.state?.scale) {
                                        setMapScale(ref.state.scale);
                                    }
                                }}
                            >
                                {({ zoomIn, zoomOut, resetTransform }) => (
                                    <>
                                        <div className="zoom-controls">
                                            <button type="button" onClick={() => zoomIn()} aria-label={t("languages.world_map.zoom_controls.zoom_in") || "Zoom In"} title={t("languages.world_map.zoom_controls.zoom_in") || "Zoom In"}><FiPlus /></button>
                                            <button type="button" onClick={() => zoomOut()} aria-label={t("languages.world_map.zoom_controls.zoom_out") || "Zoom Out"} title={t("languages.world_map.zoom_controls.zoom_out") || "Zoom Out"}><FiMinus /></button>
                                            <button type="button" onClick={() => resetTransform()} aria-label={t("languages.world_map.zoom_controls.reset") || "Reset"} title={t("languages.world_map.zoom_controls.reset") || "Reset"}><FiRefreshCw /></button>
                                            <button type="button" className={`map-labels-toggle${showLabels ? " is-active" : ""}`} onClick={() => setShowLabels((previous) => !previous)} aria-pressed={showLabels} aria-label={labelsToggleLabel} title={labelsToggleLabel}><FiType /></button>
                                        </div>
                                        <TransformComponent>
                                            <div className="map-wrapper">
                                                <ComposableMap
                                                    role="group"
                                                    aria-label={t("languages.world_map.title")}
                                                    aria-describedby="map-keyboard-help"
                                                    projection="geoMercator"
                                                    width={MAP_WIDTH}
                                                    height={MAP_HEIGHT}
                                                    projectionConfig={{
                                                        scale: 140,
                                                    }}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        shapeRendering: "geometricPrecision"
                                                    }}
                                                >
                                                    <Geographies
                                                        geography={`${import.meta.env.BASE_URL || ""}assets/maps/countries-50m.json`}
                                                        stroke="#FFFFFF"
                                                        strokeWidth={0.5}
                                                    >
                                                        {({ geographies, path, projection }) => {
                                                            const shapes = geographies.map((geo, index) => {
                                                                const countryISO2 = resolveCountryISO2(geo);
                                                                const countryName = geo.properties?.NAME || geo.properties?.NAME_EN || geo.properties?.name || geo.properties?.ADMIN;
                                                                const hasLanguages = Boolean(countryISO2 && countryLanguages[countryISO2] && countryLanguages[countryISO2].length > 0);
                                                                const isSelected = Boolean(tooltip.visible && tooltip.country && tooltip.country === countryISO2);

                                                                return (
                                                                    <Geography
                                                                        key={geo.rsmKey}
                                                                        geography={geo}
                                                                        data-map-country={geo.rsmKey}
                                                                        role="button"
                                                                        tabIndex={focusedCountry === geo.rsmKey || (!focusedCountry && index === 0) ? 0 : -1}
                                                                        aria-label={getCountryTooltipData(geo)?.content || countryName}
                                                                        onFocus={(event) => focusCountry(event, geo.rsmKey, countryISO2, countryName)}
                                                                        onBlur={() => setTooltip((previous) => ({ ...previous, visible: false }))}
                                                                        onKeyDown={handleCountryKeyDown}
                                                                        fill={isSelected ? (hasLanguages ? "var(--accent-color)" : "#222428") : (hasLanguages ? "var(--accent-color)" : "#303238")}
                                                                        stroke="#FFFFFF"
                                                                        strokeWidth={0.5}
                                                                        onMouseEnter={(event) => {
                                                                            handleMapCountryHover(geo, event);
                                                                        }}
                                                                        onMouseLeave={() => {
                                                                            handleMapCountryLeave();
                                                                        }}
                                                                        onMouseMove={(event) => {
                                                                            moveTooltip(event);
                                                                        }}
                                                                        onTouchStart={(event) => {
                                                                            handleTouchStart(event);
                                                                        }}
                                                                        onTouchEnd={(event) => {
                                                                            handleTouchEnd(geo, event);
                                                                        }}
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            handleMapCountryClick(geo, event);
                                                                        }}
                                                                        style={{
                                                                            "--map-country-hover-fill": hasLanguages ? "var(--accent-color)" : "#222428",
                                                                            "--map-country-active-fill": hasLanguages ? "var(--accent-color)" : "#1a1b1e"
                                                                            // Hover/pressed fills come from LanguageAtlas.css (react-simple-maps 5 dropped the object style prop).
                                                                        } as CssVariables}
                                                                    />
                                                                );
                                                            });
                                                            // Names are drawn after every country so they always
                                                            // sit on top of the shapes rather than under a neighbour.
                                                            // MapLabels keeps its own zoom state, so zooming never
                                                            // re-renders the 241 country shapes.
                                                            return (
                                                                <>
                                                                    {shapes}
                                                                    <MapLabels
                                                                        geographies={geographies}
                                                                        path={path}
                                                                        projection={projection}
                                                                        visible={showLabels}
                                                                        pixelsPerMapUnit={pxPerMapUnit}
                                                                    />
                                                                </>
                                                            );
                                                        }}
                                                    </Geographies>
                                                    {islandMarkers.map((marker) => {
                                                        const hasLanguages = Boolean(countryLanguages[marker.code]);
                                                        const isMarkerSelected = Boolean(tooltip.visible && tooltip.country && tooltip.country === marker.code);
                                                        const currentScale = mapScale || 1;
                                                        const markerRadius = (2.8 * Math.pow(currentScale, 0.35)) / currentScale;
                                                        const markerStrokeWidth = 0.7 / currentScale;
                                                        return (
                                                            <Marker
                                                                key={`island-${marker.code}`}
                                                                coordinates={marker.coordinates as [number, number]}
                                                                data-map-country={`island-${marker.code}`}
                                                                role="button"
                                                                tabIndex={focusedCountry === `island-${marker.code}` ? 0 : -1}
                                                                aria-label={getTooltipDataForCountry(marker.code, marker.name)?.content || marker.name}
                                                                onFocus={(event) => focusCountry(event, `island-${marker.code}`, marker.code, marker.name)}
                                                                onBlur={() => setTooltip((previous) => ({ ...previous, visible: false }))}
                                                                onKeyDown={handleCountryKeyDown}
                                                                onMouseEnter={(event) => {
                                                                    handleMarkerHover(marker, event);
                                                                }}
                                                                onMouseLeave={() => {
                                                                    handleMapCountryLeave();
                                                                }}
                                                                onMouseMove={(event) => {
                                                                    moveTooltip(event);
                                                                }}
                                                                onTouchStart={(event) => {
                                                                    handleTouchStart(event);
                                                                }}
                                                                onTouchEnd={(event) => {
                                                                    handleMarkerTouchEnd(marker, event);
                                                                }}
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    handleMarkerClick(marker, event);
                                                                }}
                                                            >
                                                                <circle
                                                                    r={markerRadius}
                                                                    fill={isMarkerSelected ? (hasLanguages ? "var(--accent-color)" : "#222428") : (hasLanguages ? "var(--accent-color)" : "#303238")}
                                                                    stroke="#FFFFFF"
                                                                    strokeWidth={markerStrokeWidth}
                                                                    className="island-marker"
                                                                />
                                                            </Marker>
                                                        );
                                                    })}
                                                </ComposableMap>
                                            </div>
                                        </TransformComponent>
                                    </>
                                )}
                            </TransformWrapper>
                        </div>
                        <div className="map-legend">
                            <div className="legend-item">
                                <div className="legend-color supported"></div>
                                <span>{t("languages.world_map.legend.supported") || "Languages Supported"}</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color not-supported"></div>
                                <span>{t("languages.world_map.legend.not_supported") || "No Language Support"}</span>
                            </div>
                        </div>
                        <p id="map-keyboard-help" className="visually-hidden" lang="en">Use arrow keys to explore countries, Home or End to jump to the first or last country, and Escape to dismiss country details. Tab leaves the map.</p>
                    </section>



                    <section className="languages-access">
                        <div className="languages-section-heading">
                            <div>
                                <h2>{t("languages.global_accessibility.title") || "Global Accessibility"}</h2>
                                <p dangerouslySetInnerHTML={{
                                    __html: (t("languages.global_accessibility.description") || "My portfolio is available in over {count} languages, making it accessible to visitors from around the world. This multilingual approach demonstrates my commitment to inclusivity and global reach in software development.")
                                        .replace("{count}", `<strong>100</strong>`)
                                }} />
                            </div>
                        </div>
                    </section>
                    <section className="language-features">
                        <div className="languages-section-heading">
                            <div><h2>{t("languages.features.title") || "Features"}</h2></div>
                        </div>
                        <ul>
                            {(t("languages.features.items") || [
                                { title: "Real-time Translation:", description: "Switch languages instantly with the language selector" },
                                { title: "URL-based Language:", description: "Language preferences are preserved in the URL" },
                                { title: "Native Script Support:", description: "Proper rendering of scripts like Arabic, Chinese, Hindi, and more" },
                                { title: "Cultural Sensitivity:", description: "Translations consider cultural context, not just literal meanings" },
                                { title: "SEO Optimized:", description: "Each language variant is optimized for search engines" }
                            ]).map((item: { title: string; description: string }, index: number) => (
								<li key={index}><FiZap /><div><strong>{item.title}</strong><p>{item.description}</p></div></li>
                            ))}
                        </ul>
                    </section>
                </div>

                {tooltip.visible && (
                    <div
                        ref={tooltipRef}
                        className="country-tooltip"
                        style={{
                            position: 'fixed',
                            left: 0,
                            top: 0,
                            transform: `translate3d(${tooltip.x}px, ${tooltip.y}px, 0)`,
                            zIndex: 1000
                        }}
                    >
                        {tooltip.country && (
                            <div className="tooltip-flag">
                                <ReactCountryFlag
                                    countryCode={tooltip.country}
                                    svg
                                    style={{
                                        width: '1.5em',
                                        height: '1em',
                                        marginRight: '0.5rem'
                                    }}
                                />
                            </div>
                        )}
                        {tooltip.content}
                    </div>
                )}
			</main>
        </>
    );
};

export default Languages;
