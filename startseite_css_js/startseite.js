// ----------------------------------------------------------------------------------------------------------
//  GLOBALE VARIABLEN & ZUSTÄNDE
let currentZoom = 0.9;
const zoomStep = 0.25;
let tx = 0, ty = 0;              // Aktuelle Verschiebungskoordinaten
let isDragging = false;          // Status für Kartenverschiebung
let startX, startY;              // Startpunkt beim Klicken für Drag
let activeMapPoint = null;       // SVG-Koordinaten des gewählten Landes


// ----------------------------------------------------------------------------------------------------------
//  MAP ZOOM & PAN FUNKTIONEN
//  Berechnet die Transformation (Skalierung & Verschiebung) der Weltkarte

function updateMapTransform() {
    const mapElement = document.querySelector('.map-container');
    if (!mapElement) return;

    // Reset der Position, wenn die Karte zu klein wird
    if (currentZoom <= 0.9) {
        tx = 0;
        ty = 0;
    }
    mapElement.style.transform = `translate(${tx}px, ${ty}px) scale(${currentZoom})`;
}



// Initialisiert die Maus-Interaktionen (Klicken & Ziehen) für die Karte
function initMapInteractions() {
    const mapElement = document.querySelector('.map-container');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');

    // Steuerung der Zoom-Buttons
    if (zoomInBtn) {
        zoomInBtn.onclick = () => { currentZoom += zoomStep; updateMapTransform(); };
    }
    if (zoomOutBtn) {
        zoomOutBtn.onclick = () => {
            if (currentZoom > 0.9) { currentZoom -= zoomStep; updateMapTransform(); }
        };
    }

    // Drag-and-Drop Logik (Pan)
    if (mapElement) {
        // Kombinierte Funktion für Start (Maus & Touch)
        const handleStart = (e) => {
            isDragging = true;
            // Wählt clientX/Y von Maus oder dem ersten Finger (touch)
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            startX = clientX - tx;
            startY = clientY - ty;
            mapElement.style.cursor = 'grabbing';
        };

        // Kombinierte Funktion für Bewegung
        const handleMove = (e) => {
            if (!isDragging) return;

            // Verhindert das Scrollen der Seite beim Ziehen auf dem Handy
            if (e.type === 'touchmove') e.preventDefault();

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            const limitX = (currentZoom - 0.9) * 600;
            const limitY = (currentZoom - 0.9) * 300;

            let newX = clientX - startX;
            let newY = clientY - startY;

            tx = Math.max(-limitX, Math.min(limitX, newX));
            ty = Math.max(-limitY, Math.min(limitY, newY));
            updateMapTransform();
        };

        // Kombinierte Funktion für Ende
        const handleEnd = () => {
            isDragging = false;
            mapElement.style.cursor = 'grab';
        };

        // Maus-Events (Desktop)
        mapElement.onmousedown = handleStart;
        window.onmousemove = handleMove;
        window.onmouseup = handleEnd;

        // Touch-Events (Mobile)
        mapElement.addEventListener('touchstart', handleStart, { passive: false });
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);
    }
}


