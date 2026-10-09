import { FaGamepad } from "react-icons/fa";
import { GiConsoleController, GiTestTubes, GiWarPick } from "react-icons/gi";
import { VscTerminal, VscGlobe, VscJson } from "react-icons/vsc";
import { TbGridDots } from "react-icons/tb";
import l from "@/assets/links/links.json";

// Kept in alphabetical order by English menu label.
export const projects = [
	{
		key: "arcade",
		path: l.arcade.home,
		icon: GiConsoleController,
		external: true,
		children: [
			{ key: "alkalab", path: l.arcade.alkalab, icon: GiTestTubes, external: true },
			{ key: "snake", path: l.arcade.snake, icon: FaGamepad, external: true },
			{ key: "suprememc", path: l.arcade.suprememc, icon: GiWarPick, external: true },
		],
	},
	{ key: "connect_four", path: l.connect_four, icon: TbGridDots, external: true },
	{ key: "formatter", path: l.menu.formatter, icon: VscJson },
	{ key: "portfolio_translator", path: l.menu.languages, icon: VscGlobe },
	{ key: "tiger", path: l.menu.tiger, icon: VscTerminal },
];
