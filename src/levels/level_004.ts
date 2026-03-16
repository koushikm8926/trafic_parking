export const level_004 = {
  "id": 4,
  "gridWidth": 6,
  "gridHeight": 6,
  "exitSide": "right",
  "backgroundGrid": [
    [0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 3], // exit at row 2
    [0, 0, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 0, 0]
  ],
  "vehicles": [
    {
      "id": "target",
      "x": 2, "y": 2,
      "direction": "horizontal",
      "length": 2,
      "color": "#D85A30",
      "isTarget": true
    },
    {
      "id": "v1",
      "x": 1, "y": 0,
      "direction": "vertical",
      "length": 3,
      "color": "#534AB7",
      "isTarget": false
    },
    {
      "id": "v2",
      "x": 2, "y": 0,
      "direction": "vertical",
      "length": 2,
      "color": "#0F6E56",
      "isTarget": false
    },
    {
      "id": "v3",
      "x": 4, "y": 1,
      "direction": "vertical",
      "length": 2,
      "color": "#E6A800",
      "isTarget": false
    },
    {
      "id": "v4",
      "x": 5, "y": 3,
      "direction": "vertical",
      "length": 2,
      "color": "#8B4789",
      "isTarget": false
    },
    {
      "id": "v5",
      "x": 0, "y": 3,
      "direction": "horizontal",
      "length": 2,
      "color": "#C74B50",
      "isTarget": false
    },
    {
      "id": "v6",
      "x": 3, "y": 4,
      "direction": "horizontal",
      "length": 2,
      "color": "#2B7A78",
      "isTarget": false
    }
  ],
  "minMoves": 16,
  "stars": [16, 22, 30]
};
