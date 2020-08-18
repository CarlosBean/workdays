const turns = ['Tarde 1', 'Tarde 2', 'Mañana 1', 'Mañana 2', 'Noche 1', 'Noche 2', 'Descanso 1', 'Descanso 2'];
const result = document.getElementById('result');
const inputTurn = document.getElementById('inputTurn');
var inputDate;

document.getElementById("inputDate").addEventListener("change", function () {
    inputDate = this.value;
});

function getDiffDays(initialDate, endDate) {
    const diffTime = Math.abs(endDate - initialDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function getWorkTurn() {
    let turnId = inputTurn.options[inputTurn.selectedIndex].value;
    let currentDate = new Date().setHours(0, 0, 0, 0);
    let endDate = new Date(inputDate).setHours(24, 0, 0, 0);
    let diffDays = getDiffDays(currentDate, endDate);

    let indexTurn;

    if (endDate >= currentDate) {
        indexTurn = (diffDays - (turns.length - turnId)) % turns.length;
        indexTurn = indexTurn < 0 ? turns.length + indexTurn : indexTurn;
    } else {
        indexTurn = Math.abs((diffDays - (turns.length + turnId)) % turns.length);
    }

    result.innerText = turns[indexTurn];
}