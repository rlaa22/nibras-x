
export const DESTINATION = "building12";

// شبكة مبدئية للممرات حول مبنى 12
// الإحداثيات غير محددة حتى نتحقق منها ميدانيًا.

export const campusMap = {
  nodes: [
    {
      id: "building12",
      name: "مدخل مبنى 12",
      lat: null,
      lng: null,
      type: "destination"
    },
    {
      id: "junction1",
      name: "تقاطع شمالي",
      lat: null,
      lng: null,
      type: "junction"
    },
    {
      id: "junction2",
      name: "تقاطع شرقي",
      lat: null,
      lng: null,
      type: "junction"
    },
    {
      id: "junction3",
      name: "تقاطع جنوبي",
      lat: null,
      lng: null,
      type: "junction"
    },
    {
      id: "junction4",
      name: "تقاطع غربي",
      lat: null,
      lng: null,
      type: "junction"
    }
  ],

  edges: [
    { from: "junction1", to: "junction2", distanceMeters: 30 },
    { from: "junction2", to: "building12", distanceMeters: 20 },
    { from: "junction3", to: "junction2", distanceMeters: 35 },
    { from: "junction4", to: "junction1", distanceMeters: 40 },
    { from: "junction4", to: "junction3", distanceMeters: 45 }
  ]
};

export function findCampusRoute(startId, destinationId = DESTINATION) {
  const distances = {};
  const previous = {};
  const unvisited = new Set(campusMap.nodes.map(node => node.id));

  campusMap.nodes.forEach(node => {
    distances[node.id] = Infinity;
  });

  if (!unvisited.has(startId) || !unvisited.has(destinationId)) {
    return [];
  }

  distances[startId] = 0;

  while (unvisited.size > 0) {
    let current = null;

    for (const id of unvisited) {
      if (
        current === null ||
        distances[id] < distances[current]
      ) {
        current = id;
      }
    }

    if (current === null || distances[current] === Infinity) {
      break;
    }

    if (current === destinationId) {
      break;
    }

    unvisited.delete(current);

    for (const edge of campusMap.edges) {
      let neighbor = null;

      if (edge.from === current) neighbor = edge.to;
      if (edge.to === current) neighbor = edge.from;

      if (!neighbor || !unvisited.has(neighbor)) continue;

      const alternative =
        distances[current] + edge.distanceMeters;

      if (alternative < distances[neighbor]) {
        distances[neighbor] = alternative;
        previous[neighbor] = current;
      }
    }
  }

  if (distances[destinationId] === Infinity) {
    return [];
  }

  const route = [];
  let current = destinationId;

  while (current) {
    route.unshift(current);
    current = previous[current];
  }

  return route;
}
