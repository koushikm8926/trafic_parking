export const level_001 = {
  "id": 1,
  "gridWidth": 6,
  "gridHeight": 6,
  "exitSide": "right",
  "backgroundGrid": [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 3], // 3 = exit, row 2 right edge
    [0, 0, 0, 0, 2, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 2, 0, 0, 0, 0]
  ],
  "vehicles": [
    {
      "id": "target",
      "x": 0, "y": 2, // left side of row 2
      "direction": "horizontal",
      "length": 2,
      "color": "#D85A30", // always red for target
      "isTarget": true
    },
    {
      "id": "v1",
      "x": 2, "y": 0,
      "direction": "vertical",
      "length": 3,
      "color": "#534AB7",
      "isTarget": false
    },
    {
      "id": "v2",
      "x": 4, "y": 1,
      "direction": "vertical",
      "length": 2,
      "color": "#0F6E56",
      "isTarget": false
    }
  ],
  "minMoves": 6,
  "stars": [8, 12, 18]
};
