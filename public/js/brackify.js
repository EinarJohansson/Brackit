function brackify(round0, round1, round2, winner) {    
    $(".bracket").show();

    document.getElementsByTagName('iframe')[0].src = winner.uri;

    var table = [];
    // Create 4 tables
    for (let i = 0; i < 4; i++) {
        table[i] = document.createElement("table");
        table[i].setAttribute("class", "table");

        var row = document.createElement("tr");

        if (i == 0)
            createBracket(1, i);
        else if (i == 1)
            createBracket(2, i);
        else if (i == 2)
            createBracket(4, i);
        else if (i == 3)
            createBracket(8, i);
    }

    // This function creates and inserts all information inside one row
    function createBracket(cols, i) {
        var bracket = document.getElementsByClassName("bracket")[1];
        var tbl = document.getElementsByClassName("table-responsive")[0];

        for (let j = 0; j < cols; j++) {
            var col = document.createElement("td");
            var infobox = document.createElement("div");
            var img = document.createElement("img");
            var trackName = document.createElement("span");
            var albumName = document.createElement("span");

            infobox.setAttribute("class", "infobox");
            infobox.style.overflow = "hidden";
            col.setAttribute("class", "contestor");
            // do not truncate the winners information
            if(i != 0) {
                trackName.setAttribute("class", "d-inline-block text-truncate");
                albumName.setAttribute("class", "d-inline-block text-truncate");
            }
            trackName.style.margin = "0px";
            albumName.style.margin = "0px";
            trackName.style.fontWeight = "bold";
            albumName.style.color = "#494949";

            // winner
            if (i == 0) {
                img.src = winner.coverM;
                trackName.innerHTML = winner.track;
                albumName.innerHTML = winner.album;
            }
            // round 2
            else if (i == 1) {
                img.src = round2[j].coverS;
                trackName.innerHTML = round2[j].track;
                albumName.innerHTML = round2[j].album;
            }
            // round 1
            else if (i == 2) {
                img.src = round1[j].coverS;
                trackName.innerHTML = round1[j].track;
                albumName.innerHTML = round1[j].album;
            }
            // round 0
            else if (i == 3 && window.innerWidth > 800) { 
                // Only show if window size is greater than 800px, otherwise the page gets too crowded
                img.src = round0.coverS[j];
                trackName.innerHTML = round0.track[j];
                albumName.innerHTML = round0.album[j];
            }
            else {
                // if i == 3 but window size is smaller than 800px, then return
                return;
            }
            
            col.appendChild(img);
            infobox.appendChild(trackName);
            infobox.appendChild(document.createElement("br"));
            infobox.appendChild(albumName);
            col.appendChild(infobox);
            row.appendChild(col);
        }
        table[i].appendChild(row);
        tbl.appendChild(table[i]);
        bracket.appendChild(tbl);
    }
}

function pushBracket(r0, r1, r2, w) {
    $(".Mobilevote").hide();
    $(".Desktopvote").hide();

    $(".container").hide();
    $(".bracket").show();

    var bracket = {
        artist: artistName,
        pfp: artistIMG,
        round0: r0,
        round1: r1,
        round2: r2,
        winner: w
    }

    $.ajax({
        type: "POST",
        url: "https://letsbrackit.herokuapp.com/authenticated/create",
        data: JSON.stringify(bracket),
        contentType: 'application/json',
        success: function (response) {
            const objectID = response;
            var url = "https://letsbrackit.herokuapp.com/?id=" + objectID
            window.location.replace(url);
        },
        error: function () {
            window.location.replace('https://letsbrackit.herokuapp.com');
        }
    });
}

function getBracket(id) {
    $.ajax({
        url: 'https://letsbrackit.herokuapp.com/bracket/?id=' + id,
        type: "GET",
        success: (response) => {            
            brackify(response.bracket.round0, response.bracket.round1, response.bracket.round2, response.bracket.winner);
            document.getElementsByTagName('iframe')[1].src = response.favourite.uri;
            document.getElementById('data').href = "/data?artist=" + response.bracket.artist
        },
        error: function (response) {
            // Display error message on screen
            error = document.createElement("h1");
            error.innerHTML = response.status + ": Can't find the requested bracket";
            document.body.appendChild(error);
        }
    });
}