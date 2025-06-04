import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const width = 600;
const height = 600;
const margin = 40;
const xScale = d3
  .scaleLinear()
  .domain([-20, 20])
  .range([margin, width - margin]);
const yScale = d3
  .scaleLinear()
  .domain([-20, 20])
  .range([height - margin, margin]);

async function renderViewbox() {
  const svg = d3
    .select("#vis")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Draw gridlines
  svg
    .append("g")
    .attr("class", "grid")
    .selectAll("line.horizontal")
    .data(d3.range(-20, 21))
    .enter()
    .append("line")
    .attr("x1", xScale(-20))
    .attr("x2", xScale(20))
    .attr("y1", (d) => yScale(d))
    .attr("y2", (d) => yScale(d))
    .attr("stroke", "#eee");

  svg
    .append("g")
    .attr("class", "grid")
    .selectAll("line.vertical")
    .data(d3.range(-20, 21))
    .enter()
    .append("line")
    .attr("y1", yScale(-20))
    .attr("y2", yScale(20))
    .attr("x1", (d) => xScale(d))
    .attr("x2", (d) => xScale(d))
    .attr("stroke", "#eee");

  // Draw axes
  svg
    .append("g")
    .attr("transform", `translate(0,${yScale(0)})`)
    .call(d3.axisBottom(xScale).ticks(10));

  svg
    .append("g")
    .attr("transform", `translate(${xScale(0)},0)`)
    .call(d3.axisLeft(yScale).ticks(10));

  svg
    .append("text")
    .text("🧍")
    .attr("id", "person")
    .attr("x", xScale(0) - 34)
    .attr("y", yScale(0) + 20)
    .attr("font-size", "50px")
    .attr("fill", "black");
}

async function loadData(path) {
  const data = await d3.csv(path);
  console.log("data found");
  return data;
}

let selectSub = document.querySelector("#Subject");
let selectMus = document.querySelector("#Music");
let selectEnv = document.querySelector("#Env");
let selectEye = document.querySelector("#Eyes");
let changeSet = document.querySelector("#Change");

let dataurl;
let running = false;

selectSub.addEventListener("input", function (event) {
  console.log("subject selected:", event.target.value);
});
selectMus.addEventListener("input", function (event) {
  console.log("music settings:", event.target.value);
});
selectEnv.addEventListener("input", function (event) {
  console.log("environment:", event.target.value);
});
selectEye.addEventListener("input", function (event) {
  console.log("eyes open:", event.target.value);
});
changeSet.addEventListener("click", function () {
  if (selectEye.value == "true") {
    if (selectMus.value == "normal") {
      dataurl = `data/${selectSub.value}/ECR.csv`;
    } else if (selectMus.value == "loud") {
      dataurl = `data/${selectSub.value}/ECL1.csv`;
    } else if (selectMus.value == "louder") {
      dataurl = `data/${selectSub.value}/ECL2.csv`;
    } else if (selectMus.value == "off") {
      dataurl = `data/${selectSub.value}/ECLN.csv`;
    }
  } else if (selectEnv.value == "on") {
    if (selectMus.value == "loud") {
      dataurl = `data/${selectSub.value}/WL1.csv`;
    } else if (selectMus.value == "loud") {
      dataurl = `data/${selectSub.value}/WL2.csv`;
    } else if (selectMus.value == "off") {
      dataurl = `data/${selectSub.value}/WN.csv`;
    } else if (selectMus.value == "normal") {
      dataurl = `data/${selectSub.value}/WN.csv`;
    }
  } else if (selectMus.value == "loud") {
    dataurl = `data/${selectSub.value}/WOL1.csv`;
  } else if (selectMus.value == "louder") {
    dataurl = `data/${selectSub.value}/WOL2.csv`;
  } else if (selectMus.value == "off") {
    dataurl = `data/${selectSub.value}/WON.csv`;
  } else if (selectMus.value == "normal") {
    dataurl = `data/${selectSub.value}/WOR.csv`;
  }
  console.log(
    `Params: Eyes Open: ${selectEye.value}; Music: ${selectMus.value}; Environment Moving: ${selectEnv.value}`
  );
  console.log(`Data chosen: ${dataurl}`);
  moveit(dataurl);
});

async function moveit(subject) {
  running = false;
  let data = await loadData(subject);
  let id = null;
  const elem = document.getElementById("person");
  elem.setAttribute("x", xScale(0) - 34);
  elem.setAttribute("y", yScale(0) + 20);
  let pos = 0;
  clearInterval(id);
  id = setInterval(frame, 100);
  function frame() {
    running = true;
    if (pos == 599) {
      clearInterval(id);
    } else {
      pos++;
      elem.setAttribute("x", xScale(data[pos].My) - 34);
      elem.setAttribute("y", yScale(data[pos].Mx) + 20);
      console.log("running");
    }
  }
}

renderViewbox();
