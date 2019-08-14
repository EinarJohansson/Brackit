var aUris = new Array();
var aNames = new Array();
var aIMG = new Array();

function search() {
  const input = $("#search-field");
  if (input.val()) {
    $(".form-group p").show();
    getArtists(input.val());
  } else {
    $(".form-group p").hide();
  }
}

function getArtists(input) {
  $.ajax({
    url: 'https://api.spotify.com/v1/search',
    headers: { 'Authorization': 'Bearer ' + Access_token },
    data: {
      q: input,
      type: 'artist',
      limit: '5'
    },
    success: (response) => {
      // Check how many artists that show up
      nArtists = response.artists.items.length;

      // If no result: show error message
      if (nArtists == 0) {
        // Hide past results
        $(".form-group p").hide();

        $('#errormsg').show();
      }
      else {
        $('#errormsg').hide();

        // hide all previous <p>
        for (let i = 0; i < 5; i++) {
          artist = document.getElementById('artist' + i);
          artist.innerHTML == ""
          artist.style.display = "none";
        }
      }

      $(response.artists.items).each((index, value) => {
        $.ajax({
          url: 'https://api.spotify.com/v1/artists/' + value.id + '/top-tracks',
          headers: { 'Authorization': 'Bearer ' + Access_token },
          data: {
            id: value.id,
            country: 'US'
          },
          success: (response) => {
            // Check if the artist has a minimum of eight songs
            n = response.tracks.length;
            if (n >= 8) {
              $('#artist' + index).show();
              $('#artist' + index).text(value.name);
              aUris[index] = value.id;
              aNames[index] = value.name;
              aIMG[index] = value.images[2];
            }
          }
        });
      });
    }
  });
}