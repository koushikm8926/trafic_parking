export const level_002 = {
  "id": 2,
  "gridWidth": 6,
  "gridHeight": 6,
  "exitSide": "right",
  "backgroundGrid": [
    [0, 0, 0, 0, 0, 0],
    [0, 2, 0, 0, 2, 0],
    [0, 0, 0, 0, 0, 3], // exit at row 2
    [0, 0, 2, 2, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 2]
  ],
  "vehicles": [
    {
      "id": "target",
      "x": 1, "y": 2,
      "direction": "horizontal",
      "length": 2,
      "color": "#D85A30",
      "isTarget": true
    },
    {
      "id": "v1",
      "x": 0, "y": 0,
      "direction": "vertical",
      "length": 3,
      "color": "#534AB7",
      "isTarget": false
    },
    {
      "id": "v2",
      "x": 3, "y": 0,
      "direction": "vertical",
      "length": 2,
      "color": "#0F6E56",
      "isTarget": false
    },
    {
      "id": "v3",
      "x": 4, "y": 3,
      "direction": "vertical",
      "length": 2,
      "color": "#E6A800",
      "isTarget": false
    },
    {
      "id": "v4",
      "x": 1, "y": 4,
      "direction": "horizontal",
      "length": 3,
      "color": "#8B4789",
      "isTarget": false
    }
  ],
  "minMoves": 10,
  "stars": [10, 15, 22]
};
