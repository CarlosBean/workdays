const turns = [
    { name: 'Tarde 1', value: 0, color: '--red', startHour: 14, endHour: 22 },
    { name: 'Tarde 2', value: 1, color: '--red', startHour: 14, endHour: 22 },
    { name: 'Mañana 1', value: 2, color: '--yellow', startHour: 6, endHour: 14 },
    { name: 'Mañana 2', value: 3, color: '--yellow', startHour: 6, endHour: 14 },
    { name: 'Noche 1', value: 4, color: '--cyan', startHour: 22, endHour: 6 },
    { name: 'Noche 2', value: 5, color: '--cyan', startHour: 22, endHour: 6 },
    { name: 'Descanso 1', value: 6, color: '--green', startHour: 0, endHour: 24 },
    { name: 'Descanso 2', value: 7, color: '--green', startHour: 0, endHour: 24 }
];

const baseTurns = [
    { name: 'Tarde', startHour: 14, endHour: 22, color: '--red' },
    { name: 'Mañana', startHour: 6, endHour: 14, color: '--yellow' },
    { name: 'Noche', startHour: 22, endHour: 6, color: '--cyan' },
    { name: 'Descanso', startHour: 0, endHour: 24, color: '--green' }
]

const calendar = document.getElementById('calendar');
const selectTurn = document.getElementById('selectTurn');
const searchBtn = document.getElementById('searchBtn');
const resultLabel = document.getElementById('resultLabel');
const monthLabel = document.getElementById('monthLabel');
const yearLabel = document.getElementById('yearLabel');
const imgContainer = document.getElementById('img-container');

let settedDate = new Date();
let locale = 'es-CO';
let monthFormatter,
    dayFormatter,
    dayNames,
    selectedDate,
    selectedTurn;

window.onload = () => {
    setLocaleDateFormat();
    buildCalendarHeader();
    buildCalendarBody(new Date().getMonth(), new Date().getFullYear());
    buildOptions();
    buildTags();
    setLabel(monthLabel, monthFormatter.format());
    setLabel(yearLabel, new Date().getFullYear());
    setTurnsInMonth(new Date().getMonth(), new Date().getFullYear(), 0);
    searchBtn.disabled = true;
}

function onChangeDate(ev) {
    selectedDate = new Date(ev.target.value + "T00:00");
    searchBtn.disabled = false;
}

function onChangeTurn(ev) {
    let selectedTurn = ev.target.value;
    setTurnsInMonth(settedDate.getMonth(), settedDate.getFullYear(), selectedTurn);
}

function searchWorkTurnByDate() {
    if (!selectedDate) return;
    let selectedTurn = selectTurn.options[selectTurn.selectedIndex].value;
    let workTurn = getWorkTurn(selectedTurn, selectedDate);
    setWorkTurnImg(workTurn.value);
    setLabel(resultLabel, workTurn.name);
}

function setLocaleDateFormat() {
    monthFormatter = new Intl.DateTimeFormat(locale, { month: "long" });
    dayFormatter = new Intl.DateTimeFormat(locale, { weekday: "long" });
    dayNames = [...Array(7)].map((_, i) => dayFormatter.format(new Date().setDate(i + 2)));
}

function buildOptions() {
    for (const turn of turns) {
        let option = new Option(turn.name, turn.value);
        selectTurn.add(option, undefined);
    }

    selectTurn.options[0].selected = true;
}

function buildTags() {
    let container = document.getElementById('tags');
    for (const turn of baseTurns) {
        let row = document.createElement("span");
        let text = document.createTextNode(`${turn.name} ${turn.startHour}-${turn.endHour}`);
        let color = getComputedStyle(document.documentElement).getPropertyValue(turn.color);
        row.appendChild(text);
        row.style.backgroundColor = color;
        container.appendChild(row);
    }
}

