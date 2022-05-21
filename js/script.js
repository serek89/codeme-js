class Tournament {
    constructor(name) {
        this.name = name,
        this.players = [],
        this.rounds = [],
        this.maxRound = 0,
        this.isStarted = false
    }

    addPlayer = (name) => {
        this.players.push(new Player(this.players.length+1, name));
    }

    start = () => {
        this.isStarted = true;
        this.setMaxRound();
    }

    setMaxRound = () => {
        this.maxRound = Math.ceil(Math.log2(this.players.length));
    }

    startNewRound = () => {
        if(this.rounds.length > 0) {
            this.players.sort(Player.sortByPoints);
        } else {
            //https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
            let tmp = this.players.length, random;
            while (tmp !== 0) {
                random = Math.floor(Math.random() * tmp)
                tmp--;
                [this.players[tmp], this.players[random]] = [this.players[random], this.players[tmp]] 
            }
        }
    
        let round = new Round(this.rounds.length+1);
        round.prepareParings(this.players);
        this.rounds.push(round);
    }

    sortPlayersByPoints = (playerOne, playerTwo) => {
        return playerTwo.points - playerOne.points;
    }
}

class Player {
    constructor(id, name) {
        this.id = id,
        this.name = name,
        this.wins = 0
    }

    addWin = () => {
        this.wins += 1;
    }

    /**
     * Sortuje w koelejności:
     * po bigPoints - malejąco 
     * po smallPoints - malejąco
     * po lostPoints - rosnąco
     */
    static sortByPoints = (a, b) => {
        if (a.wins != b.wins) {
            return b.bigPoints - a.bigPoints;
        }
        return a.name - b.name;
    }
}

const playerBYE = new Player(0, "BYE");

class Round {
    constructor(number) {
        this.number = number,
        this.parings = []
    }

    isFinish () {
        console.log("a");
    }

    /**
     * Do poprawy: 
     * Musi sprawdzać czy gracze nie grali ze sobą w poprzednich rundach!
     */
    prepareParings = (players) => {
        let tmpPlayers = [...players];
        while (tmpPlayers.length !== 0) {
            const playerOne = tmpPlayers.shift();
            const playerTwo = tmpPlayers.shift();
            if (playerTwo != undefined) {
                this.parings.push(new Paring(playerOne, playerTwo));
            } else {
                let paring = new Paring(playerOne, playerBYE);
                paring.playerOnePoints = 2;
                paring.locked = true;
                paring.playerOne.addPoints(1, paring.playerOnePoints, paring.playerTwoPoints);
                playerBYE.lostPoints += 2;
                this.parings.push(paring);
            }
        }
    }
}

class Paring {
    constructor (playerOne, playerTwo) {
        this.playerOne = playerOne,
        this.playerTwo = playerTwo,
        this.playerOneWin = false,
        this.playerTwoWin = false,
        this.locked = false
    }
}

const app = document.querySelector("app");
let tournament = getTournament();


/**
 * Odczytywanie zapisanego turnieju
 * @returns ?Tournament
 */
function getTournament() {
    let check = localStorage.getItem("tournament");
    if (check === null) {
        return null;
    } else {
        let result = new Tournament();
        Object.assign(result, JSON.parse(check));
        return result;
    }
}

/**
 * Tworzenie nowego turnieju i zapisanie go w LocalStorage
 */
function createTournament() {
    const panelDiv = document.createElement("div");
    panelDiv.classList.add('panel');
    
    const nameTournament = document.createElement("input");
    nameTournament.setAttribute("id", "nameTournament");
    panelDiv.classList.add('inputText');
    nameTournament.type = "text";

    const submitButton = document.createElement("button");
    submitButton.setAttribute("id", "submitName");
    submitButton.innerHTML = 'Stwórz turniej';

    panelDiv.append(nameTournament);
    panelDiv.append(submitButton);
    this.app.append(panelDiv);

    submitButton.addEventListener('click', () => {
        const newTournament = new Tournament(nameTournament.value);
        localStorage.setItem("tournament", JSON.stringify(newTournament));
        window.location.reload();
    })  
}

/**
 * Prezentacja i obsługa bierzącego turnieju
 */
function showTournament() {
    getHeader();
    getRounds();
    getPlayersList();
}

/**
 * Generuje nagłowek strony
 */
