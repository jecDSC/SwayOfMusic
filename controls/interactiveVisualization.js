import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
// import { plotUserMovement } from "./combinedVisualization.js";

// D3 and visualization setup constants
const width = 600;
const height = 600;
const margin = 40;

// Scales
const xScale = d3
  .scaleLinear()
  .domain([-30, 30])
  .range([margin, width - margin]);

const yScale = d3
  .scaleLinear()
  .domain([-30, 30])
  .range([height - margin, margin]);

let svg;
let personImage;
let recordedDotsGroup;
const personWidth = 30;
const personHeight = 40;

let isRecording = false;
let movementData = [];
let currentX = 0;
let currentY = 0;
const moveStep = 0.2;
let keysPressed = {};
let animationFrameId;
let recordingTimeoutId;
let countdownIntervalId;

let startRecordingBtn;
let visContainer;
let statusMessageElement;

const RECORDING_DURATION_MS = 10000;
const MIN_RECORD_INTERVAL_MS = 1; // Throttle for recording points
let lastRecordTime = 0;

// --- ES6 Module Exports ---
let _onDataReadyCallback = null;

export function getRecordedMovementData() {
  return [...movementData];
}

export function onMovementDataReady(callback) {
  if (typeof callback === "function") {
    _onDataReadyCallback = callback;
  } else {
    console.error("onMovementDataReady: Provided callback is not a function.");
  }
}
// --- End ES6 Module Exports ---

async function renderViewbox() {
  if (!visContainer) {
    console.error(
      "#interactive-vis container not found by renderViewbox. SVG cannot be appended."
    );
    return;
  }

  svg = d3
    .select("#interactive-vis")
    .append("svg")
    .attr("id", "interactive-main-vis-svg")
    .attr("width", width)
    .attr("height", height)
    .attr("tabindex", 0)
    .style("outline", "none");

  // Grid and Axis rendering
  svg
    .append("g")
    .attr("class", "grid")
    .selectAll("line.h")
    .data(d3.range(-30, 31))
    .join("line")
    .attr("x1", xScale(-30))
    .attr("x2", xScale(30))
    .attr("y1", (d) => yScale(d))
    .attr("y2", (d) => yScale(d))
    .attr("stroke", "#eee");
  svg
    .append("g")
    .attr("class", "grid")
    .selectAll("line.v")
    .data(d3.range(-30, 31))
    .join("line")
    .attr("y1", yScale(-30))
    .attr("y2", yScale(30))
    .attr("x1", (d) => xScale(d))
    .attr("x2", (d) => xScale(d))
    .attr("stroke", "#eee");
  svg
    .append("g")
    .attr("class", "x-axis axis")
    .attr("transform", `translate(0,${yScale(0)})`)
    .call(d3.axisBottom(xScale).ticks(10).tickSizeOuter(0));
  svg
    .append("g")
    .attr("class", "y-axis axis")
    .attr("transform", `translate(${xScale(0)},0)`)
    .call(d3.axisLeft(yScale).ticks(10).tickSizeOuter(0));

  recordedDotsGroup = svg.append("g").attr("class", "recorded-dots-trail");

  personImage = svg
    .append("image")
    .attr("id", "interactive-person")
    .attr("href", "../assets/human.png")
    .attr("alt", "person icon")
    .attr("width", personWidth * 3)
    .attr("height", personHeight * 3)
    .attr("x", xScale(currentX) - (personWidth * 3) / 2)
    .attr("y", yScale(currentY) - (personHeight * 3) / 2)
    .on("error", function () {
      d3.select(this).attr(
        "href",
        "https://placehold.co/40x50/3498db/ffffff?text=P"
      );
    });

  if (personImage && typeof personImage.raise === "function") {
    personImage.raise();
  }
}

function updatePersonPosition() {
  if (personImage) {
    personImage
      .attr("x", xScale(currentX) - (personWidth * 3) / 2)
      .attr("y", yScale(currentY) - (personHeight * 3) / 2);
  }
}

// This function now only handles the visual plotting of a dot.
function addRecordedDot(finalX, finalY) {
  if (recordedDotsGroup) {
    recordedDotsGroup
      .append("circle")
      .attr("cx", xScale(finalX))
      .attr("cy", yScale(finalY))
      .attr("r", 5)
      .attr("fill", "steelblue")
      .attr("opacity", "40%")
      .attr("stroke-width", 0.5);
  }
}