function getDiffDays(initialDate, endDate) {
    const diffTime = Math.abs(endDate - initialDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function getWorkTurn(turnId, inputDate) {
    let startDate = new Date().setHours(0, 0, 0, 0);
    let diffDays = getDiffDays(startDate, inputDate);

    turnId = parseInt(turnId);
    let indexTurn;

    if (inputDate >= startDate) {
        indexTurn = (diffDays - (turns.length - turnId)) % turns.length;
        indexTurn = indexTurn < 0 ? turns.length + indexTurn : indexTurn; // avoid error when search on first sequence
    } else {
        indexTurn = Math.abs((diffDays - ((turns.length * 80) + turnId)) % turns.length); // search on past dates
    }

    return turns[indexTurn];
}

function buildCalendarBody(month, year) {
    if (calendar.tBodies.length > 0) {
        calendar.tBodies[0].remove();
    }

    let day = 1;
    let firstDay = new Date(year, month, 1).getDay();
    let daysInMonth = 32 - (new Date(year, month, 32).getDate());
    let daysInPrevMonth = 32 - (new Date(year, month - 1, 32).getDate());

    let tbody = calendar.createTBody();

    for (let i = 0; i < 6; i++) {
        let row = tbody.insertRow();

        for (let j = 0; j < dayNames.length; j++) {
            let th = row.insertCell();
            let text = document.createTextNode(0);

            if (day <= firstDay) {
                text.nodeValue = daysInPrevMonth - firstDay + day;
                th.classList.add('text-gray');

            } else if (day > firstDay && (day - firstDay) <= daysInMonth) {
                text.nodeValue = day - firstDay;

            } else {
                text.nodeValue = day - firstDay - daysInMonth;
                th.classList.add('text-gray');
            }

            th.appendChild(text);
            day++;
        }
    }
}

function buildCalendarHeader() {
    let thead = calendar.createTHead();
    let tr = thead.insertRow();

    for (const day of dayNames) {
        let text = document.createTextNode(day.slice(0, 3).toLocaleUpperCase());
        let th = document.createElement("th");
        tr.appendChild(th)
        th.appendChild(text);
    }
}

function changeMonth(quantity) {
    let month = settedDate.getMonth() + quantity;
    let year = settedDate.getFullYear();

    if (month > 11) {
        month = 0;
        year++;
    } else if (month < 0) {
        month = 11;
        year--;
    }

    let monthName = monthFormatter.format(settedDate.setMonth(month));

    if (year !== settedDate.getFullYear()) {
        settedDate.setFullYear(year);
        setLabel(yearLabel, year);
    }

    setLabel(monthLabel, monthName);
    buildCalendarBody(month, year);

    let selectedTurn = selectTurn.options[selectTurn.selectedIndex].value;
    setTurnsInMonth(month, year, selectedTurn);
}

function setTurnsInMonth(month, year, selectedTurn) {
    let tBody = calendar.tBodies[0];

    for (let i = 0; i < tBody.childNodes.length; i++) {
        const row = tBody.childNodes[i];

        for (let j = 0; j < row.childNodes.length; j++) {
            const cell = row.childNodes[j];
            let myDate = new Date(year, month, cell.textContent);

            let workTurn = getWorkTurn(selectedTurn, myDate);
            let color = getComputedStyle(document.documentElement).getPropertyValue(workTurn.color);

            cell.style.backgroundColor = color;
            cell.addEventListener('click', () => {
                setWorkTurnImg(workTurn.value);
                setLabel(resultLabel, workTurn.name);
            });
        }
    }
}

function setLabel(label, text) {
    let textNode = document.createTextNode(text);
    if (label.hasChildNodes()) label.firstChild.remove();
    label.appendChild(textNode);
}

function setWorkTurnImg(workTurn) {
    let img = document.createElement('img');
    let basePath = 'assets/img';
    let imgName;

    switch (workTurn) {
        case 0: case 1: imgName = 'afternoon-phase.svg'; break;
        case 2: case 3: imgName = 'morning-phase.svg'; break;
        case 4: case 5: imgName = 'night-phase.svg'; break;
        default: imgName = 'all-day.svg'; break;
    }

    img.alt = imgName;
    img.src = `${basePath}/${imgName}`;

    if (imgContainer.hasChildNodes()) imgContainer.firstChild.remove();
    imgContainer.appendChild(img);
}