/* controls/secondaryVisualization.js */
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const COLORS = ["red", "green", "blue"];
const W = 600,
  H = 600,
  M = 40;

const x = d3
  .scaleLinear()
  .domain([-30, 30])
  .range([M, W - M]);
const y = d3
  .scaleLinear()
  .domain([-30, 30])
  .range([H - M, M]);

export function initHeadSwayOverlay(container = "#sway-app") {
  const root = document.querySelector(container);

  const subjSel = document.querySelector("#subject-select");
  const trailControls = COLORS.map((_, i) => ({
    musSel: document.querySelector(`#trail${i}-music`),
    envSel: document.querySelector(`#trail${i}-env`),
    eyeSel: document.querySelector(`#trail${i}-eyes`),
  }));

  subjSel.addEventListener("change", updateAll);
  trailControls.forEach((c, i) => {
    c.musSel.addEventListener("change", () => updateTrail(i));
    c.envSel.addEventListener("change", () => updateTrail(i));
    c.eyeSel.addEventListener("change", () => updateTrail(i));
  });

  const svg = d3
    .select(root.querySelector("#head-sway-svg"))
    .attr("width", W)
    .attr("height", H);

  svg
    .append("g")
    .attr("class", "grid")
    .selectAll("line.h")
    .data(d3.range(-30, 31))
    .join("line")
    .attr("x1", x(-30))
    .attr("x2", x(30))
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d))
    .attr("stroke", "#eee");

  svg
    .append("g")
    .attr("class", "grid")
    .selectAll("line.v")
    .data(d3.range(-30, 31))
    .join("line")
    .attr("y1", y(-30))
    .attr("y2", y(30))
    .attr("x1", (d) => x(d))
    .attr("x2", (d) => x(d))
    .attr("stroke", "#eee");

  svg
    .append("g")
    .attr("transform", `translate(0,${y(0)})`)
    .call(d3.axisBottom(x).ticks(10));

  svg
    .append("g")
    .attr("transform", `translate(${x(0)},0)`)
    .call(d3.axisLeft(y).ticks(10));

  const trailGroups = COLORS.map((c) =>
    svg.append("g").attr("stroke", c).attr("fill", c)
  );

  async function updateTrail(idx) {
    const subj = subjSel.value;
    const mus = trailControls[idx].musSel.value;
    const env = trailControls[idx].envSel.value;
    const eye = trailControls[idx].eyeSel.value;

    const file = filePath(subj, mus, env, eye);

    if (!file) {
      trailGroups[idx].selectAll("*").remove();
      return;
    }

    const data = await d3.csv(file, (d) => ({ x: +d.My, y: +d.Mx }));
    const g = trailGroups[idx];
    g.selectAll("*").remove();

    g.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => x(d.x))
      .attr("cy", (d) => y(d.y))
      .attr("r", 2.2)
      .attr("opacity", 0.4);
  }

  function updateAll() {
    COLORS.forEach((_, i) => updateTrail(i));
  }
  updateAll();
}

function filePath(subject, music, env, eyes) {
  const eyeOpen = eyes === "Open";
  const envOn = env === "On";
  const none = subject === "None";

  if (none) {
    return null;
  }
  if (!eyeOpen) {
    if (music === "Normal") return `data/${subject}/ECR.csv`;
    if (music === "+0.10 Hz") return `data/${subject}/ECL1.csv`;
    if (music === "+0.25 Hz") return `data/${subject}/ECL2.csv`;
    if (music === "Off") return `data/${subject}/ECN.csv`;
  } else if (envOn) {
    if (music === "Normal") return `data/${subject}/WR.csv`;
    if (music === "+0.10 Hz") return `data/${subject}/WL1.csv`;
    if (music === "+0.25 Hz") return `data/${subject}/WL2.csv`;
    if (music === "Off") return `data/${subject}/WN.csv`;
  } else {
    if (music === "Normal") return `data/${subject}/WOR.csv`;
    if (music === "+0.10 Hz") return `data/${subject}/WOL1.csv`;
    if (music === "+0.25 Hz") return `data/${subject}/WOL2.csv`;
    if (music === "Off") return `data/${subject}/WON.csv`;
  }
  return null;
}

window.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("secondaryVisualization")) {
    initHeadSwayOverlay("#secondaryVisualization");
  }
});
