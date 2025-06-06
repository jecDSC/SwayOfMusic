import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// For main vis
const width = 600;
const height = 600;
const margin = 40;
const xScale = d3
  .scaleLinear()
  .domain([-30, 30])
  .range([margin, width - margin]);
const yScale = d3
  .scaleLinear()
  .domain([-30, 30])
  .range([height - margin, margin]);

// For sub vis
const widths1 = 600;
const heights1 = 250;
const margins1 = { top: 40, right: 20, bottom: 40, left: 60 };
const margins2 = 20;
let curTime = 60;
let xScales1 = d3
  .scaleLinear()
  .domain([0, curTime])
  .range([margins1.left, widths1 - margins1.right]);
const yScales1 = d3
  .scaleLinear()
  .domain([0, 45])
  .range([heights1 - margins1.top, margins1.bottom]);

async function renderViewbox() {
  const svg = d3
    .select("#vis")
    .append("svg")
    .attr("id", "main-vis")
    .attr("width", width)
    .attr("height", height);

  // Draw gridlines
  svg
    .append("g")
    .attr("class", "grid")
    .selectAll("line.horizontal")
    .data(d3.range(-30, 31))
    .enter()
    .append("line")
    .attr("x1", xScale(-30))
    .attr("x2", xScale(30))
    .attr("y1", (d) => yScale(d))
    .attr("y2", (d) => yScale(d))
    .attr("stroke", "#eee");

  svg
    .append("g")
    .attr("class", "grid")
    .selectAll("line.vertical")
    .data(d3.range(-30, 31))
    .enter()
    .append("line")
    .attr("y1", yScale(-30))
    .attr("y2", yScale(30))
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
    .append("image")
    .attr("id", "person")
    .attr("href", "https://jecdsc.github.io/TheSwayOfMusic/assets/human.png")
    .attr("alt", "person icon")
    .attr("x", xScale(0) - 50)
    .attr("y", yScale(0) - 50)
    .attr("height", "100px")
    .attr("width", "100px");

  svg
    .append("image")
    .attr("id", "exp-bg")
    .attr("href", "https://jecdsc.github.io/TheSwayOfMusic/assets/background.png")
    .attr("alt", "background")
    .attr("x", xScale(-30) - 190)
    .attr("y", yScale(30));
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
let timeSet = document.querySelector("#showTime");

let dataurl;

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
  if (selectEye.value == "false") {
    if (selectMus.value == "normal") {
      dataurl = `data/${selectSub.value}/ECR.csv`;
    } else if (selectMus.value == "loud") {
      dataurl = `data/${selectSub.value}/ECL1.csv`;
    } else if (selectMus.value == "louder") {
      dataurl = `data/${selectSub.value}/ECL2.csv`;
    } else if (selectMus.value == "off") {
      dataurl = `data/${selectSub.value}/ECN.csv`;
    }
  } else if (selectEnv.value == "on") {
    if (selectMus.value == "loud") {
      dataurl = `data/${selectSub.value}/WL1.csv`;
    } else if (selectMus.value == "louder") {
      dataurl = `data/${selectSub.value}/WL2.csv`;
    } else if (selectMus.value == "off") {
      dataurl = `data/${selectSub.value}/WN.csv`;
    } else if (selectMus.value == "normal") {
      dataurl = `data/${selectSub.value}/WR.csv`;
    }
  } else if (selectMus.value == "loud") {
    dataurl = `data/${selectSub.value}/WOL1.csv`;
  } else if (selectMus.value == "louder") {
    dataurl = `data/${selectSub.value}/WOL2.csv`;
  } else if (selectMus.value == "off") {
    dataurl = `data/${selectSub.value}/WON.csv`;
  } else if (selectMus.value == "normal") {
    dataurl = `data/${selectSub.value}/WOR.csv`;
  } else {
    alert("Data does not exist.");
    return;
  }
  console.log(
    `Params: Eyes Open: ${selectEye.value}; Music: ${selectMus.value}; Environment Moving: ${selectEnv.value}`
  );
  console.log(`Data chosen: ${dataurl}`);
  moveit(dataurl);
});

