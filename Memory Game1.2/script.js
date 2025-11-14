// Game state
const gameState = {
  tiles: [],
  flippedTiles: [],
  matchedPairs: 0,
  attempts: 0,
  startTime: null,
  timerInterval: null,
  elapsedTime: 0,
  totalPairs: 6,
  gameStarted: false,
  difficulty: "easy",
  previewTime: 3,
};

// Difficulty configurations
const difficultyConfig = {
  easy: { pairs: 6, previewTime: 5, grid: { cols: 4, rows: 3 } },
  medium: { pairs: 8, previewTime: 4, grid: { cols: 4, rows: 4 } },
  hard: { pairs: 12, previewTime: 3, grid: { cols: 4, rows: 6 } },
};

// Symbols for tiles (using emoji for simplicity)
const symbols = ["⭐", "🌟", "🔶", "🔷", "💠", "🔺", "🔻", "🔴", "🟢", "🔵", "🟡", "🟣"]

// DOM elements
const preloader = document.getElementById("preloader");
const startScreen = document.getElementById("start-screen");
const previewScreen = document.getElementById("preview-screen");
const gameScreen = document.getElementById("game-screen");
const endScreen = document.getElementById("end-screen");
const gameGrid = document.getElementById("game-grid");
const previewGrid = document.getElementById("preview-grid");
const timerElement = document.getElementById("timer");
const attemptsElement = document.getElementById("attempts");
const previewCountdown = document.getElementById("preview-countdown");
const currentDifficultyElement = document.getElementById("current-difficulty");
const finalTimeElement = document.getElementById("final-time");
finalAttemptsElement = document.getElementById("final-attempts");
const finalDifficultyElement = document.getElementById("final-difficulty");
const finalScoreElement = document.getElementById("final-score");
const startBtn = document.getElementById("start-btn");
const replayBtn = document.getElementById("replay-btn");
const exitBtn = document.getElementById("exit-btn");
const difficultyBtns = document.querySelectorAll(".difficulty-btn");

// Initialize game
function initGame() {
  // Hide all screens except preloader initially
  preloader.classList.remove("hidden");
  startScreen.classList.add("hidden");
  previewScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
  endScreen.classList.add("hidden");

  // Set up event listeners
  startBtn.addEventListener("click", startPreview);
  replayBtn.addEventListener("click", resetToStart);
  exitBtn.addEventListener("click", handleExit);

  // Difficulty selection
  difficultyBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      difficultyBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      gameState.difficulty = btn.dataset.difficulty;
    });
  });

  // Simulate preloader
  setTimeout(() => {
    preloader.classList.add("hidden");
    startScreen.classList.remove("hidden");
  }, 1500);
}

// Reset to start screen
function resetToStart() {
  endScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
}

// Start the preview phase
function startPreview() {
  const config = difficultyConfig[gameState.difficulty];
  gameState.totalPairs = config.pairs;
  gameState.previewTime = config.previewTime;

  // Create tiles for current difficulty
  createTiles(config.grid.cols, config.grid.rows);

  // Show preview screen
  startScreen.classList.add("hidden");
  previewScreen.classList.remove("hidden");

  // Render preview grid
  renderPreviewGrid(config.grid.cols, config.grid.rows);

  // Start preview countdown
  startPreviewCountdown();
}

// Create tile values for the game
function createTiles(cols, rows) {
  const totalTiles = cols * rows;
  const pairsNeeded = totalTiles / 2;

  // Select symbols for this game
  const gameSymbols = symbols.slice(0, pairsNeeded);

  // Create pairs
  let tileValues = [];
  gameSymbols.forEach((symbol) => {
    tileValues.push(symbol, symbol);
  });

  // Shuffle the tiles
  gameState.tiles = shuffleArray(tileValues);
}

// Render preview grid
function renderPreviewGrid(cols, rows) {
  previewGrid.innerHTML = "";
  previewGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  previewGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  gameState.tiles.forEach((symbol, index) => {
    const tile = document.createElement("div");
    tile.className = "preview-tile";
    tile.textContent = symbol;
    previewGrid.appendChild(tile);
  });
}

// Start preview countdown
function startPreviewCountdown() {
  let countdown = gameState.previewTime;
  previewCountdown.textContent = countdown;

  const countdownInterval = setInterval(() => {
    countdown--;
    previewCountdown.textContent = countdown;

    if (countdown <= 0) {
      clearInterval(countdownInterval);
      startGame();
    }
  }, 1000);
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Start the actual game
function startGame() {
  // Reset game state
  gameState.matchedPairs = 0;
  gameState.attempts = 0;
  gameState.flippedTiles = [];
  gameState.elapsedTime = 0;
  gameState.gameStarted = false;

  // Update UI
  attemptsElement.textContent = "0";
  timerElement.textContent = "0";
  currentDifficultyElement.textContent =
    gameState.difficulty.charAt(0).toUpperCase() +
    gameState.difficulty.slice(1);

  // Clear any existing timer
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
  }

  // Create the game grid
  const config = difficultyConfig[gameState.difficulty];
  renderGameGrid(config.grid.cols, config.grid.rows);

  // Show game screen
  previewScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
}

