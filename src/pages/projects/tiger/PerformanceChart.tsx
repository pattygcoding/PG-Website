/**
 * The Tiger-vs-CPython chart shown beside the page description.
 *
 * The eight values are the asserted sections of the paired in-process protocol in
 * the Tiger repository (`benchmarks/python/README.md`). A ratio is Tiger's
 * execute-alone time over CPython's `exec` time, with each program's own compile
 * removed from both sides, so a bar that stops short of the 1.00x rule means Tiger
 * is faster on that section. The chart only draws measured values that already
 * live in the repository; it does not introduce new benchmark claims.
 */

interface Section {
	name: string;
	ratio: number;
}

const SECTIONS: ReadonlyArray<Section> = [
	{ name: "strings", ratio: 0.38 },
	{ name: "calls", ratio: 0.7 },
	{ name: "loop", ratio: 0.71 },
	{ name: "lists", ratio: 0.8 },
	{ name: "methods", ratio: 0.86 },
	{ name: "dicts", ratio: 0.89 },
	{ name: "all", ratio: 0.93 },
	{ name: "recursion", ratio: 0.94 },
];

const ROW_HEIGHT = 27;
const FIRST_ROW_TOP = 74;
const BAR_HEIGHT = 10;
const LABEL_X = 104;
const BAR_X = 114;
const TRACK_WIDTH = 272;
const RULE_X = BAR_X + TRACK_WIDTH;
const RATIO_X = RULE_X + 10;
const LAST_ROW_BOTTOM = FIRST_ROW_TOP + (SECTIONS.length - 1) * ROW_HEIGHT + 6 + BAR_HEIGHT;

interface PerformanceChartProps {
	className?: string;
}

const PerformanceChart = ({ className }: PerformanceChartProps) => (
	<figure className={className ? `tiger-perf-card ${className}` : "tiger-perf-card"}>
		<svg
			className="tiger-perf-chart"
			viewBox="0 0 440 302"
			role="img"
			aria-label="Tiger versus CPython: every asserted protocol section is at or ahead of CPython"
		>
			<title>Tiger vs CPython: every asserted protocol section at or ahead of CPython</title>

			<text className="tiger-perf-title" x={0} y={22}>
				Tiger vs CPython
			</text>
			<text className="tiger-perf-badge" x={440} y={22} textAnchor="end">
				lower is faster
			</text>
			<text className="tiger-perf-subtitle" x={0} y={44}>
				one fixed workload · both sides in process · compile removed
			</text>

			<text className="tiger-perf-rule-label" x={RULE_X} y={LAST_ROW_BOTTOM + 16} textAnchor="middle">
				1.00x
			</text>
			<line className="tiger-perf-rule" x1={RULE_X} y1={54} x2={RULE_X} y2={LAST_ROW_BOTTOM} />

			{SECTIONS.map((section, index) => {
				const top = FIRST_ROW_TOP + index * ROW_HEIGHT;
				const width = Math.round(section.ratio * TRACK_WIDTH);
				const labelY = top + 6 + BAR_HEIGHT / 2 + 4;
				return (
					<g key={section.name}>
						<text className="tiger-perf-label" x={LABEL_X} y={labelY} textAnchor="end">
							{section.name}
						</text>
						<rect
							className="tiger-perf-track"
							x={BAR_X}
							y={top + 6}
							width={TRACK_WIDTH}
							height={BAR_HEIGHT}
							rx={2}
						/>
						<rect
							className="tiger-perf-bar"
							x={BAR_X}
							y={top + 6}
							width={width}
							height={BAR_HEIGHT}
							rx={2}
						/>
						<text className="tiger-perf-ratio" x={RATIO_X} y={labelY}>
							{section.ratio.toFixed(2)}x
						</text>
					</g>
				);
			})}
		</svg>
		<figcaption className="tiger-perf-caption">
			<span className="tiger-perf-key">
				<i className="tiger-perf-swatch" aria-hidden="true" />Tiger, execute alone
			</span>
			<span className="tiger-perf-key">
				<i className="tiger-perf-swatch is-python" aria-hidden="true" />CPython, exec alone
			</span>
			<span className="tiger-perf-note">All eight asserted sections at or ahead of CPython.</span>
		</figcaption>
	</figure>
);

export default PerformanceChart;