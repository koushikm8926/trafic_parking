export const level_009 = {
  "id": 9,
  "gridWidth": 6,
  "gridHeight": 6,
  "exitSide": "right",
  "difficulty": "hard",
  "backgroundGrid": [
    [0, 0, 0, 0, 0, 0],
    [0, 2, 0, 2, 0, 0],
    [0, 0, 0, 0, 0, 3], // exit at row 2
    [0, 0, 2, 0, 2, 0],
    [0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0]
  ],
  "vehicles": [
    {
      "id": "target",
      "x": 0, "y": 2,
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
      "length": 2,
      "color": "#0F6E56",
      "isTarget": false
    },
    {
      "id": "v3",
      "x": 3, "y": 3,
      "direction": "vertical",
      "length": 3,
      "color": "#E6A800",
      "isTarget": false
    },
    {
      "id": "v4",
      "x": 4, "y": 0,
      "direction": "vertical",
      "length": 2,
      "color": "#8B4789",
      "isTarget": false
    },
    {
      "id": "v5",
      "x": 5, "y": 0,
      "direction": "vertical",
      "length": 3,
      "color": "#C74B50",
      "isTarget": false
    },
    {
      "id": "v6",
      "x": 4, "y": 3,
      "direction": "horizontal",
      "length": 2,
      "color": "#2B7A78",
      "isTarget": false
    },
    {
      "id": "v7",
      "x": 1, "y": 4,
      "direction": "horizontal",
      "length": 3,
      "color": "#D4A5A5",
      "isTarget": false
    },
    {
      "id": "v8",
      "x": 1, "y": 5,
      "direction": "horizontal",
      "length": 2,
      "color": "#6A994E",
      "isTarget": false
    }
  ],
  "minMoves": 28,
  "stars": [28, 38, 50]
};
