const form = document.querySelector("#calculator-form");
const advancedFields = document.querySelector("#advanced-fields");
const toggleAdvancedButton = document.querySelector("#toggle-advanced");

const outputs = {
  bottomTime: document.querySelector("#bottomTime"),
  summary: document.querySelector("#resultSummary"),
  ambientPressure: document.querySelector("#ambientPressure"),
  usableAir: document.querySelector("#usableAir"),
  depthConsumption: document.querySelector("#depthConsumption"),
  formulaList: document.querySelector("#formulaList"),
};

const chart = {
  svg: document.querySelector("#chart"),
  grid: document.querySelector("#chart-grid"),
  line: document.querySelector("#chart-line"),
  focusX: document.querySelector("#chart-focus-x"),
  focusY: document.querySelector("#chart-focus-y"),
  point: document.querySelector("#chart-point"),
  label: document.querySelector("#chart-label"),
};

const CHART = {
  width: 640,
  height: 360,
  paddingTop: 28,
  paddingRight: 28,
  paddingBottom: 42,
  paddingLeft: 56,
  maxDepth: 40,
};

function formatNumber(value, fractionDigits = 1) {
  return new Intl.NumberFormat("pl-PL", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

function formatSmart(value) {
  return Number.isInteger(value) ? String(value) : formatNumber(value, 1);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getValues() {
  const data = new FormData(form);

  return {
    depth: Number(data.get("depth")),
    tankVolume: Number(data.get("tankVolume")),
    sacRate: Number(data.get("sacRate")),
    tankPressure: Number(data.get("tankPressure")),
    reservePressure: Number(data.get("reservePressure")),
  };
}

function calculateDive(values) {
  const depth = clamp(values.depth, 1, 60);
  const tankVolume = clamp(values.tankVolume, 0.1, 30);
  const sacRate = clamp(values.sacRate, 0.1, 60);
  const tankPressure = clamp(values.tankPressure, 1, 300);
  const reservePressure = clamp(values.reservePressure, 0, tankPressure - 1);

  const ambientPressure = 1 + depth / 10;
  const usableAir = tankVolume * (tankPressure - reservePressure);
  const depthConsumption = sacRate * ambientPressure;
  const bottomTime = usableAir / depthConsumption;

  return {
    depth,
    tankVolume,
    sacRate,
    tankPressure,
    reservePressure,
    ambientPressure,
    usableAir,
    depthConsumption,
    bottomTime,
  };
}

function buildSeries(values) {
  return Array.from({ length: CHART.maxDepth }, (_, index) => {
    const depth = index + 1;
    const point = calculateDive({ ...values, depth });
    return { depth, bottomTime: point.bottomTime };
  });
}

function buildPath(series, maxTime) {
  return series
    .map((point, index) => {
      const x = scaleX(point.depth);
      const y = scaleY(point.bottomTime, maxTime);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function scaleX(depth) {
  const innerWidth = CHART.width - CHART.paddingLeft - CHART.paddingRight;
  return CHART.paddingLeft + ((depth - 1) / (CHART.maxDepth - 1)) * innerWidth;
}

function scaleY(time, maxTime) {
  const innerHeight = CHART.height - CHART.paddingTop - CHART.paddingBottom;
  return CHART.paddingTop + (1 - time / maxTime) * innerHeight;
}

function renderGrid(maxTime) {
  const innerBottom = CHART.height - CHART.paddingBottom;
  const innerRight = CHART.width - CHART.paddingRight;
  const depthTicks = [1, 10, 20, 30, 40];
  const timeTicks = [0, 15, 30, 45, 60, Math.ceil(maxTime / 5) * 5].filter(
    (value, index, list) => list.indexOf(value) === index && value <= Math.ceil(maxTime / 5) * 5
  );

  const parts = [];

  depthTicks.forEach((depth) => {
    const x = scaleX(depth);
    parts.push(`<line class="chart-grid-line" x1="${x}" y1="${CHART.paddingTop}" x2="${x}" y2="${innerBottom}"></line>`);
    parts.push(`<text class="chart-axis-label" x="${x}" y="${CHART.height - 14}" text-anchor="middle">${depth} m</text>`);
  });

  timeTicks.forEach((time) => {
    const y = scaleY(time, maxTime);
    parts.push(`<line class="chart-grid-line" x1="${CHART.paddingLeft}" y1="${y}" x2="${innerRight}" y2="${y}"></line>`);
    parts.push(`<text class="chart-axis-label" x="18" y="${y + 5}" text-anchor="start">${time}</text>`);
  });

  parts.push(`<line class="chart-axis" x1="${CHART.paddingLeft}" y1="${innerBottom}" x2="${innerRight}" y2="${innerBottom}"></line>`);
  parts.push(`<line class="chart-axis" x1="${CHART.paddingLeft}" y1="${CHART.paddingTop}" x2="${CHART.paddingLeft}" y2="${innerBottom}"></line>`);
  parts.push(`<text class="chart-axis-label" x="${CHART.width / 2}" y="${CHART.height - 8}" text-anchor="middle">Głębokość [m]</text>`);
  parts.push(
    `<text class="chart-axis-label" x="18" y="${CHART.height / 2}" text-anchor="middle" transform="rotate(-90 18 ${CHART.height / 2})">Czas [min]</text>`
  );

  chart.grid.innerHTML = parts.join("");
}

function updateChart(result, values) {
  const series = buildSeries(values);
  const maxTime = Math.max(75, ...series.map((point) => point.bottomTime));
  chart.line.setAttribute("d", buildPath(series, maxTime));

  renderGrid(maxTime);

  const x = scaleX(result.depth);
  const y = scaleY(result.bottomTime, maxTime);
  const innerBottom = CHART.height - CHART.paddingBottom;
  const innerRight = CHART.width - CHART.paddingRight;

  chart.focusX.setAttribute("x1", x);
  chart.focusX.setAttribute("x2", x);
  chart.focusX.setAttribute("y1", CHART.paddingTop);
  chart.focusX.setAttribute("y2", innerBottom);

  chart.focusY.setAttribute("x1", CHART.paddingLeft);
  chart.focusY.setAttribute("x2", innerRight);
  chart.focusY.setAttribute("y1", y);
  chart.focusY.setAttribute("y2", y);

  chart.point.setAttribute("cx", x);
  chart.point.setAttribute("cy", y);

  chart.label.setAttribute("x", x + 12);
  chart.label.setAttribute("y", y - 12);
  chart.label.textContent = `${Math.round(result.bottomTime)} min przy ${result.depth} m`;
}

function updateView() {
  const values = getValues();
  const result = calculateDive(values);

  outputs.bottomTime.textContent = `${Math.round(result.bottomTime)} min`;
  outputs.summary.textContent = `Dla ${formatSmart(result.depth)} m, butli ${formatSmart(result.tankVolume)} l i SAC ${formatSmart(result.sacRate)} l/min.`;
  outputs.ambientPressure.textContent = `${formatNumber(result.ambientPressure, 1)} bar`;
  outputs.usableAir.textContent = `${Math.round(result.usableAir)} l`;
  outputs.depthConsumption.textContent = `${Math.round(result.depthConsumption)} l/min`;

  outputs.formulaList.innerHTML = `
    <li>Pamb = 1 + ${formatSmart(result.depth)} / 10 = ${formatNumber(result.ambientPressure, 1)} bar</li>
    <li>Vusable = ${formatSmart(result.tankVolume)} × (${formatSmart(result.tankPressure)} - ${formatSmart(result.reservePressure)}) = ${Math.round(result.usableAir)} l</li>
    <li>SCR = ${formatSmart(result.sacRate)} × ${formatNumber(result.ambientPressure, 1)} = ${Math.round(result.depthConsumption)} l/min</li>
    <li>T = ${Math.round(result.usableAir)} / ${Math.round(result.depthConsumption)} = ${Math.round(result.bottomTime)} min</li>
  `;

  updateChart(result, values);
}

toggleAdvancedButton.addEventListener("click", () => {
  const hidden = advancedFields.classList.toggle("is-hidden");
  toggleAdvancedButton.textContent = hidden ? "Pokaż ustawienia" : "Ukryj ustawienia";
});

form.addEventListener("input", updateView);
form.addEventListener("submit", (event) => event.preventDefault());

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Brak rejestracji nie blokuje działania kalkulatora.
    });
  });
}

updateView();
