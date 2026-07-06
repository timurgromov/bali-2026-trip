import fs from "node:fs";

const data = JSON.parse(fs.readFileSync(new URL("../src/data/trip.json", import.meta.url), "utf8"));
const serialized = JSON.stringify(data);

const forbidden = [
  ["timur", "gromov", ".ru"].join(""),
  "PNR",
  "passport",
  "серия паспорта",
  "номер паспорта",
  "паспортные данные",
  "e-ticket",
  "номер билета"
];

const hits = forbidden.filter((item) => serialized.toLowerCase().includes(item.toLowerCase()));
if (hits.length > 0) {
  throw new Error(`Forbidden public data/reference found: ${hits.join(", ")}`);
}

const points = data.map.points;
const orders = points.map((point) => point.order);
const uniqueOrders = new Set(orders);
const routeLabels = data.map.routeLabels;

if (!routeLabels?.main || !routeLabels?.island || !routeLabels?.optional) {
  throw new Error("Map routeLabels must explain main, island, and optional lines");
}

if (points.length < 10) {
  throw new Error(`Expected at least 10 map points, got ${points.length}`);
}

if (uniqueOrders.size !== points.length) {
  throw new Error("Map point orders must be unique");
}

for (let order = 1; order <= points.length; order += 1) {
  if (!uniqueOrders.has(order)) {
    throw new Error(`Missing map point order ${order}`);
  }
}

for (const point of points) {
  if (!point.title || !point.description || !point.dateLabel || !point.lat || !point.lng) {
    throw new Error(`Point ${point.order} is missing title, dateLabel, description, lat, or lng`);
  }
}

if (!Array.isArray(data.places) || data.places.length < 20) {
  throw new Error("Expected places directory with at least 20 entries");
}

for (const place of data.places) {
  if (!place.name || !place.description || !place.familyNote || !place.duration) {
    throw new Error(`Place "${place.name || "unknown"}" is missing required public description fields`);
  }
}

if (!Array.isArray(data.dayDetails) || data.dayDetails.length < 20) {
  throw new Error("Expected detailed day plan entries");
}

for (const detail of data.dayDetails) {
  if (!detail.date || !detail.focus || !detail.fallback || !Array.isArray(detail.timing) || detail.timing.length === 0) {
    throw new Error(`Day detail "${detail.date || "unknown"}" is incomplete`);
  }
}

for (const section of ["budgetSummary", "decisions", "resources"]) {
  if (!Array.isArray(data[section]) || data[section].length === 0) {
    throw new Error(`Missing ${section}`);
  }
}

console.log("trip.json validation passed");
