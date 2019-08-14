var round1 = new Array();
var round2 = new Array();

function vote(choice) {
    var indexes = [2, 4, 6];
    var myIndexes = [0, 2, 4, 6];

    var temp = document.getElementById("counter").innerHTML;
    var currentCounter = parseInt(temp.charAt(6));

    var newCounter = "Round " + (currentCounter + 1) + "/8";

    document.getElementById("counter").innerHTML = newCounter;

    currentCounter -= 1;

    var myindex = myIndexes[currentCounter];

    var tname = (choice == 0) ? tName[myindex] : tName[myindex + 1];
    var aname = (choice == 0) ? aName[myindex] : aName[myindex + 1];
    var covers = (choice == 0) ? aCoverS[myindex] : aCoverS[myindex + 1];
    var coverm = (choice == 0) ? aCoverM[myindex] : aCoverM[myindex + 1];

    if (currentCounter < 4) {
        var pick = {
            uri: document.getElementById("song" + choice).src,
            track: tname,
            album: aname,
            coverS: covers,
            coverM: coverm
        }

        round1[currentCounter] = pick;
        if (currentCounter < 3) {
            var index = indexes[currentCounter];
            embed(index);
        }
        else if (currentCounter == 3) {
            embedRound(0, round1);
        }
    }
    else if (currentCounter >= 4 && currentCounter < 6) {
        switch (currentCounter) {
            case 4:
                var newpick;
                for (let i = 0; i < round1.length; i++) {
                    if (round1[i].uri == document.getElementById("song" + choice).src) {
                        newpick = round1[i];
                    }
                }
                var pick = {
                    uri: newpick.uri,
                    track: newpick.track,
                    album: newpick.album,
                    coverS: newpick.coverS,
                    coverM: newpick.coverM
                }
                round2[0] = pick;
                embedRound(2, round1);
                break;
            case 5:
                var newpick;
                for (let i = 0; i < round1.length; i++) {
                    if (round1[i].uri == document.getElementById("song" + choice).src) {
                        newpick = round1[i];
                    }
                }
                var pick = {
                    uri: newpick.uri,
                    track: newpick.track,
                    album: newpick.album,
                    coverS: newpick.coverS,
                    coverM: newpick.coverM
                }
                round2[1] = pick;
                embedRound(0, round2);
                break;
        }
    }
    else if (currentCounter == 6) {
        var newpick;
        for (let i = 0; i < round2.length; i++) {
            if (round2[i].uri == document.getElementById("song" + choice).src) {
                newpick = round2[i];
            }
        }

        var pick = {
            uri: newpick.uri,
            track: newpick.track,
            album: newpick.album,
            coverS: newpick.coverS,
            coverM: newpick.coverM
        }

        for (let i = 0; i < tUris.length; i++) {
            tUris[i] = "https://open.spotify.com/embed?uri=" + tUris[i] + "&view=coverart";
        }
        var round0 = {
            coverS: aCoverS,
            coverM: aCoverM,
            uri: tUris,
            track: tName,
            album: aName
        }

        pushBracket(round0, round1, round2, pick);
    }
}