function movementLoop() {
  if (!isRecording) {
    cancelAnimationFrame(animationFrameId);
    return;
  }

  let moved = false;
  if (keysPressed["ArrowRight"]) {
    currentX = Math.min(xScale.domain()[1], currentX + moveStep);
    moved = true;
  }
  if (keysPressed["ArrowLeft"]) {
    currentX = Math.max(xScale.domain()[0], currentX - moveStep);
    moved = true;
  }
  if (keysPressed["ArrowUp"]) {
    currentY = Math.min(yScale.domain()[1], currentY + moveStep);
    moved = true;
  }
  if (keysPressed["ArrowDown"]) {
    currentY = Math.max(yScale.domain()[0], currentY - moveStep);
    moved = true;
  }

  const timestamp = Date.now();
  // Throttle recording and only save point if moved.
  if (moved && timestamp - lastRecordTime >= MIN_RECORD_INTERVAL_MS) {
    updatePersonPosition();

    // CHANGED: Calculate wobble/offset here to include it in the saved data
    const offsetMagnitude = 0.2;
    const randomOffsetX = (Math.random() * 2 - 1) * offsetMagnitude;
    const randomOffsetY = (Math.random() * 2 - 1) * offsetMagnitude;

    // Create the final data point with the offset included
    const dataPoint = {
      timestamp: timestamp,
      x: parseFloat((currentX + randomOffsetX).toFixed(2)),
      y: parseFloat((currentY + randomOffsetY).toFixed(2)),
    };

    movementData.push(dataPoint);
    addRecordedDot(dataPoint.x, dataPoint.y); // Plot the same offset point
    lastRecordTime = timestamp; // Update the time of the last recording
  }

  animationFrameId = requestAnimationFrame(movementLoop);
}

function stopRecording() {
  isRecording = false;
  clearTimeout(recordingTimeoutId);
  clearInterval(countdownIntervalId);
  cancelAnimationFrame(animationFrameId);

  const message = `Recording finished. ${movementData.length} data points collected.`;
  if (statusMessageElement) {
    statusMessageElement.textContent = message;
  } else {
    console.log(message);
  }

  if (movementData.length > 0) {
    if (_onDataReadyCallback) {
      try {
        _onDataReadyCallback(getRecordedMovementData());
      } catch (e) {
        console.error("Error in onMovementDataReady callback:", e);
      }
    }
  }

  if (startRecordingBtn) {
    startRecordingBtn.disabled = false;
    startRecordingBtn.textContent = "Start Movement Recording";
  }
  keysPressed = {};
}

function startRecording() {
  if (isRecording) return;
  if (!visContainer || !svg) {
    return;
  }
  if (recordedDotsGroup) {
    recordedDotsGroup.selectAll("circle").remove();
  }

  isRecording = true;
  movementData = [];
  currentX = 0;
  currentY = 0;
  lastRecordTime = 0;
  updatePersonPosition();

  let secondsRemaining = RECORDING_DURATION_MS / 1000;
  if (startRecordingBtn) {
    startRecordingBtn.disabled = true;
    startRecordingBtn.textContent = `Recording... (${secondsRemaining}s left)`;
  }
  clearInterval(countdownIntervalId);
  countdownIntervalId = setInterval(() => {
    secondsRemaining--;
    if (startRecordingBtn) {
      startRecordingBtn.textContent = `Recording... (${Math.max(
        0,
        secondsRemaining
      )}s left)`;
      if (secondsRemaining <= 0) clearInterval(countdownIntervalId);
    }
  }, 1000);

  if (svg && svg.node()) {
    svg.node().focus();
  }
  movementLoop();
  recordingTimeoutId = setTimeout(stopRecording, RECORDING_DURATION_MS);
}

function handleKeyDown(event) {
  if (!isRecording) return;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    keysPressed[event.key] = true;
    event.preventDefault();
  }
}

function handleKeyUp(event) {
  if (!isRecording) return;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    keysPressed[event.key] = false;
    event.preventDefault();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  startRecordingBtn = document.getElementById("startRecordingBtn");
  statusMessageElement = document.getElementById("statusMessage");
  visContainer = document.getElementById("interactive-vis");

  if (visContainer) {
    renderViewbox().then(() => {
      if (startRecordingBtn) {
        startRecordingBtn.addEventListener("click", startRecording);
      }
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);
    });
  }
});
