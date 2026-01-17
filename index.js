// Darkmode- bzw. Lightmode-Funktion
let darkmode = localStorage.getItem('darkmode');
const themeSwitch = document.getElementById('theme-switch');

function enableDarkmode() {
    document.body.classList.add('darkmode');
    localStorage.setItem('darkmode', 'active');
    // Wir müssen die Variable auch im Speicher aktualisieren
    darkmode = "active";
}

function disableDarkmode() {
    document.body.classList.remove('darkmode');
    localStorage.setItem('darkmode', null);
    // Variable zurücksetzen
    darkmode = null;
}

if (darkmode === "active") enableDarkmode();

function toggleTheme() {
    darkmode = localStorage.getItem('darkmode');
    if (darkmode !== "active") {
        enableDarkmode();
    } else {
        disableDarkmode();
    }
}

themeSwitch.addEventListener("click", toggleTheme);


// Übergänge mit barba.js Library
import barba from '@barba/core';

const overlay = document.querySelector('.transition-overlay');

barba.init({
    transitions: [{
        name: 'overlay-transition',

        // 1. BEIM ERSTEN LADEN (Initial)
        once() {
            overlay.classList.add('is-animating2');
            // Nach der Animation Klasse entfernen
            setTimeout(() => {
                overlay.classList.remove('is-animating2');
            }, 1200);
        },

        // 2. BEIM VERLASSEN EINER SEITE (Klick auf Link)
        async leave() {
            overlay.classList.add('is-animating');
            // Warte 600ms, bis der Kasten die Sicht verdeckt
            await new Promise(resolve => setTimeout(resolve, 600));
        },

        // 3. BEIM BETRETEN DER NEUEN SEITE
        async enter() {
            // Wir warten kurz, bis die neue Seite geladen ist, 
            // dann regelt das CSS den Rest der Animation (die Fahrt nach rechts raus)
            setTimeout(() => {
                overlay.classList.remove('is-animating');
            }, 600);
        }
    }]
});

