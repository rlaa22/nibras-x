
// شبكة مسارات جامعة الطائف - NIBRAS X
// الإحداثيات تُضاف بعد معايرتها ميدانيًا.

export const DESTINATION = "building12";

export const campusRoutes = {
  nodes: {
    building10: {
      id: "building10",
      name: "مبنى 10",
      lat: null,
      lng: null
    },

    building12: {
      id: "building12",
      name: "مدخل مبنى 12",
      lat: null,
      lng: null
    }
  },

  paths: [
    {
      from: "building10",
      to: "building12",
      instruction: "اتجهي إلى مدخل مبنى 12"
    }
  ]
};
