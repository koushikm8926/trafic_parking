export const level_001 = {
  "id": 1,
  "gridWidth": 13,
  "gridHeight": 13,
  "exitSide": "right",
  "difficulty": "easy",
  "backgroundGrid": Array(13).fill(0).map((_, r) => 
    Array(13).fill(0).map((_, c) => (r === 6 && c === 12 ? 3 : 0))
  ), // 3 = exit at row 6, right edge (index 12)
  "vehicles": [
    {
      "id": "target",
      "x": 3, "y": 6,
      "direction": "horizontal",
      "length": 3,
      "color": "#D85A30",
      "isTarget": true
    },
    {
      "id": "v1",
      "x": 7, "y": 4,
      "direction": "vertical",
      "length": 4,
      "color": "#534AB7",
      "isTarget": false
    },
    {
      "id": "v2",
      "x": 9, "y": 6,
      "direction": "vertical",
      "length": 3,
      "color": "#0F6E56",
      "isTarget": false
    }
  ],
  "minMoves": 6,
  "stars": [8, 12, 18]
};
