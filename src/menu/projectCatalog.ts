import type { IconType } from "react-icons";
import { GiConsoleController } from "react-icons/gi";
import { VscTerminal, VscGlobe, VscJson } from "react-icons/vsc";
import { TbGridDots } from "react-icons/tb";
import { Blocks, FlaskConical, Gamepad2, Pickaxe } from "./lucide-icons";
import l from "@/assets/links/links.json";

export interface ProjectCatalogEntry {
	key: string;
	path: string;
	icon: IconType;
	external?: boolean;
	children?: ProjectCatalogEntry[];
}

// Kept in alphabetical order by English menu label.
export const projects: ProjectCatalogEntry[] = [
	{
		key: "arcade",
		path: l.arcade.home,
		icon: GiConsoleController,
		external: true,
		children: [
			{ key: "alkalab", path: l.arcade.alkalab, icon: FlaskConical, external: true },
			{ key: "rustcraft", path: l.arcade.rustcraft, icon: Pickaxe, external: true },
			{ key: "snake", path: l.arcade.snake, icon: Gamepad2, external: true },
			{ key: "suprememc", path: l.arcade.suprememc, icon: Blocks, external: true },
		],
	},
	{ key: "connect_four", path: l.connect_four, icon: TbGridDots, external: true },
	{ key: "formatter", path: l.menu.formatter, icon: VscJson },
	{ key: "portfolio_translator", path: l.menu.languages, icon: VscGlobe },
	{ key: "tiger", path: l.menu.tiger, icon: VscTerminal },
];
