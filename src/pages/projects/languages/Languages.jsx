import React, { useState, useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Container, Button } from "react-bootstrap";
import { PageTitle } from "@/components/page-title";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import ReactCountryFlag from "react-country-flag";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import langMapData from "@/assets/maps/lang_map.json";
import "./Languages.css";

const Languages = () => {
    const { t } = useLang();
    const [hoveredCountry, setHoveredCountry] = useState(null);
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: "" });

    // Get data from imported JSON
    const COUNTRIES = langMapData.countries;
    const LANGUAGES = langMapData.languages;
    const COUNTRY_NAME_MAPPING = langMapData.countryNameMapping;
    const ISO3_TO_ISO2_MAPPING = langMapData.iso3ToIso2Mapping;

    // Create a flattened list of all languages for display
    const ALL_LANGUAGES = Object.values(COUNTRIES).flatMap(country =>
        country.languages.map(langCode => ({
            code: langCode,
            country: country.iso2,
            ...LANGUAGES[langCode]
        }))
    );

    // Group languages by country for easy lookup
    const countryLanguages = Object.keys(COUNTRIES).reduce((acc, countryCode) => {
        const country = COUNTRIES[countryCode];
        acc[countryCode] = country.languages.map(langCode => ({
            code: langCode,
            ...LANGUAGES[langCode]
        }));
        return acc;
    }, {});

    const handleCountryHover = (event, countryCode) => {
        const languages = countryLanguages[countryCode];
        if (languages) {
            const content = languages.map(lang => `${lang.nativeName} (${lang.name})`).join(", ");
            setTooltip({
                visible: true,
                x: event.clientX + 10,
                y: event.clientY - 10,
                content
            });
            setHoveredCountry(countryCode);
        }
    };

    const handleCountryLeave = () => {
        setTooltip({ visible: false, x: 0, y: 0, content: "" });
        setHoveredCountry(null);
    };

    const handleMapCountryHover = (geo, event) => {
        // Try multiple possible property names for country identification
        const countryISO3 = geo.properties.ISO_A3 || geo.properties.ADM0_A3 || geo.properties.iso_a3;
        const countryName = geo.properties.NAME || geo.properties.NAME_EN || geo.properties.name || geo.properties.ADMIN;

        // Try multiple methods to get ISO2 code
        let countryISO2 = null;

        // Method 1: Direct ISO3 to ISO2 lookup
        if (countryISO3) {
            countryISO2 = ISO3_TO_ISO2_MAPPING[countryISO3];
        }

        // Method 2: Look through our countries data for matching ISO3
        if (!countryISO2 && countryISO3) {
            countryISO2 = Object.keys(COUNTRIES).find(key => COUNTRIES[key].iso3 === countryISO3);
        }

        // Method 3: Country name mapping
        if (!countryISO2 && countryName) {
            countryISO2 = COUNTRY_NAME_MAPPING[countryName];
        }

        // Method 4: Fuzzy country name matching for common variations
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

        // Debug logging
        console.log('Map hover:', {
            countryName,
            countryISO3,
            countryISO2,
            hasLanguages: !!(countryISO2 && countryLanguages[countryISO2]),
            properties: geo.properties
        });

        if (countryISO2 && countryLanguages[countryISO2]) {
            const languages = countryLanguages[countryISO2];
            const languageNames = languages.map(lang => lang.nativeName).join(", ");
            const content = `${countryName} ${t("languages.world_map.languages_label") || "Languages"}: ${languageNames}`;
            setTooltip({
                visible: true,
                x: event.clientX + 10,
                y: event.clientY - 10,
                content,
                country: countryISO2
            });
            setHoveredCountry(countryISO2);
        } else if (countryName) {
            // Show country name even if no languages supported
            setTooltip({
                visible: true,
                x: event.clientX + 10,
                y: event.clientY - 10,
                content: `${countryName} - ${t("languages.tooltips.no_language_support") || "No language support"}`,
                country: null
            });
        }
    };

    const handleMapCountryLeave = () => {
        setTooltip({ visible: false, x: 0, y: 0, content: "" });
        setHoveredCountry(null);
    };

    return (
        <HelmetProvider>
            <Container>
                <Tab title={t("languages.title") || "Portfolio Translator"} />
                <PageTitle title={t("languages.title") || "Portfolio Translator"} />

                <div className="languages-content">
                    <section className="languages-intro">
                        <h2>{t("languages.global_accessibility.title") || "Global Accessibility"}</h2>
                        <p dangerouslySetInnerHTML={{
                            __html: (t("languages.global_accessibility.description") || "My portfolio is available in over {count} languages, making it accessible to visitors from around the world. This multilingual approach demonstrates my commitment to inclusivity and global reach in software development.")
                                .replace("{count}", `<strong>${ALL_LANGUAGES.length}</strong>`)
                        }} />

                        <div className="language-stats">
                            <div className="stat-item">
                                <h3>{ALL_LANGUAGES.length}</h3>
                                <p>{t("languages.global_accessibility.stats.languages_supported") || "Languages Supported"}</p>
                            </div>
                            <div className="stat-item">
                                <h3>{Object.keys(countryLanguages).length}</h3>
                                <p>{t("languages.global_accessibility.stats.countries_represented") || "Countries Represented"}</p>
                            </div>
                            <div className="stat-item">
                                <h3>6</h3>
                                <p>{t("languages.global_accessibility.stats.continents_covered") || "Continents Covered"}</p>
                            </div>
                        </div>
                    </section>

                    <section className="world-map-section">
                        <h2>{t("languages.world_map.title") || "Interactive World Map"}</h2>
                        <p>{t("languages.world_map.description") || "Hover over countries on the map to see their supported languages:"}</p>

                        <div className="world-map-container">
                            <TransformWrapper
                                initialScale={1}
                                minScale={0.5}
                                maxScale={4}
                                wheel={{ step: 0.1 }}
                                doubleClick={{ disabled: false }}
                                pinch={{ step: 5 }}
                                panning={{ excluded: ["input", "textarea", "select"] }}
                            >
                                {({ zoomIn, zoomOut, resetTransform }) => (
                                    <>
                                        <div className="zoom-controls">
                                            <Button variant="outline-primary" size="sm" onClick={() => zoomIn()}>
                                                {t("languages.world_map.zoom_controls.zoom_in") || "Zoom In"}
                                            </Button>
                                            <Button variant="outline-primary" size="sm" onClick={() => zoomOut()}>
                                                {t("languages.world_map.zoom_controls.zoom_out") || "Zoom Out"}
                                            </Button>
                                            <Button variant="outline-secondary" size="sm" onClick={() => resetTransform()}>
                                                {t("languages.world_map.zoom_controls.reset") || "Reset"}
                                            </Button>
                                        </div>
                                        <TransformComponent>
                                            <div className="map-wrapper">
                                                <ComposableMap
                                                    projection="geoMercator"
                                                    projectionConfig={{
                                                        scale: 140,
                                                    }}
                                                    style={{ width: "100%", height: "auto" }}
                                                >
                                                    <Geographies
                                                        geography="https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
                                                        stroke="#FFFFFF"
                                                        strokeWidth={0.5}
                                                    >
                                                        {({ geographies }) =>
                                                            geographies.map((geo) => {
                                                                // Try multiple possible property names for country codes
                                                                const countryISO3 = geo.properties.ISO_A3 || geo.properties.ADM0_A3 || geo.properties.iso_a3;
                                                                const countryName = geo.properties.NAME || geo.properties.NAME_EN || geo.properties.name || geo.properties.ADMIN;

                                                                // Try multiple methods to get ISO2 code
                                                                let countryISO2 = null;

                                                                // Method 1: Direct ISO3 to ISO2 lookup
                                                                if (countryISO3) {
                                                                    countryISO2 = ISO3_TO_ISO2_MAPPING[countryISO3];
                                                                }

                                                                // Method 2: Look through our countries data for matching ISO3
                                                                if (!countryISO2 && countryISO3) {
                                                                    countryISO2 = Object.keys(COUNTRIES).find(key => COUNTRIES[key].iso3 === countryISO3);
                                                                }

                                                                // Method 3: Country name mapping
                                                                if (!countryISO2 && countryName) {
                                                                    countryISO2 = COUNTRY_NAME_MAPPING[countryName];
                                                                }

                                                                const hasLanguages = countryISO2 && countryLanguages[countryISO2];

                                                                return (
                                                                    <Geography
                                                                        key={geo.rsmKey}
                                                                        geography={geo}
                                                                        fill={hasLanguages ? "#22c55e" : "#e5e7eb"}
                                                                        stroke="#FFFFFF"
                                                                        strokeWidth={0.5}
                                                                        onMouseEnter={(event) => {
                                                                            console.log('Hovering over:', countryName, 'ISO3:', countryISO3, 'ISO2:', countryISO2, 'Has Languages:', hasLanguages);
                                                                            handleMapCountryHover(geo, event);
                                                                            // Change fill color on hover
                                                                            event.target.setAttribute('fill', hasLanguages ? "#16a34a" : "#d1d5db");
                                                                            event.target.setAttribute('stroke-width', '1');
                                                                            event.target.style.cursor = 'pointer';
                                                                        }}
                                                                        onMouseLeave={(event) => {
                                                                            handleMapCountryLeave();
                                                                            // Reset fill color
                                                                            event.target.setAttribute('fill', hasLanguages ? "#22c55e" : "#e5e7eb");
                                                                            event.target.setAttribute('stroke-width', '0.5');
                                                                        }}
                                                                        onMouseMove={(event) => {
                                                                            if (countryISO2 && countryLanguages[countryISO2]) {
                                                                                const languages = countryLanguages[countryISO2];
                                                                                const languageNames = languages.map(lang => lang.nativeName).join(", ");
                                                                                const content = `${countryName} ${t("languages.world_map.languages_label") || "Languages"}: ${languageNames}`;
                                                                                setTooltip({
                                                                                    visible: true,
                                                                                    x: event.clientX + 10,
                                                                                    y: event.clientY - 10,
                                                                                    content,
                                                                                    country: countryISO2
                                                                                });
                                                                            }
                                                                        }}
                                                                        style={{
                                                                            default: { outline: "none" },
                                                                            hover: { outline: "none", cursor: "pointer" },
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
                        <h2>{t("languages.features.title") || "Features"}</h2>
                        <ul>
                            {(t("languages.features.items") || [
                                { title: "Real-time Translation:", description: "Switch languages instantly with the language selector" },
                                { title: "URL-based Language:", description: "Language preferences are preserved in the URL" },
                                { title: "Native Script Support:", description: "Proper rendering of scripts like Arabic, Chinese, Hindi, and more" },
                                { title: "Cultural Sensitivity:", description: "Translations consider cultural context, not just literal meanings" },
                                { title: "SEO Optimized:", description: "Each language variant is optimized for search engines" }
                            ]).map((item, index) => (
                                <li key={index}><strong>{item.title}</strong> {item.description}</li>
                            ))}
                        </ul>
                    </section>
                </div>

                {tooltip.visible && (
                    <div
                        className="country-tooltip"
                        style={{
                            position: 'fixed',
                            left: tooltip.x,
                            top: tooltip.y,
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
            </Container>
        </HelmetProvider>
    );
};

export default Languages;
