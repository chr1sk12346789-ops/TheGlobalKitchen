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
        mapElement.onmousedown = (e) => {
            isDragging = true;
            startX = e.clientX - tx;
            startY = e.clientY - ty;
            mapElement.style.cursor = 'grabbing';
        };

        window.onmousemove = (e) => {
            if (!isDragging) return;
            // Dynamische Begrenzung der Verschiebung basierend auf Zoomstufe
            const limitX = (currentZoom - 0.9) * 600;
            const limitY = (currentZoom - 0.9) * 300;

            let newX = e.clientX - startX;
            let newY = e.clientY - startY;

            // Anwenden der Limits 
            tx = Math.max(-limitX, Math.min(limitX, newX));
            ty = Math.max(-limitY, Math.min(limitY, newY));
            updateMapTransform();
        };

        window.onmouseup = () => {
            isDragging = false;
            mapElement.style.cursor = 'grab';
        };
    }
}


// ----------------------------------------------------------------------------------------------------------
//  Verarbeitet Klicks auf Länder und verknüpft sie mit den Map-Daten
function handleCountryClick(e) {
    const svg = document.getElementById("map-svg");
    if (!svg) return;

    // Prüfen, ob ein Land (Path oder Group) getroffen wurde
    const target = e.target.closest('path[id], g[id]');
    if (!target || target.id === "map-svg") return;

    const countryId = target.id;
    // Zugriff auf die externe SimpleMaps Datenquelle
    const labels = typeof simplemaps_worldmap_mapdata !== 'undefined' ? simplemaps_worldmap_mapdata.labels : {};
    
    // Passenden Datensatz anhand der ID suchen
    let foundData = Object.values(labels).find(label => label.parent_id === countryId);

    if (foundData) {
        // UI Texte im Panel aktualisieren
        document.getElementById("country_name").textContent = foundData.name;
        document.getElementById("dish_count").textContent = foundData.size || "0";

        // Link zur entsprechenden Food-Seite anpassen
        const link = document.getElementById('tofood-link');
        if (link) link.href = foundData.name + '.html';

        // Visuelle Markierung des gewählten Landes
        svg.querySelectorAll('.active-country').forEach(el => el.classList.remove('active-country'));
        target.classList.add('active-country');
        if (target.tagName.toLowerCase() === 'g') {
            target.querySelectorAll('path').forEach(p => p.classList.add('active-country'));
        }

        // Klick-Punkt in SVG-Koordinatensystem umrechnen (wichtig für Zoom-Korrektur)
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