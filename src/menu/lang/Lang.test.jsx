import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider, getLanguageTag } from "@/lang/languageContext";
import Lang from "./Lang";

test.each([["en_us", "en-US"], ["iw_il", "he-IL"], ["jw_id", "jv-ID"], ["zh-CN_cn", "zh-CN"], ["zh-TW_tw", "zh-TW"]])("normalizes %s to %s", (locale, expected) => {
	expect(getLanguageTag(locale)).toBe(expected);
});

test("labels language buttons and restores focus on Escape and selection", async () => {
	global.IS_REACT_ACT_ENVIRONMENT = true;
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	try {
		await act(async () => root.render(<MemoryRouter><LanguageProvider><Lang /></LanguageProvider></MemoryRouter>));
		const toggle = container.querySelector(".lang-toggle");
		act(() => toggle.click());
		expect(document.activeElement.type).toBe("search");
		expect(container.querySelectorAll('[role="listbox"], [role="option"]')).toHaveLength(0);
		expect(container.querySelectorAll('.lang-option[aria-pressed="true"]')).toHaveLength(1);
		act(() => document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
		expect(document.activeElement).toBe(toggle);
		expect(toggle.getAttribute("aria-expanded")).toBe("false");
		act(() => toggle.click());
		await act(async () => container.querySelector('.lang-option[aria-pressed="true"]').click());
		expect(document.activeElement).toBe(toggle);
		expect(document.documentElement.lang).toBe("en-US");
		act(() => toggle.click());
		const spanish = Array.from(container.querySelectorAll(".lang-option")).find((option) => option.querySelector('[lang="es-MX"]'));
		await act(async () => spanish.click());
		expect(document.documentElement.lang).toBe("es-MX");
	} finally {
		act(() => root.unmount());
		container.remove();
	}
});