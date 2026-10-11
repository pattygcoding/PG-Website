import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import english from "../../../assets/lang/en_us.json";
import EngineeringAtlas from "./EngineeringAtlas";

const { mockUseLang } = vi.hoisted(() => ({ mockUseLang: vi.fn() }));

vi.mock("@/lang/languageContext", () => ({ useLang: mockUseLang }));
vi.mock("@/components/lang-aware-link", () => ({
    LangAwareLink: ({ to, children, ...props }: { to: string; children?: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={to} {...props}>{children}</a>,
}));
vi.mock("./AtlasCanvas", () => ({ default: () => null }));
vi.mock("./AtlasMap", () => ({ default: ({ children }: { children?: React.ReactNode }) => <div>{children}</div> }));

test.each([true, false])("connected work defaults and toggles with mobile=%s", (mobile) => {
    const originalMatchMedia = window.matchMedia;
    const originalActEnvironment = global.IS_REACT_ACT_ENVIRONMENT;
    global.IS_REACT_ACT_ENVIRONMENT = true;
    window.matchMedia = vi.fn(() => ({ matches: mobile })) as unknown as typeof window.matchMedia;
    mockUseLang.mockReturnValue({
        t: (key: string) =>
            key.split(".").reduce<unknown>(
                (value, part) => (value && typeof value === "object" ? (value as Record<string, unknown>)[part] : undefined),
                english,
            ),
    });
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