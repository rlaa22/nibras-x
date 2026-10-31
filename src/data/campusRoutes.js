
 // NIBRAS X - محرك المسارات الداخلي
 // لا يعتمد على أي خدمة خرائط خارجية.

export const DESTINATION = "building12";

export const campusMap = {
  nodes: [
    {
      id: "building12",
      name: "مدخل مبنى 12",
      lat: null,
      lng: null
    }
  ],

  edges: []
};

// حساب المسافة بين نقطتين بالمتر
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

// إيجاد أقرب نقطة طريق لموقع الطالبة
export function findNearestNode(lat, lng) {
  const availableNodes = campusMap.nodes.filter(
    node => Number.isFinite(node.lat) &&
            Number.isFinite(node.lng)
  );

  if (!availableNodes.length) return null;

  return availableNodes.reduce((nearest, node) => {
    const distance = getDistance(
      lat, lng, node.lat, node.lng
    );

    return !nearest || distance < nearest.distance
      ? { ...node, distance }
      : nearest;
  }, null);
}

// حساب أقصر مسار باستخدام خوارزمية Dijkstra
export function findCampusRoute(startId, destinationId) {
  const distances = {};
  const previous = {};
  const visited = new Set();

  campusMap.nodes.forEach(node => {
    distances[node.id] = Infinity;
  });

  if (!(startId in distances) ||
      !(destinationId in distances)) {
    return null;
  }

  distances[startId] = 0;

  while (true) {
    let current = null;

    for (const id of Object.keys(distances)) {
      if (!visited.has(id) &&
          (current === null ||
           distances[id] < distances[current])) {
        current = id;
      }
    }

    if (current === null ||
        distances[current] === Infinity) break;

    if (current === destinationId) break;

    visited.add(current);

    const connections = campusMap.edges.filter(
      edge => edge.from === current
    );

    for (const edge of connections) {
      const nextDistance =
        distances[current] + edge.distanceMeters;

      if (nextDistance < distances[edge.to]) {
        distances[edge.to] = nextDistance;
        previous[edge.to] = {
          id: current,
          instruction: edge.instruction
        };
      }
    }
  }

  if (distances[destinationId] === Infinity) {
    return null;
  }

  const steps = [];
  let current = destinationId;

  while (current !== startId) {
    const previousStep = previous[current];

    if (!previousStep) return null;

    steps.unshift({
      from: previousStep.id,
      to: current,
      instruction: previousStep.instruction
    });

    current = previousStep.id;
  }

  return {
    distanceMeters: distances[destinationId],
    steps
  };
}
