export const DESTINATION = "building12";

export const campusMap = {
  nodes: [
    {
      id: "building12",
      name: "مدخل مبنى 12",
      lat: 21.431360,
      lng: 40.477151
    }
  ],
  edges: []
};

// حساب المسافة بين نقطتين بالمتر
export function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (value) => value * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// حساب الوقت التقريبي للمشي
export function getWalkingTime(distance) {
  return Math.ceil(distance / 70);
}
