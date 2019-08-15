var response;
var tableRows = [];
var containerRows = [];

$(document).ready(() => {
    $.ajax({
        url: 'https://letsbrackit.herokuapp.com/data/statistics',
        type: "GET",
        success: (res) => {
            var tableBody = document.getElementsByTagName('tbody')[0];
            
            response = res;

            for (i = 0; i < response.length; i++) {
                var tableRow = document.createElement('tr'); // Main row
                var containerRow = document.createElement('tr'); // Dropdown row

                tableRow.setAttribute('onclick', "display(this)");

                containerRow.style.display = 'none';

                tableBody.appendChild(tableRow);
                tableBody.appendChild(containerRow);

                tableRows[i] = tableRow;
                containerRows[i] = containerRow;
            }
            // Create and insert all rows
            createRows();
            // Then search for artist in searchfield
            searchTable();
        },
        error: function (res) {
            // Display error message on screen
            error = document.createElement("h1");
            error.innerHTML = res.status + " error";
            document.body.appendChild(error);
        }
    });
});

function createRows() {
    for (i = 0; i < response.length; i++) {
        if (tableRows[i].children.length != 3) {
            // Create 3 table header cells for each row
            var artist = document.createElement('td');
            var brackets = document.createElement('td');
            var date = document.createElement('td');
            var containerParent = document.createElement('td');
            var container = document.createElement('div');
            var row = document.createElement('div');
            var col1 = document.createElement('div');
            var col2 = document.createElement('div');
            var col3 = document.createElement('div');
            var pfp = document.createElement('img');
            var canvas1 = document.createElement('canvas');
            var canvas2 = document.createElement('canvas');

            containerParent.colSpan = '3';
            containerParent.style.height = '300px';
            containerParent.style.backgroundColor = '#f9f9fb';

            container.className = 'container';
            row.className = 'row';
            col1.className = 'col-4';
            canvas2.className = 'albumchart';

            if ($(window).width() < 600) {
                col1.className = 'col-6';
                col2.className = 'col-6';
                canvas2.style.display = 'none';
            }
            else {
                col1.className = 'col-4';
                col2.className = 'col-4';
                col3.className = 'col-4';
                canvas2.style.display = '';
            }

            pfp.src = response[i].pfp[0].url;

            var songtmp = [];
            var albumtmp = [];

            var songlabels = [];
            var songoccurences = [];

            var albumlabels = [];
            var albumoccurences = [];

            response[i].winningBrackets.forEach(winner => {
                songtmp.push(winner.track);
                albumtmp.push(winner.album);
            });

            frequencies(songtmp).forEach((val, key) => {
                songoccurences.push(val);
                songlabels.push(key)
            });

            frequencies(albumtmp).forEach((val, key) => {
                albumoccurences.push(val);
                albumlabels.push(key)
            });

            Chart.defaults.global.legend.display = false;
            Chart.defaults.global.maintainAspectRatio = false;

            var songChart = canvas1.getContext('2d');
            myChart1 = new Chart(songChart, {
                type: 'doughnut',
                options: {
                    title: {
                        display: true,
                        text: 'Winning songs'
                    }
                },
                data: {
                    labels: songlabels,
                    datasets: [{
                        data: songoccurences,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)',
                            'rgba(219, 61, 61, 0.6)',
                            'rgba(206, 61, 219, 0.2)',
                            'rgba(61, 208, 219, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(219, 61, 61, 1)',
                            'rgba(206, 61, 219, 1)',
                            'rgba(61, 208, 219, 1)'
                        ],
                        borderWidth: 1
                    }],
                }
            });

            var albumChart = canvas2.getContext('2d');
            myChart2 = new Chart(albumChart, {
                type: 'doughnut',
                options: {
                    title: {
                        display: true,
                        text: 'Winning albums'
                    }
                },
                data: {
                    labels: albumlabels,
                    datasets: [{
                        data: albumoccurences,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }],
                }
            });

            artist.innerHTML = response[i]._id + " <i class='fas fa-caret-right fa-lg'></i>";
            brackets.innerHTML = response[i].nBrackets;
            date.innerHTML = response[i].latest;

            tableRows[i].appendChild(artist);
            tableRows[i].appendChild(brackets);
            tableRows[i].appendChild(date);

            col1.appendChild(pfp);
            col2.appendChild(canvas1);
            col3.appendChild(canvas2);
            row.appendChild(col1);
            row.appendChild(col2);
            row.appendChild(col3);
            container.appendChild(row);
            containerParent.appendChild(container);
            containerRows[i].appendChild(containerParent);

        }
        else {
            tableRows[i].style.display = "";
        }
    }
}

function display(element) {
    var row = element.nextElementSibling;
    var icon = element.firstChild.firstElementChild;

    if (icon.className === "fas fa-caret-right fa-lg") {
        icon.className = "fas fa-caret-down fa-lg";
        row.style.display = ''
    } else {
        icon.className = "fas fa-caret-right fa-lg";
        row.style.display = 'none'
    }
}

