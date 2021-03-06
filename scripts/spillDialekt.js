// jshint esversion: 6

﻿"use strict";
const image = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
const db = firebase.firestore();

const dialekter = [{
    riktigOmraade: "Bergen",
    lydfilSrc: "media/audio/bergen.mp3",
    lydtekst: "USA er vår nærmeste allierte, og vårt samarbeid baserer seg på felles verdier, og på felles interesser. Vi ønsker å videreføre det gode samarbeidet. Og for regjeringen, så er det aller viktigste, å ivareta norske interesser. USA er viktig for norsk økonomi, for norske arbeidsplasser, og for norsk sikkerhet.",
    riktigKoordinat: { lat: 60.3910, lng: 5.3261 }
},
{
    riktigOmraade: "Trondheim",
    lydfilSrc: "media/audio/tronder.mp3",
    lydtekst: "Nei, vi har ikke fått løs tampene vi på babord side, for der var flammen og der kom røyken ut. Så vi har ikke kommet båtløs fra ham, for han hadde satt fast tampen på babord side av oss, han....",
    riktigKoordinat: { lat: 63.4305, lng: 10.3950 }
},
{
    riktigOmraade: "Grønland / Oslo Øst", 
    lydfilSrc: "media/audio/gronland.mp3",
    lydtekst: "...",
    riktigKoordinat: { lat: 59.912521, lng: 10.762042 }

},
{
    riktigOmraade: "Fredrikstad", 
    lydfilSrc: "media/audio/fredrikstad.mp3",
    lydtekst: "Hallo fra den andre byen. Nå blir det sikkelig godt med gjensyn. En liten tur innom Strømstad, ...",
    riktigKoordinat: { lat: 59.2201, lng: 10.9348 }
},
{
    riktigOmraade: "Området rundt Hardangerfjorden",
    lydfilSrc: "media/audio/hardangerfjorden.mp3",
    lydtekst: "Det var vår båt og deres åre.",
    riktigKoordinat: { lat: 60.3397, lng: 6.2888 }
},
{
    riktigOmraade: "Sørlandet",
    lydfilSrc: "media/audio/sorlandet.mp3",
    lydtekst: "Det er ikke noe problem altså. Men hvis du skal ut å fiske makrel, så må du nok flytte den.",
    riktigKoordinat: { lat: 58.154742, lng: 8.017901 }
},
{
    riktigOmraade: "Tromsø", 
    lydfilSrc: "media/audio/tromso.mp3",
    lydtekst: "Regjeringa! Regjeringa! Regjerna skal det være.Det er den første lyden som forsvinner.Han er flau han.Han er flau over dialekten sin.Det er en skam.Han er en skam for landsdelen.",
    riktigKoordinat: { lat: 69.649352, lng: 18.956052 }

},
{
    riktigOmraade: "Hallingdal", 
    lydfilSrc: "media/audio/hallingdal.mp3",
    lydtekst: "Det fineset ordet jeg kjenner, det må være kjake.",
    riktigKoordinat: { lat: 60.711305, lng: 8.942342 }
},
{
    riktigOmraade: "Nordstrand",
    lydfilSrc: "media/audio/nordstrand.mp3",
    lydtekst: "Jeg har en moped som framkomstmiddel, en vespa. Det er veldig kjekt. Jeg synes det er slitsomt å stå som en sardinboks på en trikk.",
    riktigKoordinat: { lat: 59.879181, lng: 10.790032 }
},
{
    riktigOmraade: "Molde",
    lydfilSrc: "media/audio/molde.mp3",
    lydtekst: "Jeg synes maten var veldig god.",
    riktigKoordinat: { lat: 62.7374, lng: 7.1588 }
}

];
let spillerID;
let finalRekkefolge = [];
let aktivDialektIndex;
let antallPoeng = 0;
let spillernavn;
let scoreRunde = 0;
let scorelisteDialekt = [];
let harSjekketSvar = false;
let harAvgittSvar = false;
let markers = [];
let map;
let valgtPosisjon = undefined;
oppdaterScoreBoard();
function startSpill(e) {
    e.preventDefault();
    spillerID = "S" + Date.now();
    spillernavn = document.querySelector("input").value;

    document.querySelector("#registreringsContainer").style.display = "none";
    document.querySelector("#spillContainer").style.display = "flex";
    document.querySelector("#knappNeste").addEventListener("click", visNesteDialekt);

    document.querySelector("#knappSjekkSvar").addEventListener("click", sjekkSvar);

    aktivDialektIndex = -1;
    visNesteDialekt();
}
function oppdaterScoreBoard() {
    // Tømmer scoreboarden
    const containerliste = document.querySelectorAll(".highscoreContainer");
    for (let i = 0; i < containerliste.length; i++) {
        containerliste[i].innerHTML = "";
    }
    scorelisteDialekt = [];

    let antallBehandledeEntries = 0;
    db.collection("HSDialektspillet").get().then((querySnapshot) => {
        querySnapshot.forEach((entry) => {
            const nyScore = {
                spillernavn: entry.data().spillernavn,
                score: entry.data().score,
                ID: entry.data().ID
            };
            scorelisteDialekt.push(nyScore);

            antallBehandledeEntries++;
            if (antallBehandledeEntries === querySnapshot.size) {
                // Alle scorene er lagt til i listen
                scorelisteDialekt.sort(compare);
                for (let i = 0; i < 5; i++) {
                    leggTilPaaScoreBoard(scorelisteDialekt[i].spillernavn, scorelisteDialekt[i].score);
                }
                const plassering = finnPlassering();
                document.querySelector("#scorePlassering").innerHTML = `Du kom på ${plassering}. plass blant alle som har spilt til nå!`;
            }
        });
    });
    function compare(a, b) {
        if (a.score > b.score)
            return -1;
        if (a.score < b.score)
            return 1;
        return 0;
    }
    function leggTilPaaScoreBoard(spillernavn, score) {
        for (let i = 0; i < containerliste.length; i++) {
            const nyDiv = document.createElement("div");
            containerliste[i].appendChild(nyDiv);
            const nyttNavnEl = document.createElement("h4");
            nyttNavnEl.innerHTML = spillernavn;
            const nyttScoreEl = document.createElement("p");
            nyttScoreEl.innerHTML = score;
            nyDiv.appendChild(nyttNavnEl);
            nyDiv.appendChild(nyttScoreEl);
        }
    }
}
function visNesteDialekt() {
    aktivDialektIndex++;

    if (aktivDialektIndex === dialekter.length - 1) {
        document.querySelector("#knappNeste").innerHTML = "Fullfør spill";
    }

    if (!harSjekketSvar) {
        sjekkSvar();
    }

    if (aktivDialektIndex === dialekter.length) {
        avsluttSpill();
        return;
    }

    harSjekketSvar = false;
    clearOverlays();
    harAvgittSvar = false;
    valgtPosisjon = undefined;

    map.addListener('click', (e) => {
        if (!harAvgittSvar) {
            valgtPosisjon = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            addMarker(valgtPosisjon, image, true);
            document.querySelector("#knappSjekkSvar").disabled = "";
        }
    });

    document.querySelector("#dialektTekst").innerHTML = dialekter[aktivDialektIndex].lydtekst;


    // Viser relevante elementer
    document.querySelector("audio").style.display = "block";
    document.querySelector("#spillSvarPo").style.display = "none";
    document.querySelector("#spillSvarPl").style.display = "none";
    document.querySelector("#dialektTekst").style.display = "block";
    document.querySelector("#knappSjekkSvar").disabled = true;
    document.querySelector("#info").style.display = "block";

    // Bytter lydfil
    document.querySelector("#audioSrc").src = dialekter[aktivDialektIndex].lydfilSrc;
    document.querySelector("#audioEl").load();
    document.querySelector("#audioEl").play();
}
function sjekkSvar() {
    let localIndex = aktivDialektIndex;
    harSjekketSvar = true;
    harAvgittSvar = true;
    if (localIndex === dialekter.length) {
        localIndex--;
    }
    addMarker(dialekter[localIndex].riktigKoordinat, "", false);
    let avstand;
    if (valgtPosisjon !== undefined) {
        finalRekkefolge.push(valgtPosisjon);
        avstand = finnAvstand(dialekter[localIndex].riktigKoordinat, valgtPosisjon);
    } else {
        if (localIndex !== 0) {
            finalRekkefolge.push("NULL");
        }
        avstand = Number.MAX_SAFE_INTEGER;
    }
    scoreRunde = Math.round(5000 * Math.exp(-avstand / 100000));
    if (scoreRunde < 0) {
        scoreRunde = 0;
    }

    antallPoeng += scoreRunde;
    document.querySelector("#totalScore").innerHTML = "Din score: " + antallPoeng;

    const svarPoengEl = document.querySelector("#spillSvarPo");
    const svarPosisjonEl = document.querySelector("#spillSvarPl");
    svarPoengEl.innerHTML = `Du fikk ${scoreRunde} denne runden.`;
    svarPosisjonEl.innerHTML = `Riktig plassing for denne dialekten: ${dialekter[localIndex].riktigOmraade}.`;
    document.querySelector("audio").style.display = "none";
    svarPosisjonEl.style.display = "block";
    svarPoengEl.style.display = "block";
    document.querySelector("#dialektTekst").style.display = "none";
    document.querySelector("#knappSjekkSvar").disabled = "true";
    document.querySelector("#info").style.display = "none";
    scoreRunde = 0;
}
function avsluttSpill() {
    document.querySelector("#spillContainer").style.display = "none";
    document.querySelector("#resultatContainer").style.display = "flex";
    document.querySelector("#sluttScore").innerHTML = "Din totale score ble: " + antallPoeng;
    db.collection("HSDialektspillet").add({
        spillernavn: spillernavn,
        score: antallPoeng,
        ID: spillerID,
        valgtePosisjoner: finalRekkefolge
    });
    oppdaterScoreBoard();
}
function finnPlassering() {
    for (let i = 0; i < scorelisteDialekt.length; i++) {
        if (spillerID === scorelisteDialekt[i].ID) {
            return i + 1;
        }
    }
}
function initMap() {
    const startLocation = { lat: 66, lng: 15 };

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4.4,
        center: startLocation,
        disableDefaultUI: true
    });

    map.addListener('click', (e) => {
        if (!harAvgittSvar) {
            valgtPosisjon = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            addMarker(valgtPosisjon, image, true);
            document.querySelector("#knappSjekkSvar").disabled = "";
        }
    });
}
function addMarker(location, ikon, clear) {
    if (clear === true) {
        clearOverlays();
    }
    const marker = new google.maps.Marker({
        position: location,
        map: map,
        icon: ikon
    });
    markers.push(marker);
}
function clearOverlays() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers.length = 0;
}
const rad = function (x) {
    return x * Math.PI / 180;
};
function finnAvstand(p1, p2) {
    const R = 6378137; // Earth’s mean radius in meter
    const dLat = rad(p2.lat - p1.lat);
    const dLong = rad(p2.lng - p1.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d; // returns the distance in meter
};










/* ---------- SET MARGIN FOR MAIN AND FOOTER ---------- */

function pxToNum(string) {
    // remove 'px' at the end and turn string to number
    return Number(string.slice(0, string.length - 2));
}

function mainTop() {
    let nav = document.querySelector('nav');
    let main = document.querySelector('main');

    let navCompHeight = window.getComputedStyle(nav).height;
    let navHeight = pxToNum(navCompHeight);

    // adjust margin top
    main.style.setProperty('--mainTop', `${7.5 * navHeight}px`);
}

function footerTop() {
    let footer = document.querySelector('footer');

    let footerCompHeight = window.getComputedStyle(footer).height;
    let footerHeight = pxToNum(footerCompHeight);

    // hide footer from start view
    footer.style.setProperty('--footerTop', `-${2 * footerHeight}px`);
}

mainTop();
footerTop();

document.querySelector("#form").addEventListener("submit", startSpill);
