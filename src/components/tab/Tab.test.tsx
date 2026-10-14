import React, { act } from "react";
import { createRoot } from "react-dom/client";
import en from "@/assets/lang/en_us.json";
import Tab from "./Tab";

// React 19 hoists <title>/<meta> rendered anywhere in the tree into <head>, which
// is what lets Tab replace react-helmet-async.
test("hoists the title and meta description into the document head", async () => {
	global.IS_REACT_ACT_ENVIRONMENT = true;
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	try {
		await act(async () => root.render(<Tab title="About" />));

		const title = document.head.querySelector("title");
		expect(title?.textContent).toBe(`About - ${en.tab.title}`);
		expect(document.title).toBe(`About - ${en.tab.title}`);
		expect(document.head.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(en.tab.description);
		// The metadata belongs in <head>, not next to the rendered component.
		expect(container.querySelector("title, meta")).toBeNull();
	} finally {
		act(() => root.unmount());
		container.remove();
	}
});