// Render the game grid with tiles
function renderGameGrid(cols, rows) {
  gameGrid.innerHTML = "";
  gameGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  gameGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  gameState.tiles.forEach((symbol, index) => {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.index = index;
    tile.dataset.symbol = symbol;
    tile.tabIndex = 0; // Make focusable for accessibility

    const front = document.createElement("div");
    front.className = "tile-face tile-front";

    const back = document.createElement("div");
    back.className = "tile-face tile-back";
    back.textContent = symbol;

    tile.appendChild(front);
    tile.appendChild(back);

    tile.addEventListener("click", () => flipTile(tile));
    tile.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        flipTile(tile);
      }
    });

    gameGrid.appendChild(tile);
  });
}

// Flip a tile
function flipTile(tile) {
  // Don't allow flipping if already flipped or matched, or if two tiles are already flipped
  if (
    tile.classList.contains("flipped") ||
    tile.classList.contains("matched") ||
    gameState.flippedTiles.length >= 2
  ) {
    return;
  }

  // Start timer on first flip
  if (!gameState.gameStarted) {
    gameState.gameStarted = true;
    gameState.startTime = Date.now();

    // Dispatch game start event
    window.dispatchEvent(new CustomEvent("bm_game_start"));

    // Start timer
    gameState.timerInterval = setInterval(() => {
      gameState.elapsedTime = Math.floor(
        (Date.now() - gameState.startTime) / 1000
      );
      timerElement.textContent = gameState.elapsedTime;
    }, 1000);
  }

  // Flip the tile
  tile.classList.add("flipped");
  gameState.flippedTiles.push(tile);

  // Check for match if two tiles are flipped
  if (gameState.flippedTiles.length === 2) {
    gameState.attempts++;
    attemptsElement.textContent = gameState.attempts;

    const tile1 = gameState.flippedTiles[0];
    const tile2 = gameState.flippedTiles[1];

    if (tile1.dataset.symbol === tile2.dataset.symbol) {
      // Match found
      setTimeout(() => {
        tile1.classList.add("matched");
        tile2.classList.add("matched");
        gameState.flippedTiles = [];
        gameState.matchedPairs++;

        // Dispatch pair match event
        window.dispatchEvent(
          new CustomEvent("bm_pair_match", {
            detail: {
              pairsFound: gameState.matchedPairs,
              attempts: gameState.attempts,
            },
          })
        );

        // Check for game completion
        if (gameState.matchedPairs === gameState.totalPairs) {
          endGame();
        }
      }, 500);
    } else {
      // No match - flip back
      setTimeout(() => {
        tile1.classList.remove("flipped");
        tile2.classList.remove("flipped");
        gameState.flippedTiles = [];
      }, 1000);
    }
  }
}

// End the game
function endGame() {
  // Stop timer
  clearInterval(gameState.timerInterval);

  // Calculate score based on difficulty, time, and attempts
  const difficultyMultiplier = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  const baseScore = 1000;
  const timePenalty = gameState.elapsedTime * 10;
  const attemptPenalty = gameState.attempts * 5;
  const score =
    Math.max(0, baseScore - timePenalty - attemptPenalty) *
    difficultyMultiplier[gameState.difficulty];

  // Update final stats
  finalTimeElement.textContent = gameState.elapsedTime;
  finalAttemptsElement.textContent = gameState.attempts;
  finalDifficultyElement.textContent =
    gameState.difficulty.charAt(0).toUpperCase() +
    gameState.difficulty.slice(1);
  finalScoreElement.textContent = score;


  gameScreen.classList.add("hidden");
  endScreen.classList.remove("hidden");

  // Dispatch game complete event
  window.dispatchEvent(
    new CustomEvent("bm_game_complete", {
      detail: {
        attempts: gameState.attempts,
        timeMs: gameState.elapsedTime * 1000,
        difficulty: gameState.difficulty,
        score: score,
      },
    })
  );
}


function handleExit() {

  window.dispatchEvent(new CustomEvent("bm_exit_click"));
  alert(
    "Exit event triggered - in production this would navigate to the clickthrough URL"
  );
}

// Initialize the game when DOM is loaded
document.addEventListener("DOMContentLoaded", initGame);
