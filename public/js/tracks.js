tUris = new Array();
tName = new Array();

aName = new Array();
aCoverS = new Array();
aCoverM = new Array();

var artistName;
var artistIMG;

function getTracks(id) {
    $("#loggedin").hide();

    if ($(window).width() > 500)
        $(".Desktopvote").show();
    else
        $(".Mobilevote").show();

    document.getElementById("counter").style.visibility = "visible";
    $("#counter").show();

    var aUri = aUris[id];
    artistName = aNames[id];
    artistIMG = aIMG[id];

    $.ajax({
        url: 'https://api.spotify.com/v1/artists/' + aUri + '/top-tracks',
        headers: { 'Authorization': 'Bearer ' + Access_token },
        data: {
            id: aUri,
            country: 'US'
        },
        success: (response) => {
            $(response.tracks).each((index, value) => {
                tUris[index] = value.uri;
                tName[index] = value.name;

                aName[index] = value.album.name;

                aCoverS[index] = value.album.images[2].url;
                aCoverM[index] = value.album.images[1].url;
            });
            embed(0);
        }
    });
}

function embed(i) {
    const embed0 = "https://open.spotify.com/embed?uri=" + tUris[i] + "&view=coverart";
    const embed1 = "https://open.spotify.com/embed?uri=" + tUris[i + 1] + "&view=coverart";

    document.getElementById('song0').src = embed0;
    document.getElementById('song1').src = embed1;
}

function embedRound(i, round) {
    const embed0 = round[i].uri;
    const embed1 = round[i + 1].uri;

    document.getElementById('song0').src = embed0;
    document.getElementById('song1').src = embed1;
}