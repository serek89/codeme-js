class Player {
    constructor(id, name) {
        this.id = id,
        this.name = name,
        this.bigPoints = 0,
        this.smallPoints = 0,
        this.lostPoints = 0
    }

    addPoints = (bigPoints, smallPoints, lostPoints) => {
        this.bigPoints += bigPoints;
        this.smallPoints += smallPoints;
        this.lostPoints += lostPoints;
    }

    /**
     * Sortuje w koelejności:
     * po bigPoints - malejąco 
     * po smallPoints - malejąco
     * po lostPoints - rosnąco
     */
    static sortByPoints = (a, b) => {
        if (a.bigPoints != b.bigPoints) {
            return b.bigPoints - a.bigPoints;
        }
        if (a.smallPoints != b.smallPoints) {
            return b.smallPoints - a.smallPoints;
        }
        return a.lostPoints - b.lostPoints;
    }
}

const playerBYE = new Player(0, "BYE");

class Tournament {
    constructor(name, date) {
        this.name = name,
        this.date = date
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
    
        const round = new Round(this.rounds.length+1);
        round.prepareParings(this.players);
        this.rounds.push(round);
    }

    sortPlayersByPoints = (playerOne, playerTwo) => {
        return playerTwo.points - playerOne.points;
    }
}

class Round {
    constructor(number) {
        this.number = number,
        this.parings = []
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
        this.playerOnePoints = 0,
        this.playerTwoPoints = 0,
        this.locked = false
    }
}


/**
 * test
 * turniej BO3 - do 2 zwycięstw
 */

const maxPlayer = 13;
const myTournament = new Tournament('testowy', '2022-04-23');

for (let i = 1; i <= maxPlayer; i++) {
    let char = String.fromCharCode(64+i);
    myTournament.addPlayer("Gracz " + char);
}

myTournament.start();
for (let i = 0; i < myTournament.maxRound; i++) {
    myTournament.startNewRound();
    playRound(myTournament.rounds[i].parings);
}

myTournament.players.sort(Player.sortByPoints);

console.log(myTournament);

playRound = (parings) => {
    parings.forEach(e => {
        if(!e.locked) {
            if (Math.floor(Math.random() * 2)) {
                e.playerOnePoints = 2;
                e.setPlayerTwoPoints( Math.floor(Math.random() * 2) );
                e.playerOne.addPoints(1, e.playerOnePoints, e.playerTwoPoints);
                e.playerTwo.addPoints(0, e.playerTwoPoints, e.playerOnePoints);
            } else {
                e.setPlayerOnePoints( Math.floor(Math.random() * 2) );
                e.playerTwoPoints = 2;
                e.playerOne.addPoints(0, e.playerOnePoints, e.playerTwoPoints);
                e.playerTwo.addPoints(1, e.playerTwoPoints, e.playerOnePoints);
            }
            e.locked = true;
        }
    });
}