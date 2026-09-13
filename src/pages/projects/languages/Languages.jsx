import React, { useEffect, useRef, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { FiGlobe, FiMinus, FiPlus, FiRefreshCw, FiZap } from "react-icons/fi";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import ReactCountryFlag from "react-country-flag";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import langMapData from "@/assets/maps/lang_map.json";
import islandMarkers from "@/assets/maps/island_markers.json";
import "./Languages.css";

const Languages = () => {
    const { t } = useLang();
    const mapContainerRef = useRef(null);
    const tooltipRef = useRef(null);
    const touchStartPos = useRef({ x: 0, y: 0 });
    const lastTapTime = useRef(0);
    const [tooltip, setTooltip] = useState({
        visible: false,
        x: 0,
        y: 0,
        content: "",
        country: null
    });
    const [mapScale, setMapScale] = useState(1);
    const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Dismiss tooltip when clicking/tapping outside geography paths or markers
    useEffect(() => {
        if (!tooltip.visible) return;

        const handleOutsideClick = (e) => {
            const targetTag = e.target?.tagName?.toLowerCase();
            if (targetTag !== "path" && targetTag !== "circle") {
                setTooltip({ visible: false, x: 0, y: 0, content: "", country: null });
            }
        };

        const timer = setTimeout(() => {
            document.addEventListener("click", handleOutsideClick);
            document.addEventListener("touchstart", handleOutsideClick);
        }, 100);

        return () => {
            clearTimeout(timer);
            document.removeEventListener("click", handleOutsideClick);
            document.removeEventListener("touchstart", handleOutsideClick);
        };
    }, [tooltip.visible]);

    // Get data from imported JSON
    const COUNTRIES = langMapData.countries;
    const LANGUAGES = langMapData.languages;
    const COUNTRY_NAME_MAPPING = langMapData.countryNameMapping;

    // Group languages by country for easy lookup (filtering out any unmapped or missing language codes)
    const countryLanguages = Object.keys(COUNTRIES).reduce((acc, countryCode) => {
        const country = COUNTRIES[countryCode];
        acc[countryCode] = (country.languages || [])
            .map(langCode => {
                const langObj = LANGUAGES[langCode];
                if (!langObj) return null;
                return {
                    code: langCode,
                    ...langObj
                };
            })
            .filter(Boolean);
        return acc;
    }, {});

    const resolveCountryISO2 = (geoOrName) => {
        if (!geoOrName) return null;
        const countryName = typeof geoOrName === "string" 
            ? geoOrName 
            : (geoOrName.properties?.NAME || geoOrName.properties?.NAME_EN || geoOrName.properties?.name || geoOrName.properties?.ADMIN);
        
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

    const getTooltipDataForCountry = (countryISO2, fallbackName) => {
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

    const getCountryTooltipData = (geo) => {
        const countryName = geo.properties?.NAME || geo.properties?.NAME_EN || geo.properties?.name || geo.properties?.ADMIN;
        const countryISO2 = resolveCountryISO2(geo);
        return getTooltipDataForCountry(countryISO2, countryName);
    };

    const showCountryTooltipAt = (countryCode, fallbackName, clientX, clientY) => {
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

    const showTooltipAt = (geo, clientX, clientY) => {
        const countryName = geo.properties?.NAME || geo.properties?.NAME_EN || geo.properties?.name || geo.properties?.ADMIN;
        const countryISO2 = resolveCountryISO2(geo);
        showCountryTooltipAt(countryISO2, countryName, clientX, clientY);
    };

    const handleMapCountryHover = (geo, event) => {
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

    const handleMarkerHover = (marker, event) => {
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

    const moveTooltip = (event) => {
        if (isMobile) return;
        if (tooltipRef.current) {
            tooltipRef.current.style.transform = `translate3d(${event.clientX + 12}px, ${event.clientY - 12}px, 0)`;
        }
    };

    const handleTouchStart = (event) => {
        if (event.touches && event.touches.length > 0) {
            touchStartPos.current = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        }
    };

    const handleTouchEnd = (geo, event) => {
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

    const handleMarkerTouchEnd = (marker, event) => {
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

    const handleMapCountryClick = (geo, event) => {
        if (Date.now() - lastTapTime.current < 500) return;
        const clientX = event.clientX || 0;
        const clientY = event.clientY || 0;
        showTooltipAt(geo, clientX, clientY);
    };

    const handleMarkerClick = (marker, event) => {
        if (Date.now() - lastTapTime.current < 500) return;
        const clientX = event.clientX || 0;
        const clientY = event.clientY || 0;
        showCountryTooltipAt(marker.code, marker.name, clientX, clientY);
    };

    const setMapTransforming = (isTransforming) => {
        mapContainerRef.current?.classList.toggle("is-transforming", isTransforming);
        if (isTransforming && !isMobile) {
            setTooltip({ visible: false, x: 0, y: 0, content: "", country: null });
        }
    };

    return (
        <HelmetProvider>
            <main className="languages-page">
                <Tab title={t("languages.title") || "Portfolio Translator"} />

                <header className="languages-hero">
                    <div className="languages-hero-grid" aria-hidden="true"></div>
                    <div className="languages-kicker"><FiGlobe /> GLOBAL_INTERFACE / I18N</div>
                    <h1>{t("languages.title") || "Portfolio Translator"}</h1>
                    <p>{t("languages.description") || "Discover how my portfolio is accessible to visitors from around the world with support for over 100 languages."}</p>
                    <div className="language-orbit" aria-hidden="true">
                        <span>EN</span><span>ES</span><span>日</span><span>ع</span><span>हिं</span>
                        <FiGlobe />
                    </div>
                </header>

                <div className="languages-content">
                    <section className="languages-intro">
                        <div className="languages-section-heading">
                            <span>01 / ACCESS</span>
                            <div>
                                <h2>{t("languages.global_accessibility.title") || "Global Accessibility"}</h2>
                                <p dangerouslySetInnerHTML={{
                                    __html: (t("languages.global_accessibility.description") || "My portfolio is available in over {count} languages, making it accessible to visitors from around the world. This multilingual approach demonstrates my commitment to inclusivity and global reach in software development.")
                                        .replace("{count}", `<strong>100</strong>`)
                                }} />
                            </div>
                        </div>

                        <div className="language-stats">
                            <div className="stat-item">
                                <h3>101</h3>
                                <p>{t("languages.global_accessibility.stats.languages_supported") || "Languages Supported"}</p>
                            </div>
                            <div className="stat-item">
                                <h3>203</h3>
                                <p>{t("languages.global_accessibility.stats.countries_represented") || "Countries Represented"}</p>
                            </div>
                            <div className="stat-item">
                                <h3>7</h3>
                                <p>{t("languages.global_accessibility.stats.continents_covered") || "Continents Covered"}</p>
                            </div>
                        </div>
                    </section>

                    <section className="world-map-section">
                        <div className="languages-section-heading">
                            <span>02 / COVERAGE</span>
                            <div>
                                <h2>{t("languages.world_map.title") || "Interactive World Map"}</h2>
                                <p>
                                    {isMobile
                                        ? (t("languages.world_map.description") || "").replace(/hover over/i, "click or tap on") || "Click or tap on countries on the map to see their supported languages:"
                                        : (t("languages.world_map.description") || "Hover over countries on the map to see their supported languages:")}
                                </p>
                            </div>
                        </div>

                        <div className="world-map-container" ref={mapContainerRef}>
                            <div className="map-topbar"><span><i></i> LIVE COVERAGE MAP</span><strong>203 REGIONS</strong></div>
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
											<button type="button" onClick={() => zoomIn()} title={t("languages.world_map.zoom_controls.zoom_in") || "Zoom In"}><FiPlus /><span>{t("languages.world_map.zoom_controls.zoom_in") || "Zoom In"}</span></button>
											<button type="button" onClick={() => zoomOut()} title={t("languages.world_map.zoom_controls.zoom_out") || "Zoom Out"}><FiMinus /><span>{t("languages.world_map.zoom_controls.zoom_out") || "Zoom Out"}</span></button>
											<button type="button" onClick={() => resetTransform()} title={t("languages.world_map.zoom_controls.reset") || "Reset"}><FiRefreshCw /><span>{t("languages.world_map.zoom_controls.reset") || "Reset"}</span></button>
                                        </div>
                                        <TransformComponent>
                                            <div className="map-wrapper">
                                                <ComposableMap
                                                    projection="geoMercator"
                                                    width={1000}
                                                    height={562}
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
                                                        geography={`${process.env.PUBLIC_URL || ""}/assets/maps/countries-50m.json`}
                                                        stroke="#FFFFFF"
                                                        strokeWidth={0.5}
                                                    >
                                                        {({ geographies }) =>
                                                            geographies.map((geo) => {
                                                                const countryISO2 = resolveCountryISO2(geo);
                                                                const hasLanguages = Boolean(countryISO2 && countryLanguages[countryISO2] && countryLanguages[countryISO2].length > 0);
                                                                const isSelected = Boolean(tooltip.visible && tooltip.country && tooltip.country === countryISO2);

                                                                return (
                                                                    <Geography
                                                                        key={geo.rsmKey}
                                                                        geography={geo}
                                                                        fill={isSelected ? (hasLanguages ? "#b3261e" : "#222428") : (hasLanguages ? "#ef3e32" : "#303238")}
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
                                                                            default: { outline: "none" },
                                                                            hover: { fill: hasLanguages ? "#b3261e" : "#222428", outline: "none", cursor: "pointer" },
                                                                            pressed: { fill: hasLanguages ? "#9c1b14" : "#1a1b1e", outline: "none" }
                                                                        }}
                                                                    />
                                                                );
                                                            })
                                                        }
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
                                                                coordinates={marker.coordinates}
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
                                                                    fill={isMarkerSelected ? (hasLanguages ? "#b3261e" : "#222428") : (hasLanguages ? "#ef3e32" : "#303238")}
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
                    </section>



                    <section className="language-features">
                        <div className="languages-section-heading">
                            <span>03 / SYSTEM</span>
                            <div><h2>{t("languages.features.title") || "Features"}</h2></div>
                        </div>
                        <ul>
                            {(t("languages.features.items") || [
                                { title: "Real-time Translation:", description: "Switch languages instantly with the language selector" },
                                { title: "URL-based Language:", description: "Language preferences are preserved in the URL" },
                                { title: "Native Script Support:", description: "Proper rendering of scripts like Arabic, Chinese, Hindi, and more" },
                                { title: "Cultural Sensitivity:", description: "Translations consider cultural context, not just literal meanings" },
                                { title: "SEO Optimized:", description: "Each language variant is optimized for search engines" }
                            ]).map((item, index) => (
								<li key={index}><span>{String(index + 1).padStart(2, "0")}</span><FiZap /><div><strong>{item.title}</strong><p>{item.description}</p></div></li>
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
        </HelmetProvider>
    );
};

export default Languages;
