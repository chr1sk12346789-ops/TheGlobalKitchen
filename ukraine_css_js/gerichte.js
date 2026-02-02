$(document).ready(function () { /* $ - das Kürzel für die jQuery-Bibliothek*/
// funktioniert wenn html fertig geladen ist
    // gerichte wo mehr anzeigen
    $(".category").each(function () {
        $(this).find(".dish").not(":first").addClass("hidden");
    });
//Der Klick-Event-Handler
    $(".toggle-category").on("click", function () {
        const category = $(this).closest(".category");/*Geht im HTML-Baum nach oben, 
                     bis er das nächste Eltern-Element mit der Klasse .category findet*/
        const hiddenDishes = category.find(".dish.hidden");

        if (hiddenDishes.length > 0) { /* wenn es versteckte Gerichte gibt*/
            hiddenDishes.removeClass("hidden");
            $(this).text("Kategorie schließen");
        } else {
            category.find(".dish").not(":first").addClass("hidden");
            $(this).text("Kategorie öffnen");
        }
    });

    $(document).on("click", ".recipe-btn", function () {
    const url = $(this).data("url"); // Greift auf das HTML-Attribut data-url="..." zu ( rezept.html)
    if (url) {
        window.location.href = url;
    }
});
    

});

$(document).ready(function () {

    
    //am Ende des Inhalts (innerhalb des Containers) Button hinzufügen
        $(".right-side").append('<div class="show-more-btn">Mehr anzeigen</div>');
    

    //Der Klick-Event-Handler
    $(document).on("click", ".show-more-btn", function () {
        const textBlock = $(".right-side");

        textBlock.toggleClass("open");

        if (textBlock.hasClass("open")) {
            $(this).text("Weniger anzeigen");
        } else {
            $(this).text("Mehr anzeigen");
        }
    });

});