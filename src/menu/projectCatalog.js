import { FaGamepad } from "react-icons/fa";
import { GiTestTubes, GiWarPick } from "react-icons/gi";
import { VscTerminal, VscGlobe, VscJson } from "react-icons/vsc";
import { TbGridDots } from "react-icons/tb";
import l from "@/assets/links/links.json";

// Kept in alphabetical order by English menu label.
export const projects = [
	{ key: "alkalab", path: l.menu.alkalab, icon: GiTestTubes },
	{ key: "connect_four", path: l.connect_four, icon: TbGridDots, external: true },
	{ key: "formatter", path: l.menu.formatter, icon: VscJson },
	{ key: "portfolio_translator", path: l.menu.languages, icon: VscGlobe },
	{ key: "snake", path: l.menu.snake, icon: FaGamepad },
	{ key: "suprememc", path: l.menu.suprememc, icon: GiWarPick },
	{ key: "tiger", path: l.menu.tiger, icon: VscTerminal },
];
