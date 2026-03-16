export const level_015 = {
  "id": 15,
  "gridWidth": 6,
  "gridHeight": 6,
  "exitSide": "right",
  "difficulty": "expert",
  "backgroundGrid": [
    [0, 2, 0, 0, 2, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 3], // exit at row 2
    [2, 0, 0, 2, 0, 0],
    [0, 0, 0, 0, 0, 2],
    [0, 0, 2, 0, 0, 0]
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
      "length": 2,
      "color": "#534AB7",
      "isTarget": false
    },
    {
      "id": "v2",
      "x": 2, "y": 0,
      "direction": "vertical",
      "length": 3,
      "color": "#0F6E56",
      "isTarget": false
    },
    {
      "id": "v3",
      "x": 3, "y": 0,
      "direction": "vertical",
      "length": 2,
      "color": "#E6A800",
      "isTarget": false
    },
    {
      "id": "v4",
      "x": 5, "y": 0,
      "direction": "vertical",
      "length": 2,
      "color": "#8B4789",
      "isTarget": false
    },
    {
      "id": "v5",
      "x": 3, "y": 1,
      "direction": "horizontal",
      "length": 2,
      "color": "#C74B50",
      "isTarget": false
    },
    {
      "id": "v6",
      "x": 1, "y": 3,
      "direction": "vertical",
      "length": 2,
      "color": "#2B7A78",
      "isTarget": false
    },
    {
      "id": "v7",
      "x": 4, "y": 3,
      "direction": "vertical",
      "length": 2,
      "color": "#D4A574",
      "isTarget": false
    },
    {
      "id": "v8",
      "x": 0, "y": 5,
      "direction": "horizontal",
      "length": 2,
      "color": "#9B59B6",
      "isTarget": false
    },
    {
      "id": "v9",
      "x": 3, "y": 5,
      "direction": "horizontal",
      "length": 2,
      "color": "#E74C3C",
      "isTarget": false
    }
  ],
  "minMoves": 30,
  "stars": {
    "three": 30,
    "two": 40,
    "one": 50
  }
};