async function moveit(subject) {
  let newTime = Number(timeSet.value);
  if (newTime < 10 || newTime > 60) {
    alert("Invalid time!");
    return;
  }
  if (!(newTime >= 10 && newTime <= 60)) {
    alert("Invalid time!");
    return;
  }
  curTime = newTime;
  xScales1 = d3
    .scaleLinear()
    .domain([0, curTime])
    .range([margins1.left, widths1 - margins1.right]);
  subVis1();
  let bg = document.getElementById("exp-bg");
  bg.style.scale = "120%";
  console.log(typeof Number(timeSet.value));
  let data = await loadData(subject);
  d3.select("#trial-dots").remove();
  d3.select("#dist-origin").remove();
  document.getElementById("Change").disabled = "true";
  const dots = d3.select("#main-vis").append("g").attr("id", "trial-dots");
  const lines = d3.select("#subv1").append("g").attr("id", "dist-origin");
  const line = d3
    .line()
    .x((d) => xScales1(+d.Time))
    .y((d) => yScales1(Math.sqrt(Math.pow(+d.My, 2) + Math.pow(+d.Mx, 2))));
  let id = null;
  const elem = document.getElementById("person");
  elem.setAttribute("x", xScale(0) - 34);
  elem.setAttribute("y", yScale(0) + 20);
  let move = selectEnv.value;
  let eyes = selectEye.value;
  if (eyes == "true") {
    bg.style.opacity = "25%";
  } else if (eyes == "false") {
    bg.style.opacity = "0%";
  }
  console.log(eyes);
  let pos = 0;
  clearInterval(id);
  id = setInterval(frame, 20);
  function frame() {
    if (pos == Math.round((curTime / 60) * 1000) - 1) {
      clearInterval(id);
      document.getElementById("Change").removeAttribute("disabled");
    } else {
      pos++;
      elem.setAttribute("x", xScale(data[pos].My) - 84);
      elem.setAttribute("y", yScale(data[pos].Mx) - 38);
      dots
        .append("circle")
        .attr("class", "live-data")
        .attr("cx", (d) => xScale(data[pos].My) - 34)
        .attr("cy", (d) => xScale(-data[pos].Mx) + 20)
        .attr("r", 5)
        .attr("fill", "steelblue")
        .attr("opacity", "40%");
      lines
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line(data.slice(0, pos + 1)));
      if (move == "on") {
        bg.style.scale = `${(Number(bg.style.scale) + 0.002) * 100}%`;
      }
    }
  }
}

async function subVis1() {
  d3.select("#subv1").remove();
  const svg = d3
    .select("#vis1-sub")
    .append("svg")
    .attr("id", "subv1")
    .attr("width", widths1)
    .attr("height", heights1);

  // Draw axes
  svg
    .append("g")
    .attr("transform", `translate(0,${yScales1(0)})`)
    .call(d3.axisBottom(xScales1).ticks(10));

  svg
    .append("g")
    .attr("transform", `translate(${xScales1(0)},0)`)
    .call(d3.axisLeft(yScales1).ticks(10));

  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", 585)
    .attr("y", 245)
    .text("Time (Seconds)");

  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", 25)
    .attr("x", -margins1.top)
    .text("Distance from Origin");
}

async function subVis2() {
  const svg = d3
    .select("#vis2-sub")
    .append("svg")
    .attr("id", "subv2")
    .attr("width", widths1)
    .attr("height", heights1);

  // Draw axes
  svg
    .append("g")
    .attr("transform", `translate(0,${yScales1(0)})`)
    .call(d3.axisBottom(xScales1).ticks(10));

  svg
    .append("g")
    .attr("transform", `translate(${xScales1(0)},0)`)
    .call(d3.axisLeft(yScales1).ticks(10));
}

renderViewbox();
subVis1();
// subVis2();