// ----------------------------------------------------------------------------------------------------------
//  Verarbeitet Klicks auf Länder und verknüpft sie mit den Map-Daten
function handleCountryClick(e) {
    const svg = document.getElementById("map-svg");
    if (!svg) return;

    const target = e.target.closest('path');
    if (!target || target.id === "map-svg") return;

    // Wir holen die Klasse ganz sicher als Text
    let countryClass = target.getAttribute('class');
    if (countryClass) {
        countryClass = countryClass.split(' ')[0]; // Nur das erste Wort nehmen
    }

    // Wenn keine ID da ist, nehmen wir die Klasse
    const countryId = target.id || countryClass;

    const labels = typeof simplemaps_worldmap_mapdata !== 'undefined' ? simplemaps_worldmap_mapdata.labels : {};

    let foundData = Object.values(labels).find(label => label.parent_id === countryId);

    if (foundData) {
        document.getElementById("country_name").textContent = foundData.name;
        document.getElementById("dish_count").textContent = foundData.size || "0";

        const link = document.getElementById('tofood-link');
        if (link) link.href = foundData.name + '.html';

        // Alle alten Markierungen weg
        svg.querySelectorAll('.active-country').forEach(el => el.classList.remove('active-country'));

        // Markieren: Entweder per ID oder alle mit der gleichen Klasse
        if (target.id) {
            target.classList.add('active-country');
        } else if (countryClass) {
            // Wir suchen alle Pfade, die diese Klasse im Attribut stehen haben
            const allPaths = svg.getElementsByTagName('path');
            for (let i = 0; i < allPaths.length; i++) {
                if (allPaths[i].getAttribute('class') && allPaths[i].getAttribute('class').includes(countryClass)) {
                    allPaths[i].classList.add('active-country');
                }
            }
        }

        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        activeMapPoint = pt.matrixTransform(svg.getScreenCTM().inverse());
        updateElasticLine();
    }
}


// ----------------------------------------------------------------------------------------------------------
//  Zeichnet und animiert die Verbindungslinie zwischen Land und Infopanel
function updateElasticLine() {
    const svg = document.getElementById("map-svg");
    const circle = document.getElementById("dish_count");
    if (!svg || !activeMapPoint || !circle) return;

    // Zielpunkt: Mitte des Dish-Count Kreises
    const rect = circle.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;

    // Aktuelle Position des Startpunkts auf dem Screen ermitteln
    const currentPos = activeMapPoint.matrixTransform(svg.getScreenCTM());
    const pt = svg.createSVGPoint();

    // Koordinaten zurück ins SVG-System transformieren
    pt.x = currentPos.x; pt.y = currentPos.y;
    const startSVG = pt.matrixTransform(svg.getScreenCTM().inverse());

    pt.x = targetX; pt.y = targetY;
    const endSVG = pt.matrixTransform(svg.getScreenCTM().inverse());

    // SVG Elemente (Linie & Punkt) erstellen oder aktualisieren
    let line = document.getElementById("click-line") || createSVGElement("line", "click-line", svg);
    let dot = document.getElementById("click-dot") || createSVGElement("circle", "click-dot", svg);

    line.setAttribute("x1", startSVG.x);
    line.setAttribute("y1", startSVG.y);
    line.setAttribute("x2", endSVG.x);
    line.setAttribute("y2", endSVG.y);

    dot.setAttribute("cx", startSVG.x);
    dot.setAttribute("cy", startSVG.y);
    if (!dot.getAttribute("r")) dot.setAttribute("r", "10");

    // für flüssige Bewegung bei Drag/Zoom
    requestAnimationFrame(updateElasticLine);
}


//  Estellt ein SVG-Element mit dem gegebenen Tag und ID im angegebenen Parent
function createSVGElement(tag, id, parent) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    el.setAttribute("id", id);
    parent.appendChild(el);
    return el;
}


// ----------------------------------------------------------------------------------------------------------
// Steuerung des horizontalen Scrollens der Rezeptkarten
function handleCarousel() {
    const cardsection = document.getElementById('cardsection');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    if (!cardsection || !prevBtn || !nextBtn) return;

    const cardWidth = 300;
    const gap = 20;
    const scrollAmount = cardWidth + gap;

    // Klick-Events für Vor- und Zurück-Buttons
    prevBtn.onclick = () => cardsection.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    nextBtn.onclick = () => cardsection.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}


// ----------------------------------------------------------------------------------------------------------
//  Startet alle Funktionen, sobald das Dokument geladen ist
document.addEventListener('DOMContentLoaded', function () {
    handleCarousel();
    initMapInteractions();
    updateMapTransform();
    document.addEventListener("click", handleCountryClick);
});