function getHeader() {
    let panelDiv = document.createElement("div");
    panelDiv.classList.add('panel');
    
    let nameTournament = document.createElement("h2");
    nameTournament.innerHTML = tournament.name;
    panelDiv.append(nameTournament);

    if (!tournament.isStarted) {

        let startButton = document.createElement("button");
        startButton.innerHTML = "Start";
        panelDiv.append(startButton);

        startButton.addEventListener('click', () => {
            tournament.start();
            tournament.startNewRound();
            localStorage.setItem("tournament", JSON.stringify(tournament));
            window.location.reload();
        })
    }
    
    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Usuń";
    panelDiv.append(deleteButton);

    deleteButton.addEventListener('click', () => {
        localStorage.removeItem("tournament");
        window.location.reload();
    })

    this.app.append(panelDiv);
}

function getRounds() {
    let div = document.createElement("div");
    console.log(tournament);
    tournament.rounds.forEach( (round) => {
        getRound(round, div);
    });

    this.app.append(div);
}

function getRound(round, div) {
    let panelDiv = document.createElement("div");
    panelDiv.classList.add('panel');
    let roundTitle = document.createElement("h2");
    roundTitle.innerHTML = "Runda " + round.number;
    panelDiv.append(roundTitle);

    round.parings.forEach( (paring, index) => {
        getParing(paring, index, panelDiv);
    });
    div.prepend(panelDiv);

    round.isFinish();
}

function getParing(paring, index, roundDiv) {
    let paringDiv = document.createElement("div");
    paringDiv.classList.add('panel');
    paringDiv.innerHTML = "Stół " + (index+1);

    let playerOneButton = document.createElement("button");
    playerOneButton.innerHTML = paring.playerOne.name;
    if (paring.locked && paring.playerOneWin) {
        playerOneButton.setAttribute("disabled", "");
        playerOneButton.style.backgroundColor = "green";
    } else if (paring.locked) {
        playerOneButton.setAttribute("disabled", "");
        playerOneButton.style.backgroundColor = "red";
    }
    paringDiv.append(playerOneButton);

    let vsSpan = document.createElement("span");
    vsSpan.innerHTML = " vs. ";
    paringDiv.append(vsSpan);

    let playerTwoButton = document.createElement("button");
    playerTwoButton.innerHTML = paring.playerTwo.name;
    if (paring.locked && paring.playerTwoWin) {
        playerTwoButton.setAttribute("disabled", "");
        playerTwoButton.style.backgroundColor = "green";
    } else if (paring.locked) {
        playerTwoButton.setAttribute("disabled", "");
        playerTwoButton.style.backgroundColor = "red";
    }
    paringDiv.append(playerTwoButton);
    roundDiv.append(paringDiv);

    playerOneButton.addEventListener('click', () => {
        paring.playerOneWin = true;
        paring.locked = true;
        paring.playerOne.wins += 1;
        save();

    })

    playerTwoButton.addEventListener('click', () => {
        paring.playerTwoWin = true;
        paring.locked = true;
        paring.playerTwo.wins += 1;
        save();
    })
}


/**
 * Generuje listę graczy
 * TODO: rozbudować o statystyki
 */
function getPlayersList() {
    let panelDiv = document.createElement("div");
    panelDiv.classList.add('panel');

    if (!tournament.isStarted) {
        addPlayerForm(panelDiv);
    }

    let table = document.createElement("table");
    let tbody = document.createElement("tbody");
    table.append(tbody);

    tournament.players.forEach( (player, index) => {
        let row = document.createElement("tr");
        let lp = document.createElement("td");
        lp.innerHTML = index+1;
        row.append(lp);
        let name = document.createElement("td");
        name.innerHTML = player.name;
        row.append(name);
        tbody.append(row);
    })


    panelDiv.append(table);
    this.app.append(panelDiv);
}

/**
 * Formularz dodający graczy.
 * Dziła TYLKO przed turniejem.
 * @param panelDiv 
 */
function addPlayerForm(panelDiv) {
    
    let addPlayerName = document.createElement("input");
    addPlayerName.setAttribute("id", "addPlayerName");
    addPlayerName.type = "text";

    let addPlayerButton = document.createElement("button");
    addPlayerButton.setAttribute("id", "addPlayerButton");
    addPlayerButton.innerHTML = 'Dodaj gracza';

    panelDiv.append(addPlayerName);
    panelDiv.append(addPlayerButton);
    panelDiv.append(document.createElement("hr"));

    addPlayerButton.addEventListener('click', () => {
        tournament.addPlayer(addPlayerName.value);
        save();
    })  
}

/**
 * Zapisane do LocalStorage i przeładowanie strony
 */
function save() {
    localStorage.setItem("tournament", JSON.stringify(tournament));
    document.location.reload();
}

if (tournament === null) {
    createTournament();
} else {
    showTournament();
}