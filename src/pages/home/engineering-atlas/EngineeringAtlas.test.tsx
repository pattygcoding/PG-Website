import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import english from "../../../assets/lang/en_us.json";
import EngineeringAtlas from "./EngineeringAtlas";

jest.mock("@/lang/languageContext", () => ({ useLang: jest.fn() }));
jest.mock("@/components/lang-aware-link", () => ({
    LangAwareLink: ({ to, children, ...props }: { to: string; children?: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={to} {...props}>{children}</a>,
}));
jest.mock("./AtlasCanvas", () => () => null);
jest.mock("./AtlasMap", () => ({ children }: { children?: React.ReactNode }) => <div>{children}</div>);

const { useLang } = require("@/lang/languageContext");

test.each([true, false])("connected work defaults and toggles with mobile=%s", (mobile) => {
    const originalMatchMedia = window.matchMedia;
    const originalActEnvironment = global.IS_REACT_ACT_ENVIRONMENT;
    global.IS_REACT_ACT_ENVIRONMENT = true;
    window.matchMedia = jest.fn(() => ({ matches: mobile })) as unknown as typeof window.matchMedia;
    useLang.mockReturnValue({ t: (key: string) => key.split(".").reduce((value: any, part: string) => value?.[part], english as any) });
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    try {
        act(() => root.render(<EngineeringAtlas />));
        expect(container.querySelector<HTMLDetailsElement>(".atlas-related")!.open).toBe(!mobile);
        act(() => container.querySelector<HTMLElement>(".atlas-related summary")!.click());
        expect(container.querySelector<HTMLDetailsElement>(".atlas-related")!.open).toBe(mobile);
        act(() => container.querySelector<HTMLElement>(".atlas-related summary")!.click());
        expect(container.querySelector<HTMLDetailsElement>(".atlas-related")!.open).toBe(!mobile);
        act(() => container.querySelector<HTMLElement>('[data-project-id="takeoff_engine"]')!.click());
        expect(container.querySelector<HTMLDetailsElement>(".atlas-related")!.open).toBe(!mobile);
    } finally {
        act(() => root.unmount());
        container.remove();
        window.matchMedia = originalMatchMedia;
        global.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment;
    }
});