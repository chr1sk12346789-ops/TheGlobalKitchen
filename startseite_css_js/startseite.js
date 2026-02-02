document.addEventListener('DOMContentLoaded', function () {
    // CAROUSEL BUTTON FUNCTIONALITY
    const cardsection = document.getElementById('cardsection');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    if (cardsection && prevBtn && nextBtn) {
        // Button scroll functionality
        const cardWidth = 300;
        const gap = 20;
        const scrollAmount = cardWidth + gap;

        prevBtn.addEventListener('click', function () {
            cardsection.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });

        nextBtn.addEventListener('click', function () {
            cardsection.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });
    }

    // Variablen 
    var currentZoom = 0.9;
    var zoomStep = 0.25;
    var tx = 0; // Verschiebung X
    var ty = 0; // Verschiebung Y
    var isDragging = false;
    var startX, startY;

    var mapElement = document.querySelector('.map-container');
    var svg = document.getElementById('map-svg');
    var zoomInBtn = document.getElementById('zoom-in');
    var zoomOutBtn = document.getElementById('zoom-out');

    // Kombinierte Update-Funktion
    function updateMap() {
        if (mapElement) {
            // Wenn wir bei 0.9 sind, setzen wir tx/ty zurück auf 0
            if (currentZoom <= 0.9) {
                tx = 0;
                ty = 0;
            }
            mapElement.style.transform = "translate(" + tx + "px, " + ty + "px) scale(" + currentZoom + ")";
        }
    }

    // Zoom Logik
    if (zoomInBtn) {
        zoomInBtn.onclick = function () {
            currentZoom += zoomStep;
            updateMap();
        };
    }

    if (zoomOutBtn) {
        zoomOutBtn.onclick = function () {
            if (currentZoom > 0.9) { //wie weit man rauszoomen kann
                currentZoom -= zoomStep;
                updateMap();
            }
        };
    }

    // Drag Logik 
    if (mapElement) {
        mapElement.onmousedown = function (e) {
            isDragging = true;
            startX = e.clientX - tx;
            startY = e.clientY - ty;
            mapElement.style.cursor = 'grabbing';
        };

        window.onmousemove = function (e) {
            if (isDragging) {
                // Je höher der Zoom, desto größer der erlaubte Bereich.
                var limitX = (currentZoom - 0.9) * 600;
                var limitY = (currentZoom - 0.9) * 300;

                var newX = e.clientX - startX;
                var newY = e.clientY - startY;

                // Begrenzung anwenden
                if (newX > limitX) newX = limitX;
                if (newX < -limitX) newX = -limitX;
                if (newY > limitY) newY = limitY;
                if (newY < -limitY) newY = -limitY;

                tx = newX;
                ty = newY;

                updateMap();
            }
        };

        window.onmouseup = function () {
            isDragging = false;
            mapElement.style.cursor = 'grab';
        };
    }

    // Initialer Aufruf
    updateMap();
});

//Code der die Karte bei klicken zentriert und das Land, bzw. den Kontinent anzeigt
let activeMapPoint = null;

function removeActiveCountry(el) {
    el.classList.remove('active-country');
}

function addActiveCountry(p) {
    p.classList.add('active-country');
}

document.addEventListener("click", function (e) {
    const svg = document.getElementById("map-svg");
    if (!svg) return;

    let target = e.target.closest('path[id], g[id]');
    if (!target || target.id === "map-svg") return;

    const countryId = target.id; // Das ist z.B. "AF"

    // --- DATEN AUS LABELS SUCHEN ---
    let foundData = null;
    const labels = simplemaps_worldmap_mapdata.labels;

    // Wir suchen in der Labels-Liste nach der passenden parent_id
    for (let key in labels) {
        if (labels[key].parent_id === countryId) {
            foundData = labels[key];
            break;
        }
    }

    if (foundData) {
        // Texte setzen (Deutscher Name & Size aus dem Label)
        document.getElementById("country_name").textContent = foundData.name;
        document.getElementById("dish_count").textContent = foundData.size || "0";

        // Update the link href
        const link = document.getElementById('tofood-link');
        if (link) {
            link.href = foundData.name + '.html';
        }

        // Land einfärben
        svg.querySelectorAll('.active-country').forEach(removeActiveCountry);
        target.classList.add('active-country');
        if (target.tagName.toLowerCase() === 'g') {
            target.querySelectorAll('path').forEach(addActiveCountry);
        }

        // Koordinate für die Linie speichern
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        activeMapPoint = pt.matrixTransform(svg.getScreenCTM().inverse());

        // Gummiband-Schleife starten
        updateElasticLine();
    }
});

function updateElasticLine() {
    const svg = document.getElementById("map-svg");
    const circle = document.getElementById("dish_count");
    if (!svg || !activeMapPoint || !circle) return;

    // Aktuelle Position des roten Kreises (Sticky auf Screen)
    const rect = circle.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;

    // Aktuelle Position des Punktes auf der Karte (inkl. Zoom/Drag)
    const currentPos = activeMapPoint.matrixTransform(svg.getScreenCTM());

    const pt = svg.createSVGPoint();

    // Start (Land)
    pt.x = currentPos.x;
    pt.y = currentPos.y;
    const startSVG = pt.matrixTransform(svg.getScreenCTM().inverse());

    // Ende (Kreis)
    pt.x = targetX;
    pt.y = targetY;
    const endSVG = pt.matrixTransform(svg.getScreenCTM().inverse());

    let line = document.getElementById("click-line");
    let dot = document.getElementById("click-dot");

    if (!line) {
        line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("id", "click-line");
        svg.appendChild(line);
    }
    if (!dot) {
        dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("id", "click-dot");
        dot.setAttribute("r", "10");
        svg.appendChild(dot);
    }

    line.setAttribute("x1", startSVG.x);
    line.setAttribute("y1", startSVG.y);
    line.setAttribute("x2", endSVG.x);
    line.setAttribute("y2", endSVG.y);

    dot.setAttribute("cx", startSVG.x);
    dot.setAttribute("cy", startSVG.y);

    // Sorgt dafür, dass die Linie beim Draggon/Zoomen flüssig folgt
    requestAnimationFrame(updateElasticLine);
}




