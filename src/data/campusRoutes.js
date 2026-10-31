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

// حساب المسافة بالمتر
export function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const rad = value => value * Math.PI / 180;

  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) *
    Math.cos(rad(lat2)) *
    Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a)
  );
}

// حساب وقت المشي بالدقائق
export function getWalkingTime(distance) {
  return Math.ceil(distance / 70);
}

// إيجاد أقصر مسار
export function findCampusRoute(startId, destinationId) {
  const distances = {};
  const previous = {};
  const unvisited = new Set(
    campusMap.nodes.map(node => node.id)
  );

  if (
    !unvisited.has(startId) ||
    !unvisited.has(destinationId)
  ) {
    return [];
  }

  campusMap.nodes.forEach(node => {
    distances[node.id] = Infinity;
  });

  distances[startId] = 0;

  while (unvisited.size) {
    let current = null;

    for (const id of unvisited) {
      if (
        current === null ||
        distances[id] < distances[current]
      ) {
        current = id;
      }
    }

    if (
      current === null ||
      distances[current] === Infinity
    ) {
      break;
    }

    if (current === destinationId) break;

    unvisited.delete(current);

    for (const edge of campusMap.edges) {
      let next = null;

      if (edge.from === current) next = edge.to;
      if (edge.to === current) next = edge.from;

      if (!next || !unvisited.has(next)) continue;

      const newDistance =
        distances[current] + edge.distance;

      if (newDistance < distances[next]) {
        distances[next] = newDistance;
        previous[next] = current;
      }
    }
  }

  if (distances[destinationId] === Infinity) {
    return [];
  }

  const path = [];
  let current = destinationId;

  while (current) {
    path.unshift(current);

    if (current === startId) break;

    current = previous[current];
  }

  return path[0] === startId ? path : [];
}
