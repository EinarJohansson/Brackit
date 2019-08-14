var Access_token, Refresh_token;
$(document).ready(() => {
  // Get tokens from the server 
  $.ajax({
    url: 'http://brackit.se/authenticated/tokens',
    type: "GET",
    success: (response) => {
      Access_token = response.access_token;
      Refresh_token = response.refresh_token;
    },
    error: function (response) {
      // Display error message on screen
      error = document.createElement("h1");
      error.innerHTML = response.status + ": Not authorized";
      document.body.appendChild(error);
    }
  });
});
