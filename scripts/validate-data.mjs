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
  "Canggu / The Kemilau",
  "Ubud / Indica Luxury Villa",
  "Canggu — возвращение",
  "Umalas — семейная вилла",
  "Gili Trawangan",
  "Gili Air",
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

const ubudBase = data.bases.find((base) => base.name === "Ubud / Indica Luxury Villa");
const indicaBooking = ubudBase?.accommodation?.options?.[0];
if (!indicaBooking || indicaBooking.name !== "Indica Luxury Villa Ubud" || !/^https:\/\/www\.booking\.com\/hotel\/id\/indica-luxury-villa-ubud/.test(indicaBooking.url)) {
  throw new Error("Ubud base must include the active Indica Luxury Villa Ubud Booking.com link");
}

if (!data.days.some((day) => day.date === "30 Oct" && day.base === "Umalas — семейная вилла")) {
  throw new Error("Wedding day must remain on the private family villa on 30 Oct");
}

const points = data.map.points;
const orders = points.map((point) => point.order);
const uniqueOrders = new Set(orders);
const routeLabels = data.map.routeLabels;

if (!routeLabels?.main || !routeLabels?.daytrip || !routeLabels?.island || !routeLabels?.optional) {
  throw new Error("Map routeLabels must explain main, daytrip, island, and optional lines");
}

if (points.length < 10) {
  throw new Error(`Expected at least 10 map points, got ${points.length}`);
}

if (uniqueOrders.size !== points.length) {
  throw new Error("Map point orders must be unique");
}

const routeOrders = [
  ...data.map.routes.main,
  ...data.map.routes.daytrip,
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

if (/Metland Venya|Tegallalang|Monkey Forest|Single Fin|SUKA ULUWATU|Kuta Surf/i.test(activeRouteText)) {
  throw new Error("Unconfirmed post-wedding places must not remain in the active route data");
}

const baturDays = data.days.filter((day) => /Batur/i.test(day.title));
if (baturDays.length !== 1 || baturDays[0].date !== "24 Oct") {
  throw new Error("Batur must appear as the active day plan only on 24 Oct");
}

const requiredPostWeddingDays = [
  ["1 Nov", "Gili Trawangan"],
  ["3 Nov", "Gili Air"],
  ["4 Nov", "Gili Air"],
  ["5 Nov", "Uluwatu"]
];
for (const [date, base] of requiredPostWeddingDays) {
  if (!data.days.some((day) => day.date === date && day.base === base)) {
    throw new Error(`Post-wedding route must include ${date} on ${base}`);
  }
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

if (!Array.isArray(data.places) || data.places.length < 10) {
  throw new Error("Expected places directory with at least 10 entries");
}

for (const place of data.places) {
  if (!place.name || !place.description || !place.familyNote || !place.duration) {
    throw new Error(`Place "${place.name || "unknown"}" is missing required public description fields`);
  }

  if (place.mapsUrl && !/^https:\/\/(?:www\.)?(?:google\.com\/maps|maps\.app\.goo\.gl)/.test(place.mapsUrl)) {
    throw new Error(`Place "${place.name}" mapsUrl must open Google Maps`);
  }
}

const requiredChengduPlaces = ["Народный парк Чэнду", "Чайная Heming", "Аллеи Kuanzhai"];
for (const placeName of requiredChengduPlaces) {
  const place = data.places.find((item) => item.name === placeName);
  if (!place || place.base !== "Chengdu / Москва" || !place.mapsUrl) {
    throw new Error(`Chengdu transit place "${placeName}" must keep its public Google Maps link`);
  }
}

const chengduDay = data.days.find((day) => day.date === "8 Nov");
const chengduDetail = data.dayDetails.find((detail) => detail.date === "8 Nov");
const chengduText = JSON.stringify({ day: chengduDay, detail: chengduDetail });
if (!chengduDay || !chengduDetail || !["Народн", "Heming", "Kuanzhai"].every((term) => chengduText.includes(term))) {
  throw new Error("8 Nov must keep the compact People's Park, Heming, and Kuanzhai transit plan");
}

if (!chengduText.includes("12:00") || !chengduText.includes("13:15-13:30")) {
  throw new Error("8 Nov must keep the 12:00 hard return and 13:15-13:30 TFU target");
}

if (!data.transfers.some((transfer) => transfer.from === "Аллеи Kuanzhai" && transfer.to === "TFU Terminal 1" && transfer.window.includes("12:00"))) {
  throw new Error("Chengdu transit transfers must keep the hard return to TFU");
}

if (!Array.isArray(data.dayDetails) || data.dayDetails.length < 20) {
  throw new Error("Expected detailed day plan entries");
}

for (const detail of data.dayDetails) {
  if (!detail.date || !detail.focus || !detail.fallback || !Array.isArray(detail.timing) || detail.timing.length === 0 || !Array.isArray(detail.routes) || detail.routes.length === 0) {
    throw new Error(`Day detail "${detail.date || "unknown"}" is incomplete`);
  }

  for (const route of detail.routes) {
    if (!route.window || !route.route || !route.distance || !route.duration || !route.transport) {
      throw new Error(`Day detail "${detail.date}" has incomplete route timing`);
    }
  }
}

for (const section of ["budgetSummary", "decisions", "resources"]) {
  if (!Array.isArray(data[section]) || data[section].length === 0) {
    throw new Error(`Missing ${section}`);
  }
}

console.log("trip.json validation passed");
