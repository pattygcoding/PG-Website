import type { IconType } from "react-icons";
import { GiConsoleController } from "react-icons/gi";
import { VscTerminal, VscGlobe, VscJson, VscFileCode } from "react-icons/vsc";
import { TbArrowsLeftRight, TbCpu, TbGridDots, TbLock, TbSitemap } from "react-icons/tb";
import { Blocks, FlaskConical, Gamepad2, Pickaxe } from "./lucide-icons";
import l from "@/assets/links/links.json";

export interface ProjectCatalogEntry {
	key: string;
	/** Omitted for a group that has no landing page of its own, e.g. Framework Trees. */
	path?: string;
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
	{
		key: "framework_trees",
		icon: TbSitemap,
		children: [
			{ key: "connect_four", path: l.framework_trees.connect_four, icon: TbGridDots, external: true },
			{ key: "interops", path: l.framework_trees.interop, icon: TbArrowsLeftRight, external: true },
			{ key: "rijndael_encryption", path: l.framework_trees.encryption, icon: TbLock, external: true },
			{ key: "turing_machines", path: l.framework_trees.turing, icon: TbCpu, external: true },
		],
	},
	{ key: "formatter", path: l.menu.formatter, icon: VscJson },
	{ key: "portfolio_translator", path: l.menu.languages, icon: VscGlobe },
	{ key: "scripting_library", path: l.scripts.home, icon: VscFileCode, external: true },
	{ key: "tiger", path: l.menu.tiger, icon: VscTerminal },
];
