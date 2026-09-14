import { getAtlasPixelRatio } from "./AtlasCanvas";

test.each([1, 2, 3])("bounds the atlas backing store at device pixel ratio %s", (devicePixelRatio) => {
    const ratio = getAtlasPixelRatio(2600, 2000, devicePixelRatio);
    const width = Math.floor(2600 * ratio);
    const height = Math.floor(2000 * ratio);
    expect(width).toBeLessThanOrEqual(2048);
    expect(height).toBeLessThanOrEqual(2048);
    expect(width * height).toBeLessThanOrEqual(3000000);
});

test("retains normal resolution for small canvases", () => {
    expect(getAtlasPixelRatio(400, 300, 1)).toBe(1);
    expect(getAtlasPixelRatio(400, 300, 3)).toBe(1.5);
});

test("handles a temporarily empty canvas", () => {
    expect(getAtlasPixelRatio(0, 0, 3)).toBe(1.5);
});