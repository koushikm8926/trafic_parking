export const level_001 = {
  "id": 1,
  "gridWidth": 12,
  "gridHeight": 12,
  "exitSide": "right",
  "difficulty": "easy",
  "backgroundGrid": Array(12).fill(0).map((_, r) => 
    Array(12).fill(0).map((_, c) => (r === 6 && c === 11 ? 3 : 0))
  ), // 3 = exit at row 6, right edge
  "vehicles": [
    {
      "id": "target",
      "x": 2, "y": 6,
      "direction": "horizontal",
      "length": 3,
      "color": "#D85A30",
      "isTarget": true
    },
    {
      "id": "v1",
      "x": 6, "y": 4,
      "direction": "vertical",
      "length": 4,
      "color": "#534AB7",
      "isTarget": false
    },
    {
      "id": "v2",
      "x": 8, "y": 6,
      "direction": "vertical",
      "length": 3,
      "color": "#0F6E56",
      "isTarget": false
    }
  ],
  "minMoves": 6,
  "stars": [8, 12, 18]
};
