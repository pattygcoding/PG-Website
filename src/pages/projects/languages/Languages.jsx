import React, { useRef, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { FiGlobe, FiMinus, FiPlus, FiRefreshCw, FiZap } from "react-icons/fi";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import ReactCountryFlag from "react-country-flag";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import langMapData from "@/assets/maps/lang_map.json";
import "./Languages.css";

const Languages = () => {
    const { t } = useLang();
    const mapContainerRef = useRef(null);
    const tooltipRef = useRef(null);
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: "", country: null });

    // Get data from imported JSON
    const COUNTRIES = langMapData.countries;
    const LANGUAGES = langMapData.languages;
    const COUNTRY_NAME_MAPPING = langMapData.countryNameMapping;

    // Group languages by country for easy lookup
    const countryLanguages = Object.keys(COUNTRIES).reduce((acc, countryCode) => {
        const country = COUNTRIES[countryCode];
        acc[countryCode] = country.languages.map(langCode => ({
            code: langCode,
            ...LANGUAGES[langCode]
        }));
        return acc;
    }, {});


    const handleMapCountryHover = (geo, event) => {
        const countryName = geo.properties.name;

        moveTooltip(event);

        let countryISO2 = null;

        if (!countryISO2 && countryName) {
            countryISO2 = COUNTRY_NAME_MAPPING[countryName];
        }

        if (!countryISO2 && countryName) {
            // Try some common variations
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
                    countryISO2 = COUNTRY_NAME_MAPPING[variation];
                    break;
                }
            }
        }

        if (countryISO2 && countryLanguages[countryISO2]) {
            const languages = countryLanguages[countryISO2];
            const languageNames = languages.map(lang => lang.nativeName).join(", ");
            const content = `${countryName} ${t("languages.world_map.languages_label") || "Languages"}: ${languageNames}`;
            setTooltip({
                visible: true,
                x: event.clientX + 12,
                y: event.clientY - 12,
                content,
                country: countryISO2
            });
        } else if (countryName) {
            // Show country name even if no languages supported
            setTooltip({
                visible: true,
                x: event.clientX + 12,
                y: event.clientY - 12,
                content: `${countryName} - ${t("languages.tooltips.no_language_support") || "No language support"}`,
                country: null
            });
        }
    };

    const handleMapCountryLeave = () => {
        setTooltip({ visible: false, x: 0, y: 0, content: "", country: null });
    };

    const moveTooltip = (event) => {
        if (tooltipRef.current) {
            tooltipRef.current.style.transform = `translate3d(${event.clientX + 12}px, ${event.clientY - 12}px, 0)`;
        }
    };

    const setMapTransforming = (isTransforming) => {
        mapContainerRef.current?.classList.toggle("is-transforming", isTransforming);

        if (tooltipRef.current) {
            tooltipRef.current.style.visibility = isTransforming ? "hidden" : "";
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
                                <p>{t("languages.world_map.description") || "Hover over countries on the map to see their supported languages:"}</p>
                            </div>
                        </div>

                        <div className="world-map-container" ref={mapContainerRef}>
                            <div className="map-topbar"><span><i></i> LIVE COVERAGE MAP</span><strong>203 REGIONS</strong></div>
                            <TransformWrapper
                                initialScale={1}
                                minScale={0.5}
                                maxScale={4}
                                centerZoomedOut
                                limitToBounds
                                wheel={{ step: 0.08 }}
                                doubleClick={{ disabled: false }}
                                pinch={{ step: 5 }}
                                panning={{ excluded: ["button", "input", "textarea", "select"], velocityDisabled: true }}
                                onPanningStart={() => setMapTransforming(true)}
                                onPanningStop={() => setMapTransforming(false)}
                                onZoomStart={() => setMapTransforming(true)}
                                onZoomStop={() => setMapTransforming(false)}
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
                                                >
                                                    <Geographies
                                                        geography="https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
                                                        stroke="#FFFFFF"
                                                        strokeWidth={0.5}
                                                    >
                                                        {({ geographies }) =>
                                                            geographies.map((geo) => {
                                                               
                                                                const countryName = geo.properties.NAME || geo.properties.NAME_EN || geo.properties.name || geo.properties.ADMIN;

                                                                // Try multiple methods to get ISO2 code
                                                                let countryISO2 = null;



                                                                // Method 3: Country name mapping
                                                                if (!countryISO2 && countryName) {
                                                                    countryISO2 = COUNTRY_NAME_MAPPING[countryName];
                                                                }

                                                                const hasLanguages = (countryISO2 && countryLanguages[countryISO2]);

                                                                return (
                                                                    <Geography
                                                                        key={geo.rsmKey}
                                                                        geography={geo}
                                                                        fill={hasLanguages ? "#ef3e32" : "#303238"}
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
                                                                        style={{
                                                                            default: { outline: "none" },
                                                                            hover: { fill: hasLanguages ? "#ff6258" : "#3d4047", outline: "none", cursor: "pointer" },
                                                                            pressed: { outline: "none" }
                                                                        }}
                                                                    />
                                                                );
                                                            })
                                                        }
                                                    </Geographies>
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
