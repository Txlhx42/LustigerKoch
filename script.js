//elemente in variablen initialisieren
const button = document.getElementById('start');
let infoText = document.getElementById('textButton');

//Punkte
let counter = document.getElementById('counter');
let counterText = document.getElementById('text');
let punkte = 0;

//Leben
let herzen = document.getElementById('herzen');
let herzenElemente = document.getElementsByClassName('heart');
let anzahlHerzen = 3;


//allgemeine Variablen 
let pfanneLocation = 1; //startposition der pfanne in der spalte 1
let speed = document.getElementById('speed'); //Taktanzeige
let zeilenCount = 5; //höhe
let spaltenCount = 4; //anzahl der Spalten
let geschwindigkeit = 1500; //Geschwindigkeit des SpielIntervalls
let spielIntervall;

//klasse Essen mit eingabe von HTML-img, der aktuellen höhe, der Spaltenposition und der Richtung
class Essen {
    constructor(html, hoehe, jetztigePosition, richtung) {
        this.html = html;
        this.hoehe = hoehe;
        this.jetztigePosition = jetztigePosition;
        this.richtung = richtung;
    }
}

//objekt-Array für 4 Essen erstellen
let ObjektEssen = [
    new Essen(`<img id="biryani" src="./images/biryani.png">`, zeilenCount, 0, "nachUnten"),
    new Essen(`<img id="hamburger" src="./images/hamburger.png">`, zeilenCount, 1, "nachUnten"),
    new Essen(`<img id="pizza" src="./images/pizza.png">`, zeilenCount, 2, "nachUnten"),
    new Essen(`<img id="salad" src="./images/salad.png">`, zeilenCount, 3, "nachUnten")
];

//wenn auf den button Start geklickt wird
button.addEventListener('click', function () {
    infoText.innerHTML = 'Spiel Gestartet';
    speed.innerText = 'ms: 1500';
    button.remove();
    starteSpiel();
});

//spielfeld wird Dynamisch eingefügt
function erstelleSpielfeld() {
    let spielfeld = document.getElementById("spielfeld");

    //es werden 28 DIV-Elemente erstellt
    for (let i = 0; i < 24; i++) {
        let divEinfügen = document.createElement("div");
        divEinfügen.classList.add("spielfeld-grid");
        divEinfügen.setAttribute("id", "feld " + i)
        spielfeld.appendChild(divEinfügen);
    }

    //random Positionen pro spalte
    let essenRandomPos = [];
    let randomHoehe;
    for (let i = 0; i < spaltenCount; i++) {
        do {
            //alle reihen von 1-5
            randomHoehe = Math.floor((Math.random() * 4) + 2);
        } while (essenRandomPos.includes(randomHoehe)); //überprüfung ob random zahl in spalte schon drinnen ist
        essenRandomPos.push(randomHoehe); //hinzufügen
        ObjektEssen[i].hoehe = essenRandomPos[i]; //höhe des Essens wird auf die höhe des random feld gesetzt

    }
    //einfügen Pfanne in mittleres linkes feld
    document.getElementById('feld 21').innerHTML = '<img id="pfanne" src="./images/pfanne.png" alt="pfanne">';
}

document.addEventListener('keydown', function (event) {
    //pfanne
    const image = document.getElementById('pfanne');
    //spielfeld in einem array
    const boxes = document.querySelectorAll('.spielfeld-grid');
    //verhindern von Interaktiven Elementen
    event.preventDefault();

    // sucht jedes einzelne Spielfeld um Pfanne zu finden
    let currentBoxIndex;
    boxes.forEach((box, index) => {
        if (box.contains(image)) {
            currentBoxIndex = index;
        }
    });

    // Pfanne wird bewegt je nacht drücken der Pfeiltaste
    if (event.key === 'ArrowRight' && currentBoxIndex < boxes.length - 1) {
        boxes[currentBoxIndex].removeChild(image);
        boxes[currentBoxIndex + 1].appendChild(image);
        pfanneLocation++;
    } else if (event.key === 'ArrowLeft' && currentBoxIndex > 0) {
        if (boxes[currentBoxIndex - 1] !== document.getElementById('feld 19')) {
            boxes[currentBoxIndex].removeChild(image);
            boxes[currentBoxIndex - 1].appendChild(image);
            pfanneLocation--;
        }
    }

});

