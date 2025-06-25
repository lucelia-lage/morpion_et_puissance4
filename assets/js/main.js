let gameMode = 'morpion';  // jeu initialisé par défaut en mode morpion
let currentPlayer = "X";  // joueur "X" commence
let gameOver = false;
let gameType = 'player';
let gridTic = [["", "", ""], ["", "", ""], ["", "", ""]];
let gridPfour = [["", "", "", "", "", "", ""], ["", "", "", "", "", "", ""], ["", "", "", "", "", "", ""], ["", "", "", "", "", "", ""], ["", "", "", "", "", "", ""], ["", "", "", "", "", "", ""]];

const gameContainer = document.querySelector("#gameContainer");
const resultDisplay = document.querySelector("#result");
const resetButton = document.querySelector("#resetButton");
const switchGameModeButton = document.querySelector("#switchGameMode");
const switchGameTypeButton = document.querySelector("#switchGameType");
const rulesMorpion = document.querySelector("#rulesMorpion");
const rulesP4 = document.querySelector("#rulesP4");
const titleMorpion = document.querySelector("#titleMorpion");
const titleP4 = document.querySelector("#titleP4")

// mode de jeu : 
function setGameMode() {
    document.body.classList.remove('morpion', 'puissance4'); // retire les deux classes avant
    document.body.classList.add(gameMode);
    createMap();
    switchGameModeButton.textContent = gameMode === 'morpion' ? 'Jouer à Puissance 4' : 'Jouer à Morpion Simple';
    if (gameMode === 'morpion') {
        rulesMorpion.style.display = "block";
        rulesP4.style.display = "none";
        titleMorpion.style.display = "block";
        titleP4.style.display = "none"
    } else if (gameMode === 'puissance4') {
        rulesP4.style.display = "block";
        rulesMorpion.style.display = "none";
        titleP4.style.display = "block";
        titleMorpion.style.display = "none";
    } else {
        rulesMorpion.style.display = "none";
        rulesP4.style.display = "none";
        titleMorpion.style.display = "none";
        titleP4.style.display = "none";
    }
}

// type de jeu :
function setGameType() {
    switchGameTypeButton.textContent = gameType === "player" ? "Jouer contre l'ordinateur" : "Jouer à deux";
}

// création grille :
function createMap() {
    gameContainer.innerHTML = "";
    const grid = gameMode === 'morpion' ? gridTic : gridPfour;

    if (gameMode === 'puissance4') {
        // Pour Puissance 4 : créer colonne par colonne (de gauche à droite)
        // Chaque colonne contient 6 cellules (de haut en bas)
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row < 6; row++) {
                const cellContainer = document.createElement("div");
                cellContainer.classList.add("cell");
                cellContainer.textContent = grid[row][col];
                cellContainer.addEventListener("click", () => {
                    if (gameOver) return;
                    play(null, col); // on clique sur une colonne
                });
                gameContainer.appendChild(cellContainer);
            }
        }
    } else {
        // Pour Morpion : grille normale ligne par ligne
        grid.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellContainer = document.createElement("div");
                cellContainer.classList.add("cell");
                cellContainer.textContent = cell;
                cellContainer.addEventListener("click", () => {
                    if (gameOver) return;
                    play(rowIndex, colIndex);
                });
                gameContainer.appendChild(cellContainer);
            });
        });
    }
}

