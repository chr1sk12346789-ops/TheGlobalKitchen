"use strict";

// auf Buttons und Werte, die man benötigt zugreifen
let pButton = document.getElementById("plus");
let mButton = document.getElementById("minus");
let portion = document.getElementById("num");
//getElementsByClassName verhält sich wie ein Array
let amountOfEachIngredient = document.getElementsByClassName("ingredient-amount");

let counter = 1;

pButton.addEventListener("click", changePortion);
mButton.addEventListener("click", changePortion);
pButton.addEventListener("click", changeAmount);
mButton.addEventListener("click", changeAmount);

// Funktion um Portionsmenge zu ändern wenn man auf einen Button drückt
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

//Funktion um Mengenwerte zu mit Portion zu multiplizieren
function changeAmount(event) {
    for (let i = 0; i < amountOfEachIngredient.length; i++) {
        let newAmount = counter * parseFloat(amountOfEachIngredient[i].getAttribute("data-base"));
        //parseFloat wandelt Text in Zahl um und mit get Attribute, kann man auf den gespeicherten Wert zugreifen
        amountOfEachIngredient[i].innerHTML = newAmount;
    }


}