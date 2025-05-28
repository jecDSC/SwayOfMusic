import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const width = 1000;
const height = 600;
const xScale = d3.scaleLinear().domain([-50, 50]).range([0, width]);
const yScale = d3.scaleLinear().domain([-50, 50]).range([0, height]);

async function renderViewbox() {
  // Create SVG
  const svg = d3
    .select("#vis")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("id", "main")
    .style("overflow", "visible");

  const margin = { top: 30, right: 30, bottom: 30, left: 30 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);

  //   const gridlinesX = svg
  //     .append("g")
  //     .attr("class", "gridlines")
  //     .attr("transform", `translate(${usableArea.left}, 0)`);
  //   gridlinesX.call(
  //     d3.axisTop(xScale).tickFormat("").tickSize(-usableArea.height)
  //   );
  const gridlinesY = svg
    .append("g")
    .attr("class", "gridlines")
    .attr("transform", `translate(0, ${usableArea.top})`);
  gridlinesY.call(
    d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width)
  );

  // Set axes
  const xAxis = d3.axisTop(xScale);
  const yAxis = d3.axisRight(yScale);

  svg
    .append("g")
    .attr("transform", `translate(-30, ${usableArea.bottom})`)
    .call(xAxis);

  svg
    .append("g")
    .attr("transform", "translate(" + xScale.range()[1] / 2 + ", 0)")
    .call(yAxis);

  svg
    .append("image")
    .attr("id", "person")
    .attr("href", "assets/human.png")
    .attr("alt", "person image")
    .attr("height", "200")
    .attr("width", "200");

  const figure = document.getElementById("person");
  figure.setAttribute("x", xScale(0) - 114);
  figure.setAttribute("y", yScale(0) - 100);
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
      dataurl = "datatest/ECR.csv";
    } else if (selectMus.value == "loud") {
      dataurl = "datatest/ECL1.csv";
    } else if (selectMus.value == "louder") {
      dataurl = "datatest/ECL2.csv";
    } else if (selectMus.value == "off") {
      dataurl = "datatest/ECLN.csv";
    }
  } else if (selectEnv.value == "on") {
    if (selectMus.value == "loud") {
      dataurl = "datatest/WL1.csv";
    } else if (selectMus.value == "loud") {
      dataurl = "datatest/WL2.csv";
    } else if (selectMus.value == "off") {
      dataurl = "datatest/WN.csv";
    } else if (selectMus.value == "normal") {
      dataurl = "datatest/WR.csv";
    }
  } else if (selectMus.value == "loud") {
    dataurl = "datatest/WOL1.csv";
  } else if (selectMus.value == "louder") {
    dataurl = "datatest/WOL2.csv";
  } else if (selectMus.value == "off") {
    dataurl = "datatest/WON.csv";
  } else if (selectMus.value == "normal") {
    dataurl = "datatest/WOR.csv";
  }
  console.log(
    `Params: Eyes Open: ${selectEye.value}; Music: ${selectMus.value}; Environment Moving: ${selectEnv.value}`
  );
  console.log(`Data chosen: ${dataurl}`);
  moveit(dataurl);
});

async function moveit(subject) {
  let data = await loadData(subject);
  let id = null;
  const elem = document.getElementById("person");
  elem.setAttribute("x", xScale(0) - 114);
  elem.setAttribute("y", yScale(0) - 100);
  let pos = 0;
  clearInterval(id);
  id = setInterval(frame, 10);
  function frame() {
    if (pos == 599) {
      clearInterval(id);
    } else {
      pos++;
      elem.setAttribute("x", xScale(data[pos].My) - 114);
      elem.setAttribute("y", yScale(data[pos].Mx) - 100);
      console.log("running");
    }
  }
}

renderViewbox();
