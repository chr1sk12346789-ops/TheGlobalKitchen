document.addEventListener('DOMContentLoaded', function () {
    // Startwerte festlegen
    var currentZoom = 0.9;
    var zoomStep = 0.2;

    // Die Elemente anhand deiner IDs aus dem HTML holen
    var mapElement = document.querySelector('.map-container');
    var zoomInBtn = document.getElementById('zoom-in');
    var zoomOutBtn = document.getElementById('zoom-out');

    // Funktion, die das Bild skaliert und den Text aktualisiert
    function updateMap() {
        if (mapElement) {
            // Die Karte transformieren (vergrößern/verkleinern)
            mapElement.style.transform = "scale(" + currentZoom + ")";
        }
    }

    // Klick-Funktion für den Plus-Button
    if (zoomInBtn) {
        zoomInBtn.onclick = function () {
            currentZoom = currentZoom + zoomStep;
            updateMap();
        };
    }

    // Klick-Funktion für den Minus-Button
    if (zoomOutBtn) {
        zoomOutBtn.onclick = function () {
            // Abfrage, damit die Map nicht kleiner als 20% wird
            if (currentZoom > 0.9) {
                currentZoom = currentZoom - zoomStep;
                updateMap();
            }
        };
    }

    updateMap();
});