function frequencies(arr) {
    return new Map([...new Set(arr)].map(
        x => [x, arr.filter(y => y === x).length]
    ));
}

function sortAlphabetically(header, order) {
    // Clear the sort icon
    resetSort();

    var table, rows, switching, i, x, y, shouldSwitch;

    table = document.getElementsByClassName("table")[0];

    switching = true;
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
        // Start by saying: no switching is done:
        switching = false;
        rows = table.rows;
        /* Loop through all table rows (except the
        first, which contains table headers): */
        for (i = 1; i < rows.length - 2; i += 2) {
            // Start by saying there should be no switching:
            shouldSwitch = false;
            /* Get the two elements you want to compare,
            one from current row and one from the next: */
            x = rows[i].getElementsByTagName("td")[0];
            y = rows[i + 2].getElementsByTagName("td")[0];
            // Check if the two rows should switch place:
            if (order == "descending") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    // If so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            }
            else if (order == "ascending") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    // If so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            /* If a switch has been marked, make the switch
            and mark that a switch has been done: */
            rows[i].parentNode.insertBefore(rows[i + 2], rows[i]);
            rows[i].parentNode.insertBefore(rows[i + 3], rows[i + 1]);
            switching = true;
        }
    }
    // Updating the onclick function so it sorts the other way next time
    if (order == "descending") {
        header.onclick = () => {
            sortAlphabetically(header, "ascending");
        }
        header.innerHTML = "Artist <i style='float: right' class='fas fa-sort-up'>"
    }
    else if (order == "ascending") {
        header.onclick = () => {
            sortAlphabetically(header, "descending");
        }
        header.innerHTML = "Artist <i style='float: right' class='fas fa-sort-down'>"
    }
}

function sortNumerically(header, order) {
    resetSort();
    var table, rows, switching, i, x, y, shouldSwitch;

    table = document.getElementsByClassName("table")[0];

    switching = true;

    while (switching) {
        switching = false;

        rows = table.rows;

        for (i = 1; i < rows.length - 2; i += 2) {

            shouldSwitch = false;

            x = rows[i].getElementsByTagName("td")[1];
            y = rows[i + 2].getElementsByTagName("td")[1];

            if (order == "descending") {
                if (parseInt(x.innerHTML) > parseInt(y.innerHTML)) {
                    shouldSwitch = true;
                    break;
                }
            }
            else if (order == "ascending") {
                if (parseInt(x.innerHTML) < parseInt(y.innerHTML)) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 2], rows[i]);
            rows[i].parentNode.insertBefore(rows[i + 3], rows[i + 1]);
            switching = true;
        }
    }
    if (order == "descending") {
        header.onclick = () => {
            sortNumerically(header, "ascending");
        }
        header.innerHTML = "Brackets <i style='float: right' class='fas fa-sort-down'>"
    }
    else if (order == "ascending") {
        header.onclick = () => {
            sortNumerically(header, "descending");
        }
        header.innerHTML = "Brackets <i style='float: right' class='fas fa-sort-up'>"
    }
}

function sortDate(header, order) {
    resetSort();
    var table, rows, switching, i, x, y, shouldSwitch;

    table = document.getElementsByClassName("table")[0];

    switching = true;

    while (switching) {
        switching = false;
        rows = table.rows;

        for (i = 1; i < rows.length - 2; i += 2) {
            shouldSwitch = false;

            x = rows[i].getElementsByTagName("td")[2];
            y = rows[i + 2].getElementsByTagName("td")[2];

            if (order == "descending") {
                if (new Date(x.innerHTML) > new Date(y.innerHTML)) {
                    shouldSwitch = true;
                    break;
                }
            }
            else if (order == "ascending") {
                if (new Date(x.innerHTML) < new Date(y.innerHTML)) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 2], rows[i]);
            rows[i].parentNode.insertBefore(rows[i + 3], rows[i + 1]);
            switching = true;
        }
    }
    if (order == "descending") {
        header.onclick = () => {
            sortDate(header, "ascending");
        }
        header.innerHTML = "Latest update <i style='float: right' class='fas fa-sort-down'>"
    }
    else if (order == "ascending") {
        header.onclick = () => {
            sortDate(header, "descending");
        }
        header.innerHTML = "Latest update <i style='float: right' class='fas fa-sort-up'>"
    }
}

function resetSort() {
    var headers = document.getElementsByTagName("thead")[0].rows[0].children;
    for (let i = 0; i < headers.length; i++) {
        if (headers[i].children[0]) {
            headers[i].children[0].style.visibility = "hidden";
        }
    }
}

function searchTable() {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementsByTagName("input")[0];
    filter = input.value.toUpperCase();
    table = document.getElementsByTagName("table")[0];
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 1; i < tr.length; i += 2) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}