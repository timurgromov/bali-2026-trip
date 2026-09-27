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

if (/\+?62[\s()-]*\d{3}[\s()-]*\d{3,4}[\s()-]*\d{3,4}/.test(serialized)) {
  throw new Error("Public trip data must not contain an Indonesian phone number");
}

const expectedBases = [
  "Canggu / LV8",
  "Gili Trawangan",
  "Gili Air",
  "Canggu — возвращение",
  "Umalas — семейная вилла",
  "Ubud / Metland Venya",
  "Uluwatu"
];

const actualBases = data.bases.map((base) => base.name);
if (JSON.stringify(actualBases) !== JSON.stringify(expectedBases)) {
  throw new Error(`Unexpected base order: ${actualBases.join(" -> ")}`);
}

const totalNights = data.bases.reduce((sum, base) => sum + base.nights, 0);
if (totalNights !== 19) {
  throw new Error(`Expected 19 nights, got ${totalNights}`);
}

if (!data.days.some((day) => day.date === "30 Oct" && day.base === "Umalas — семейная вилла")) {
  throw new Error("Wedding day must remain on the private family villa on 30 Oct");
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

const routeOrders = [
  ...data.map.routes.main,
  ...data.map.routes.island,
  ...data.map.routes.optional.flat()
];

for (const order of routeOrders) {
  if (!uniqueOrders.has(order)) {
    throw new Error(`Map route references missing point order ${order}`);
  }
}

for (const baseName of expectedBases) {
  const surfaces = {
    days: data.days.some((day) => day.base === baseName),
    map: points.some((point) => point.title.includes(baseName)),
    transfers: data.transfers.some((transfer) => transfer.from.includes(baseName) || transfer.to.includes(baseName))
  };

  const missing = Object.entries(surfaces).filter(([, present]) => !present).map(([surface]) => surface);
  if (missing.length > 0) {
    throw new Error(`Base "${baseName}" is missing from: ${missing.join(", ")}`);
  }
}

const activeRouteText = JSON.stringify({
  bases: data.bases,
  places: data.places,
  map: data.map,
  days: data.days,
  dayDetails: data.dayDetails,
  transfers: data.transfers
});
if (/Nusa Penida|Nusa Dua/i.test(activeRouteText)) {
  throw new Error("Nusa Penida and Nusa Dua must not remain in the active route data");
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

if (!Array.isArray(data.places) || data.places.length < 15) {
  throw new Error("Expected places directory with at least 15 entries");
}

for (const place of data.places) {
  if (!place.name || !place.description || !place.familyNote || !place.duration) {
    throw new Error(`Place "${place.name || "unknown"}" is missing required public description fields`);
  }

  if (place.mapsUrl && !/^https:\/\/(?:www\.)?(?:google\.com\/maps|maps\.app\.goo\.gl)/.test(place.mapsUrl)) {
    throw new Error(`Place "${place.name}" mapsUrl must open Google Maps`);
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
