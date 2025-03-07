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
    document.body.classList.add(gameMode); // ajoute la classe correspondant au mode de jeu 
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
    gameContainer.innerHTML = ""; //efface le contenu du conteneur du jeu
    const grid = gameMode === 'morpion' ? gridTic : gridPfour; //choix grille appropriée selon le choix de jeu
    grid.forEach((row, rowIndex) => { //chaque ligne dans la grille, on parcout avec l'index de la ligne
        const rowContainer = document.createElement("div");
        rowContainer.classList.add("row"); //ajoute la classe row pour modif la ligne après en css
        gameContainer.appendChild(rowContainer); //ajoute la ligne au parent (gameContainer)

        row.forEach((cell, colIndex) => { //pour chaque celulle de la ligne on parcourt l'index de la colonne
            const cellContainer = document.createElement("div");
            cellContainer.classList.add("cell");
            rowContainer.appendChild(cellContainer); //ajoute la cellule à la ligne
            cellContainer.textContent = cell;
            cellContainer.addEventListener("click", () => play(rowIndex, colIndex));
        });
    });
}
// clic sur une cellule :
function play(row, col) {
    if (gameOver) return; // jeu terminé? rien se passe!
    // cellule déjà occupée ?
    if (gameMode === 'morpion' && gridTic[row][col] !== "" || gameMode === 'puissance4' && gridPfour[row][col] !== "") return;
    // jeton dans la case : 
    if (gameMode === 'morpion') { // en mode ternaire : const grid = gameMode === 'morpion' ? gridTic : gridPFour // après placer le jeton // et mettre à joue l'affichage 
        gridTic[row][col] = currentPlayer; //place le jeton en mode morpion
    } else {
        gridPfour[row][col] = currentPlayer; //place le jeton en mode puissance4
    }
    gameContainer.children[row].children[col].textContent = currentPlayer; //affiche le texte sur la case qu'on a cliqué

    // victoire ou le match nul ?
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
    // changement de joueur :
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    // ordi joue :
    if (gameType === "computer" && currentPlayer === "O" && !gameOver) {
        setTimeout(computerMove, 100); // pour avoir le temps de voir les actions se dérouler => ça évite aussi des bugs ! 
    } // sinon, tout simplement : computerMove()
}
// mouvement de l'ordinateur : 
function computerMove() {
    let emptyCells = []; //stocke les cellules vides
    const grid = gameMode === 'morpion' ? gridTic : gridPfour;
    const rows = gameMode === 'morpion' ? 3 : 6; //ternanire indiquant le nb de lignes de chaque mode de jeu
    const cols = gameMode === 'morpion' ? 3 : 7; //ternaire indiquant le nb de colonnes de chaque mode de jeu
    // trouver les cellules vides => il faut parcourir la grille et ajouter les coordonnées des cellules vides à emptyCells
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] === "") emptyCells.push({ row: i, col: j }); //push : ajoute un élément à la fin du tableau; ajoute la position de la cellule vide
        } //{ row: i, col: j } : object avec deux propriétés : row prend la valeu i qui est l'idex de la ligne et col prend la valeur j qui est l'index de la colonne 
    }
    // choix cellule vide au hasard :
    if (emptyCells.length > 0) {
        const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[row][col] = "O"; //place jeton O dans cellule vide
        gameContainer.children[row].children[col].textContent = "O" //maj l'affichage
        // victoire ou match nul après mouvement ordinateur :
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
        currentPlayer = "X"; //ordi a fini son tour => c'est à X de jouer
    }
}
// victoire pour Morpion :
function checkWinMorpion() {
    for (let i = 0; i < 3; i++) {
        if (gridTic[i][0] && gridTic[i][0] === gridTic[i][1] && gridTic[i][1] === gridTic[i][2]) return true; // vérifier les lignes
        if (gridTic[0][i] && gridTic[0][i] === gridTic[1][i] && gridTic[1][i] === gridTic[2][i]) return true; // vérifier les colonnes
    }
    if (gridTic[0][0] && gridTic[0][0] === gridTic[1][1] && gridTic[1][1] === gridTic[2][2]) return true; // vérifier la diagonale
    if (gridTic[0][2] && gridTic[0][2] === gridTic[1][1] && gridTic[1][1] === gridTic[2][0]) return true; // // vérifier l'autre diagonale
    return false; // aucune condition de victoire remplie ? retourne false
}
// victoire pour Puissance 4 :
function checkWinP4() {
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            if (gridPfour[row][col]) {  // jeton est présent à la position (row, col)?
                const player = gridPfour[row][col];  // Enregistre le joueur (X ou O)
                // Vérifie horizontalement
                if (col + 3 < 7 && gridPfour[row][col] === gridPfour[row][col + 1] && gridPfour[row][col + 1] === gridPfour[row][col + 2] && gridPfour[row][col + 2] === gridPfour[row][col + 3]) {
                    return true;
                }
                // Vérifie verticalement
                if (row + 3 < 6 && gridPfour[row][col] === gridPfour[row + 1][col] && gridPfour[row + 1][col] === gridPfour[row + 2][col] && gridPfour[row + 2][col] === gridPfour[row + 3][col]) {
                    return true;
                }
                // Vérifie diagonalement (haut-gauche à bas-droit)
                if (row + 3 < 6 && col + 3 < 7 && gridPfour[row][col] === gridPfour[row + 1][col + 1] && gridPfour[row + 1][col + 1] === gridPfour[row + 2][col + 2] && gridPfour[row + 2][col + 2] === gridPfour[row + 3][col + 3]) {
                    return true;
                }
                // Vérifie diagonalement (bas-gauche à haut-droit)
                if (row - 3 >= 0 && col + 3 < 7 && gridPfour[row][col] === gridPfour[row - 1][col + 1] && gridPfour[row - 1][col + 1] === gridPfour[row - 2][col + 2] && gridPfour[row - 2][col + 2] === gridPfour[row - 3][col + 3]) {
                    return true;
                }
            }
        }
    }
    return false;
}
// match nul ?
function checkDraw(mode) {
    const grid = mode === 'morpion' ? gridTic : gridPfour; //voir la bonne grille selon le jeu choisi
    for (let i = 0; i < grid.length; i++) { // encore des cellules vides ?
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === "") {
                return false; //cellule vide => match n'est pas encore nul
            }
        }
    }
    return true; // toutes cellules remplies ? match nul 
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

    const resetBtn = document.querySelector("#resetButton")
    resetBtn.style.display = "none"
}
// montrer le boutton de redémmarage en fin de jeu : 
function showRestartBtn() {
    const resetBtn = document.querySelector("#resetButton");
    resetBtn.style.display = "block"
}
// ajouter un événement au boutton reset : 
document.querySelector("#resetButton").addEventListener("click", resetGame)
// déclarer fin de jeu : 
function endGame() {
    showRestartBtn()
    gameOver = true
}
// changer mode de jeu :
switchGameModeButton.addEventListener("click", () => {
    gameMode = gameMode === 'morpion' ? 'puissance4' : 'morpion';
    setGameMode();
});
// changer type de jeu :
switchGameTypeButton.addEventListener('click', () => {
    gameType = gameType === 'player' ? 'computer' : 'player';
    setGameType();
});
setGameMode();
setGameType();