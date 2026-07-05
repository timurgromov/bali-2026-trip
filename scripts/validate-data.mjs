import fs from "node:fs";

const data = JSON.parse(fs.readFileSync(new URL("../src/data/trip.json", import.meta.url), "utf8"));
const serialized = JSON.stringify(data);

const forbidden = [
  ["timur", "gromov", ".ru"].join(""),
  "PNR",
  "passport",
  "паспорт",
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

if (points.length !== 20) {
  throw new Error(`Expected 20 map points, got ${points.length}`);
}

if (uniqueOrders.size !== points.length) {
  throw new Error("Map point orders must be unique");
}

for (let order = 1; order <= 20; order += 1) {
  if (!uniqueOrders.has(order)) {
    throw new Error(`Missing map point order ${order}`);
  }
}

for (const point of points) {
  if (!point.title || !point.description || !point.lat || !point.lng) {
    throw new Error(`Point ${point.order} is missing title, description, lat, or lng`);
  }
}

console.log("trip.json validation passed");
