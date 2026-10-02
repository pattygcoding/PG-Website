import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import en from "@/assets/lang/en_us.json";
import SupremeMC from "./SupremeMC";

const mockLookup = (key) => key.split(".").reduce((acc, part) => acc && acc[part], en) ?? key;
jest.mock("@/lang/languageContext", () => ({ useLang: () => ({ t: mockLookup }) }));
jest.mock("@/components/tab", () => ({ Tab: () => null }));

test("renders the showcase with features, stats, and repository links", () => {
	global.IS_REACT_ACT_ENVIRONMENT = true;
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	try {
		act(() => root.render(<SupremeMC />));
		expect(container.querySelector("h1").textContent).toBe("SupremeMC");
		expect(container.querySelectorAll(".suprememc-feature")).toHaveLength(6);
		expect(container.querySelectorAll(".suprememc-stats > div")).toHaveLength(4);
		expect(container.querySelectorAll(".suprememc-timeline li").length).toBeGreaterThan(0);
		expect(container.textContent).not.toMatch(/suprememc\./);
		const repoLinks = container.querySelectorAll('a[href="https://github.com/pattygcoding/SupremeMC-26.2-Mod"]');
		expect(repoLinks.length).toBeGreaterThan(0);
		repoLinks.forEach((link) => expect(link.getAttribute("rel")).toBe("noopener noreferrer"));
		const curseforge = container.querySelector(".suprememc-download");
		expect(curseforge.getAttribute("href")).toBe("https://www.curseforge.com/minecraft/mc-mods/suprememc");
		expect(curseforge.getAttribute("target")).toBe("_blank");
		expect(curseforge.textContent).toContain("Download on CurseForge");
	} finally {
		act(() => root.unmount());
		container.remove();
	}
});
