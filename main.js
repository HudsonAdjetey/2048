const gridDisplay = document.querySelector(".grid");
const scoreDisplay = document.querySelector("#score");
const bestScoreDisplay = document.querySelector("#score_high");
const resultDisplay = document.getElementById("result");
const restartButton = document.getElementById("restart-button");
const undoButton = document.getElementById("undo-button");
const width = 4;
let squares = [];
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
let previousState = null;

bestScoreDisplay.innerText = bestScore;

/**
 * @function createBoard()
 * @description create a new board with cells and returns a function called generateTile
 * @returns @function generateTile()
 */
function createBoard() {
  for (let i = 0; i < width * width; i++) {
    const square = document.createElement("div");
    square.classList.add("square");
    square.innerText = "";
    squares.push(square);
    gridDisplay.appendChild(square);
  }
  generateTile();
  generateTile();
}

/**
 * @function generateTile()
 * @prop @function applyTileColors()
 * @example Generate a random tile (2 or 4)
 */
function generateTile() {
  const emptySquares = squares.filter((sq) => !sq.innerText);
  if (emptySquares.length > 0) {
    const randomSquare =
      emptySquares[Math.floor(Math.random() * emptySquares.length)];
    randomSquare.innerText = Math.random() > 0.1 ? "2" : "4";
    applyTileColors();
  }
}

/**
 * @function move(direction)
 * @description move tiles in the given direction and check for any merges
 * @param @string direction - "up", "down", "left", "right"
 */
function move(direction) {
  saveState();
  for (let i = 0; i < width; i++) {
    let rowOrCol = [];
    for (let j = 0; j < width; j++) {
      const index =
        direction === "left" || direction === "right"
          ? i * width + j
          : j * width + i;
      rowOrCol.push(parseInt(squares[index].innerText) || 0);
    }
    if (direction === "right" || direction === "down") rowOrCol.reverse();
    rowOrCol = combineTiles(rowOrCol);
    if (direction === "right" || direction === "down") rowOrCol.reverse();
    for (let j = 0; j < width; j++) {
      const index =
        direction === "left" || direction === "right"
          ? i * width + j
          : j * width + i;
      squares[index].innerText = rowOrCol[j] || "";
    }
  }
  generateTile();
  checkGameOver();
  checkWin();
  applyTileColors();
}

/**
 * @function combineTiles(rowOrCol)
 * @description merge tiles in the row or column and return the updated row or column
 * @param @array rowOrCol - array of tile values
 * @returns @array updatedRowOrCol - array of merged tile values

*/

function combineTiles(rowOrCol) {
  rowOrCol = rowOrCol.filter((val) => val);
  for (let i = 0; i < rowOrCol.length - 1; i++) {
    if (rowOrCol[i] === rowOrCol[i + 1]) {
      rowOrCol[i] *= 2;
      score += rowOrCol[i];
      rowOrCol[i + 1] = 0;
      scoreDisplay.innerText = score;
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
        bestScoreDisplay.innerText = bestScore;
      }
    }
  }
  return rowOrCol
    .filter((val) => val)
    .concat(new Array(width - rowOrCol.length).fill(0));
}

// Save the board state for undo
function saveState() {
  previousState = {
    squares: squares.map((sq) => sq.innerText),
    score: score,
  };
}

// Undo the last move
function undoMove() {
  if (!previousState) return;
  squares.forEach((sq, i) => (sq.innerText = previousState.squares[i]));
  score = previousState.score;
  scoreDisplay.innerText = score;
  previousState = null;
  applyTileColors();
}

// Check if the game is over
function checkGameOver() {
  if (squares.some((sq) => !sq.innerText)) return;
  for (let i = 0; i < squares.length; i++) {
    if (
      i % width < width - 1 &&
      squares[i].innerText === squares[i + 1].innerText
    )
      return;
    if (
      i < width * (width - 1) &&
      squares[i].innerText === squares[i + width].innerText
    )
      return;
  }
  resultDisplay.innerText = "Game Over!";
}

// Check if the player has won
function checkWin() {
  if (squares.some((sq) => sq.innerText == 2048)) {
    resultDisplay.innerText = "You Win!";
  }
}

/**
 * @function applyTileColors()
 * @description generate random colors
 */
function applyTileColors() {
  const colorMap = {
    "": "#cdc1b4",
    2: "#eee4da",
    4: "#ede0c8",
    8: "#f2b179",
    16: "#f59563",
    32: "#f67c5f",
    64: "#f65e3b",
    128: "#edcf72",
    256: "#edcc61",
    512: "#edc850",
    1024: "#edc53f",
    2048: "#edc22e",
  };
  squares.forEach((sq) => {
    const value = parseInt(sq.innerText) || "";
    sq.style.backgroundColor = colorMap[value] || colorMap[""];
    sq.style.color = value > 4 ? "white" : "black";
  });
}

// Key press controls
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") move("left");
  if (e.key === "ArrowRight") move("right");
  if (e.key === "ArrowUp") move("up");
  if (e.key === "ArrowDown") move("down");
});
restartButton.addEventListener("click", () => {
  squares.forEach((sq) => (sq.innerText = ""));
  score = 0;
  scoreDisplay.innerText = score;
  resultDisplay.innerText = "";
  generateTile();
  generateTile();
});
undoButton.addEventListener("click", undoMove);

// Initialize game
createBoard();
