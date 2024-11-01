const CHAT_WEBHOOK_URL = 'https://chat.googleapis.com/v1/spaces/AAAAWPBf07k/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=Vh_4Mzh5vKXUX-6gKb6b4C3Q6ZmSQD9qGDZl1Fkovp4'; // Replace with your Google Chat webhook URL

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index').setTitle('Location Selector');
}

function getLocations() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Locations"); // Adjust the sheet name
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues(); // Only get the name and address columns
  return data.map((row, index) => ({
    name: row[1],          // Location Name
    id: index + 2          // Row number in the sheet, adjust for header row
  }));
}

function sendRouteLink(selectedNames) {
  // Generate a Google Maps route link based on selected names
  const routeLink = `https://www.google.com/maps/dir/${selectedNames.map(encodeURIComponent).join('/')}`;

  // Send the link to Google Chat
  const payload = JSON.stringify({ text: `Here’s your route: ${routeLink}` });
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: payload,
  };

  UrlFetchApp.fetch(CHAT_WEBHOOK_URL, options);
  return routeLink; // Return the link for confirmation
}





// Generate Google Maps route link based on selected locations in Google Sheets
function generateRouteLink() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Locations");
  const data = sheet.getDataRange().getValues();
  const selectedLocations = [];

  // Loop through each row to collect selected locations
  data.slice(1).forEach(row => {
    if (row[0] === true) { // Assuming column A has the checkboxes for selection
      selectedLocations.push(encodeURIComponent(row[2])); // Address in column C
    }
  });

  if (selectedLocations.length < 2) {
    Logger.log("Select at least two stops.");
    return;
  }

  // Generate Google Maps route link
  const routeLink = `https://www.google.com/maps/dir/${selectedLocations.join('/')}`;
  Logger.log(`Generated Route Link: ${routeLink}`);
  return routeLink;
}