// clic sur une cellule :
function play(row, col) {
    if (gameOver) return;

    if (gameMode === 'morpion') {
        if (gridTic[row][col] !== "") return;
        gridTic[row][col] = currentPlayer;
        // Pour le morpion, calculer l'index : ligne * 3 + colonne
        const cellIndex = row * 3 + col;
        gameContainer.children[cellIndex].textContent = currentPlayer;

    } else if (gameMode === 'puissance4') {
        // Ne pas autoriser à jouer si la colonne est pleine
        if (gridPfour[0][col] !== "") return;

        // Trouver la première case vide depuis le bas (ligne 5 vers ligne 0)
        let targetRow = -1;
        for (let i = 5; i >= 0; i--) {
            if (gridPfour[i][col] === "") {
                targetRow = i;
                break;
            }
        }

        if (targetRow === -1) return; // colonne pleine par sécurité

        // Placer le pion dans la grille logique
        gridPfour[targetRow][col] = currentPlayer;
        
        // Mettre à jour l'affichage
        // Dans une grille CSS en grid-auto-flow: column, l'index se calcule ainsi :
        // index = colonne * nombre_de_lignes + ligne
        const cellIndex = col * 6 + targetRow;
        const cell = gameContainer.children[cellIndex];
        cell.textContent = currentPlayer;
        cell.classList.add("fall");

        // Vérification de victoire après avoir placé le pion
        row = targetRow;
    }

    if ((gameMode === 'morpion' && checkWinMorpion()) || (gameMode === 'puissance4' && checkWinP4())) {
        resultDisplay.textContent = `${currentPlayer} a gagné !`;
        gameOver = true;
        showRestartBtn();
        return;
    }

    if (checkDraw(gameMode)) {
        resultDisplay.textContent = "Oupsss, match nul";
        gameOver = true;
        showRestartBtn();
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";

    if (gameType === "computer" && currentPlayer === "O" && !gameOver) {
        setTimeout(computerMove, 200);
    }
}

// mouvement de l'ordinateur : 
function computerMove() {
    let emptyCells = [];
    const grid = gameMode === 'morpion' ? gridTic : gridPfour;
    const rows = gameMode === 'morpion' ? 3 : 6;
    const cols = gameMode === 'morpion' ? 3 : 7;

    if (gameMode === 'morpion') {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (grid[i][j] === "") emptyCells.push({ row: i, col: j });
            }
        }
        if (emptyCells.length > 0) {
            const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            grid[row][col] = "O";
            // Pour le morpion, on utilise l'index simple : ligne * 3 + colonne
            const cellIndex = row * 3 + col;
            gameContainer.children[cellIndex].textContent = "O";
        }

    } else {
        // Pour Puissance 4 : trouver les colonnes jouables
        for (let j = 0; j < cols; j++) {
            for (let i = 5; i >= 0; i--) {
                if (grid[i][j] === "") {
                    emptyCells.push({ row: i, col: j });
                    break; // Une seule case par colonne (la plus basse disponible)
                }
            }
        }
        if (emptyCells.length > 0) {
            const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            grid[row][col] = "O";
            // Calculer l'index de la cellule dans la grille CSS
            const cellIndex = col * 6 + row;
            const cell = gameContainer.children[cellIndex];
            cell.textContent = "O";
            cell.classList.add("fall");
        }
    }

    if ((gameMode === 'morpion' && checkWinMorpion()) || (gameMode === 'puissance4' && checkWinP4())) {
        resultDisplay.textContent = "L'ordinateur a gagné !";
        gameOver = true;
        showRestartBtn();
        return;
    }

    if (checkDraw(gameMode)) {
        resultDisplay.textContent = "Match nul !";
        gameOver = true;
        showRestartBtn();
        return;
    }

    currentPlayer = "X";
}

// victoire pour Morpion :
function checkWinMorpion() {
    for (let i = 0; i < 3; i++) {
        if (gridTic[i][0] && gridTic[i][0] === gridTic[i][1] && gridTic[i][1] === gridTic[i][2]) return true;
        if (gridTic[0][i] && gridTic[0][i] === gridTic[1][i] && gridTic[1][i] === gridTic[2][i]) return true;
    }
    if (gridTic[0][0] && gridTic[0][0] === gridTic[1][1] && gridTic[1][1] === gridTic[2][2]) return true;
    if (gridTic[0][2] && gridTic[0][2] === gridTic[1][1] && gridTic[1][1] === gridTic[2][0]) return true;
    return false;
}

// victoire pour Puissance 4 :
function checkWinP4() {
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            if (gridPfour[row][col]) {
                const player = gridPfour[row][col];
                // Vérification horizontale
                if (col + 3 < 7 && player === gridPfour[row][col + 1] && player === gridPfour[row][col + 2] && player === gridPfour[row][col + 3]) return true;
                // Vérification verticale
                if (row + 3 < 6 && player === gridPfour[row + 1][col] && player === gridPfour[row + 2][col] && player === gridPfour[row + 3][col]) return true;
                // Vérification diagonale descendante
                if (row + 3 < 6 && col + 3 < 7 && player === gridPfour[row + 1][col + 1] && player === gridPfour[row + 2][col + 2] && player === gridPfour[row + 3][col + 3]) return true;
                // Vérification diagonale montante
                if (row - 3 >= 0 && col + 3 < 7 && player === gridPfour[row - 1][col + 1] && player === gridPfour[row - 2][col + 2] && player === gridPfour[row - 3][col + 3]) return true;
            }
        }
    }
    return false;
}

// match nul ?
function checkDraw(mode) {
    const grid = mode === 'morpion' ? gridTic : gridPfour;
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === "") {
                return false;
            }
        }
    }
    return true;
}

// réinitialiser :
function resetGame() {
    gameOver = false;
    currentPlayer = "X";
    resultDisplay.textContent = "";
    gridTic = [["", "", ""], ["", "", ""], ["", "", ""]];
    gridPfour = [["", "", "", "", "", "", ""], ["", "", "", "", "", "", ""], ["", "", "", "", "", "", ""], ["", "", "", "", "", "", ""], ["", "", "", "", "", "", ""], ["", "", "", "", "", "", ""]];
    gameContainer.innerHTML = "";
    createMap()
    resetButton.style.display = "none"
}

// montrer le boutton de redémmarage en fin de jeu : 
function showRestartBtn() {
    resetButton.style.display = "block"
}

document.querySelector("#resetButton").addEventListener("click", resetGame)

function endGame() {
    showRestartBtn()
    gameOver = true
}

switchGameModeButton.addEventListener("click", () => {
    gameMode = gameMode === 'morpion' ? 'puissance4' : 'morpion';
    resetGame(); 
    setGameMode();
});

switchGameTypeButton.addEventListener('click', () => {
    gameType = gameType === 'player' ? 'computer' : 'player';
    setGameType();
});

setGameMode();
setGameType();