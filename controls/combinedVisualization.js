import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { onMovementDataReady } from "./interactiveVisualization.js";

// --- Constants and D3 Setup ---
const W = 600; // Width of the SVG
const H = 600; // Height of the SVG
const M = 40; // Margin

const USER_COLOR = "steelblue";
const SUBJECT_COLOR = "crimson";

// Scales to map data coordinates to SVG pixels
const x = d3
  .scaleLinear()
  .domain([-30, 30])
  .range([M, W - M]);
const y = d3
  .scaleLinear()
  .domain([-30, 30])
  .range([H - M, M]);

let svg;
let userDotsGroup;
let subjectDotsGroup;

/**
 * Plots data for the selected subject.
 */
async function updateSubjectTrail() {
  const subjSel = document.querySelector("#combined-subject-select");
  if (!subjSel || !subjectDotsGroup) return;

  const subj = subjSel.value;
  const file = `data/${subj}/ECR.csv`; // Path is fixed

  subjectDotsGroup.selectAll("*").remove();

  try {
    const data = await d3.csv(file, (d) => ({ x: +d.My, y: +d.Mx }));

    subjectDotsGroup
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => x(d.x))
      .attr("cy", (d) => y(d.y))
      .attr("r", 5) // CHANGED: Matched radius
      .attr("opacity", "40%"); // CHANGED: Matched opacity
    console.log(
      `Successfully plotted ${data.length} points for subject ${subj}.`
    );
  } catch (error) {
    console.error(`Failed to load or plot data from ${file}:`, error);
  }
}

/**
 * Plots the user's recorded movement data.
 */
function plotUserMovement(data) {
  if (!svg || !userDotsGroup) {
    console.error(
      "Combined visualization is not initialized. Cannot plot user data."
    );
    return;
  }
  userDotsGroup.selectAll("*").remove();

  userDotsGroup
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", (d) => x(d.x))
    .attr("cy", (d) => y(d.y))
    .attr("r", 5)
    .attr("opacity", "40%");

  console.log(`Plotted ${data.length} user-recorded movement points.`);
}

/**
 * Creates the initial visualization structure: SVG, grid, axes, and controls.
 */
function initializeVisualization() {
  const container = document.querySelector("#combined-vis");
  if (!container) return;

  if (!document.getElementById("combined-controls")) {
    const controlsHtml = `
        <div id="combined-controls" style="margin-bottom: 10px; color: #333;">
            <div style="margin-bottom: 5px; display: flex; align-items: center;">
            <span style="display: inline-block; width: 12px; height: 12px; background-color: ${USER_COLOR}; border-radius: 50%;"></span>
            <span style="margin-left: 8px;">Your Recorded Movement</span>
            </div>
            <div style="margin-bottom: 5px; display: flex; align-items: center;">
            <span style="display: inline-block; width: 12px; height: 12px; background-color: ${SUBJECT_COLOR}; border-radius: 50%;"></span>
            <span style="margin-left: 8px;">Subject Data (Eyes Closed, Normal Music)</span>
            </div>
            <label class="dropdown-labels" style="margin-top: 15px; display: block;">
            Select Subject to Compare:
            <select id="combined-subject-select" class="dropdown">
                <option value="S3">S3</option>
                <option value="S5">S5</option>
                <option value="S11">S11</option>
                <option value="S15">S15</option>
                <option value="S16">S16</option>
                <option value="S17">S17</option>
                <option value="S22">S22</option>
                <option value="S23">S23</option>
                <option value="S27">S27</option>
            </select>
            </label>
        </div>
    `;
    container.insertAdjacentHTML("afterbegin", controlsHtml);
  }

  svg = d3.select(container).append("svg").attr("width", W).attr("height", H);

  // Draw Gridlines and Axes
  svg
    .append("g")
    .attr("class", "grid")
    .selectAll("line")
    .data(d3.range(-30, 31, 10))
    .join("line")
    .attr("y1", y(-30))
    .attr("y2", y(30))
    .attr("x1", (d) => x(d))
    .attr("x2", (d) => x(d))
    .attr("stroke", "#eee");
  svg
    .append("g")
    .attr("class", "grid")
    .selectAll("line")
    .data(d3.range(-30, 31, 10))
    .join("line")
    .attr("x1", x(-30))
    .attr("x2", x(30))
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d))
    .attr("stroke", "#eee");
  svg
    .append("g")
    .attr("transform", `translate(0,${y(0)})`)
    .call(d3.axisBottom(x));
  svg
    .append("g")
    .attr("transform", `translate(${x(0)},0)`)
    .call(d3.axisLeft(y));

  subjectDotsGroup = svg.append("g").attr("fill", SUBJECT_COLOR);
  userDotsGroup = svg.append("g").attr("fill", USER_COLOR);

  const subjSel = document.querySelector("#combined-subject-select");
  if (subjSel) {
    subjSel.addEventListener("change", updateSubjectTrail);
  }
  updateSubjectTrail();
}

// --- Main Execution ---
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("combined-vis")) {
    initializeVisualization();
    onMovementDataReady(plotUserMovement);
  }
});
