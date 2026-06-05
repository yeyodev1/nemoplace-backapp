const axios = require("axios");
async function test() {
  try {
    const response = await axios.get("https://graph.facebook.com/v22.0/oauth/access_token", {
      params: {
        grant_type: "fb_exchange_token",
        client_id: "1465122391696717",
        client_secret: "fff549713dadc13ff813bca9f549db55",
        fb_exchange_token: "EAAU0hWO1pU0BRhjKrST4k64xhoeeq6g67w5DXuFat0ayY0X6omvT0PcBqkBYTOPkOxZA1zptweYROH4ZARB1tMHcytkXQdwomWQY3a3QeljiK3KIlSbCZAg3150zF2EvHYZATryhfytZAbJBY6lipQkiMTm6uGU0CU264PQYzlDMP3oczz3l0o9s9owZBPn5QAym9MGWqYNVDzWowRRBvqmlQhbQuDRqdTpI5gGO4QszGoIssKUIgZB3KPA8FyTM1TsCg6YEqbZBrgYZD",
      },
    });
    console.log("Success:", response.data);
  } catch (error) {
    console.log("Error from FB:", error.response.data);
  }
}
test();
