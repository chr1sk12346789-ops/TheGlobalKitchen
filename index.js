// THEME SWITCHER DARKMODE / LIGHTMODE
document.addEventListener('DOMContentLoaded', () => {
    let darkmode = localStorage.getItem('darkmode');
    const themeSwitch = document.getElementById('theme-switch');

    function enableDarkmode() {
        document.body.classList.add('darkmode');
        localStorage.setItem('darkmode', 'active');
        // speichere Variable im local storage
        darkmode = "active";
    }

    function disableDarkmode() {
        document.body.classList.remove('darkmode');
        localStorage.setItem('darkmode', null);
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

    if (themeSwitch) {
        themeSwitch.addEventListener("click", toggleTheme);
    }
});


// Page-specific initialization functions
function initMapPage() {
    if (document.querySelector('.map-container')) {
        initMapInteractions();
        updateMapTransform();
        document.addEventListener("click", handleCountryClick);
    }
}

function initUkrainePage() {
    if ($(".category").length > 0) {
        // gerichte wo mehr anzeigen
        $(".category").each(function () {
            $(this).find(".dish").not(":first").addClass("hidden");
        });
        //Der Klick-Event-Handler
        $(".toggle-category").on("click", function () {
            const category = $(this).closest(".category");
            const hiddenDishes = category.find(".dish.hidden");
            if (hiddenDishes.length > 0) {
                hiddenDishes.removeClass("hidden");
                $(this).text("Kategorie schließen");
            } else {
                category.find(".dish").not(":first").addClass("hidden");
                $(this).text("Kategorie öffnen");
            }
        });
        $(document).on("click", ".recipe-btn", function () {
            const url = $(this).data("url");
            if (url) {
                window.location.href = url;
            }
        });
    }
    if ($(".right-side").length > 0) {
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
    }
}

function initRecipePage() {
    if (document.getElementById("plus")) {
        let pButton = document.getElementById("plus");
        let mButton = document.getElementById("minus");
        let portion = document.getElementById("num");
        let amountOfEachIngredient = document.getElementsByClassName("ingredient-amount");
        let counter = 1;
        pButton.addEventListener("click", changePortion);
        mButton.addEventListener("click", changePortion);
        pButton.addEventListener("click", changeAmount);
        mButton.addEventListener("click", changeAmount);
        function changePortion(event) {
            if (event.target.id === "plus") {
                counter++;
            } else if (event.target.id === "minus") {
                if (counter != 1) {
                    counter--;
                } else {
                    counter = 1;
                }
            }
            portion.innerHTML = counter;
        }
        function changeAmount(event) {
            for (let i = 0; i < amountOfEachIngredient.length; i++) {
                let newAmount = counter * parseFloat(amountOfEachIngredient[i].getAttribute("data-base"));
                amountOfEachIngredient[i].innerHTML = newAmount;
            }
        }
    }
}

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