function spielfeldBefuellen() {
    //gibt ein Array mit den Elementen, welche die Klasse ".spielfeld-grid" haben zurück
    let felder = document.querySelectorAll('.spielfeld-grid');
    let randomEssen = [];
    for (let i = 0; i < 20; i++) {
        //alle Felder werden resettet
        felder[i].innerHTML = '';
    }

    //spielfeld wird wieder befüllt mit essen
    for (let i = 0; i < ObjektEssen.length; i++) {
        //stelle + ((höhe des spielfelds ohne pfanne - höhe des essensobjektes) * spalte) => Index des Essen *Im Kontext X und Y koordinate*
        felder[i + ((5 - ObjektEssen[i].hoehe) * spaltenCount)].innerHTML = ObjektEssen[i].html;
    }
}


function bewegeEssen(essenIndex) {
    //wenn essen nach unten geht
    if (ObjektEssen[essenIndex].richtung == "nachUnten") {
        //essen höhe wird um 1 verringert
        ObjektEssen[essenIndex].hoehe = ObjektEssen[essenIndex].hoehe - 1;
        //wenn unten erreicht wurde, wird die richtung geändert
        if (ObjektEssen[essenIndex].hoehe == 1) {
            ObjektEssen[essenIndex].richtung = "nachOben";
        }
    } else if (ObjektEssen[essenIndex].richtung == "nachOben") { //wenn essen nach oben geht

        //bevor er wieder hochgeht kontrolliert er ob essen in reihe ist und ob da pfanne drinnen ist
        if (ObjektEssen[essenIndex].hoehe == 1) {
            if (pfanneLocation == essenIndex) {
                punkteCounter();
            } else {
                verliereHerzen();
            }
        }

        //essen höhe wird um 1 erhöht
        ObjektEssen[essenIndex].hoehe = ObjektEssen[essenIndex].hoehe + 1;

        //wenn Essen in der höhe vom index 1-3 ist, wird die richtung geändert
        if (ObjektEssen[essenIndex].hoehe > 2 && ObjektEssen[essenIndex].hoehe < 5) {
            //70% Chance, dass das Essen ganz oben NICHT berührt
            if (Math.floor(Math.random() * 10) < 7) {
                ObjektEssen[essenIndex].richtung = "nachUnten";
            }
        }

        //wenn essen auf Ebene 1 ist wird richtung automatisch abgeändert
        if (ObjektEssen[essenIndex].hoehe == 5) {
            ObjektEssen[essenIndex].richtung = "nachUnten";
        }

    }
    //wiederholtes zeichnen des spielfelds
    spielfeldBefuellen();
}

function verliereHerzen() {
    //dekremenetieren der Herzen
    anzahlHerzen--;

    for (let i = 0; i < herzenElemente.length; i++) {
        if (anzahlHerzen > i) {
            herzenElemente[i].style.display = "inline";
        } else {
            //herz wird entfernt
            herzenElemente[i].style.display = "none";
        }
    }

    if (anzahlHerzen === 0) {
        alert("Game Over! Du hast verloren");
        window.location.reload();
    }
}

function punkteCounter() {
    punkte++;
    counterText.textContent = `Points: ${punkte}`;

    //alle 5 Punkte geschwindigkeitserhöhung
    if (punkte % 5 === 0) {
        geschwindigkeitErhoehen();
    }
}

function intervallEssen() {
    spielIntervall = setInterval(() => {
        for (let i = 0; i < 4; i++) {
            bewegeEssen(i);
        }
    }, geschwindigkeit);
}

function geschwindigkeitErhoehen() {
    //geschwindigkeit über 300ms
    if (geschwindigkeit > 300) {
        //geschwindigkeit dekrementieren
        geschwindigkeit -= 100;
        //neues intervall
        clearInterval(spielIntervall);
        //neues intervall auf Essen anwenden
        intervallEssen();
        //intervall auf Display ausgeben
        speed.textContent = `ms: ${geschwindigkeit}`;
    }
}

//eigentliches Spielfunktion
function starteSpiel() {
    erstelleSpielfeld();
    spielfeldBefuellen();
    intervallEssen();
}