const CHAT_WEBHOOK_URL = 'https://chat.googleapis.com/v1/spaces/AAAAWPBf07k/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=Vh_4Mzh5vKXUX-6gKb6b4C3Q6ZmSQD9qGDZl1Fkovp4'; // Replace with your Google Chat webhook URL

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index').setTitle('Location Selector');
}

// Get both name and address from the specified Google Sheets tab
function getLocations(tabName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tabName);
  if (!sheet) {
    throw new Error(`Tab "${tabName}" does not exist.`);
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues(); // Columns A (checkbox), B (name), C (address)
  
  return data.map((row, index) => ({
    name: row[1],        // Location Name in Column B
    address: row[2],     // Address in Column C
    id: index + 2        // Row number in the sheet, adjusting for header row
  }));
}


function sendRouteLink(selectedAddresses) {
  // Start from the user's current location using "My Location"
  const startPoint = "My Location";
  
  // Generate a Google Maps route link that starts from "My Location"
  const routeLink = `https://www.google.com/maps/dir/${encodeURIComponent(startPoint)}/${selectedAddresses.map(encodeURIComponent).join('/')}`;

  // Send the link to Google Chat
  const payload = JSON.stringify({ text: `Here’s your route starting from your current location: ${routeLink}` });
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: payload,
  };

  UrlFetchApp.fetch(CHAT_WEBHOOK_URL, options);
  return routeLink; // Return the link for confirmation
}


// Generate route link based on selected locations in Google Sheets
function generateRouteLink() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("All Locations");
  const data = sheet.getDataRange().getValues();
  const selectedLocations = [];

  // Loop through each row to collect selected locations based on the checkbox in Column A
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












/*
// Google Maps API Key
const API_KEY = 'AIzaSyA72qUciyG6M6z9oOX8Ym7G_LDIoLkJ_M0';

// Load HTML interface
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index').setTitle('Route Comparison Tool');
}

// Fetch locations from Google Sheets
function getLocations() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Parse each row into a location object
  const locations = data.slice(1).map(row => ({
    name: row[0],        // Location Name
    address: row[1],     // Address
    id: row[2]           // Location ID
  }));
  return locations;
}

// Calculate route metrics for a given set of stops
function calculateRouteMetrics(stops) {
  const addresses = stops.map(stop => encodeURIComponent(stop.address)).join('|');
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${addresses}&destinations=${addresses}&key=${API_KEY}`;

  const response = UrlFetchApp.fetch(url);
  const data = JSON.parse(response.getContentText());

  // Process distance and duration data
  const routeMetrics = data.rows.map(row => ({
    distance: row.elements[0].distance.text,
    duration: row.elements[0].duration.text
  }));
  return routeMetrics;
}

// Generate Google Maps URL for the route
function generateGoogleMapsLink(stops) {
  const addresses = stops.map(stop => encodeURIComponent(stop.address)).join('/');
  return `https://www.google.com/maps/dir/${addresses}`;
}
*/








/*
// Google Maps API Key
const API_KEY = 'AIzaSyA72qUciyG6M6z9oOX8Ym7G_LDIoLkJ_M0';

// Function to display the web interface
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Route Comparison Tool');
}

// Function to fetch locations from the Google Sheet
function getLocations() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Locations'); // Rename as needed
  const data = sheet.getDataRange().getValues();
  let locations = [];
  for (let i = 1; i < data.length; i++) {
    locations.push({
      name: data[i][0],
      lat: data[i][1],
      lng: data[i][2]
    });
  }
  return locations;
}

// Function to calculate route metrics using Google Maps API
function calculateRouteMetrics(stops) {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${stops[0].lat},${stops[0].lng}&destinations=${stops.map(stop => stop.lat + ',' + stop.lng).join('|')}&key=${API_KEY}`;
  const response = UrlFetchApp.fetch(url);
  return JSON.parse(response.getContentText());
}


*/




























/*
// Airtable API Credentials
const AIRTABLE_API_KEY = 'patkID4TpmJf8iKYX.beeab717583fd0ad7bb353e26ee9d7b9b86e4dacde00bc97a515031d4f9fc460';
const BASE_ID = 'appBBeoemUumWcgXj';
const TABLE_ID = 'tblzpKeKWd3wHoKa9';

// Function to pull data from Airtable and populate the Google Sheet
function pullAirtableData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.clear(); // Clear existing content
  const headersRow = ["Location Name", "Address", "Location ID"];
  sheet.appendRow(headersRow);

  let offset = null;
  let hasMoreRecords = true;

  while (hasMoreRecords) {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?pageSize=100${offset ? `&offset=${offset}` : ''}`;
    const headers = {
      "Authorization": `Bearer ${AIRTABLE_API_KEY}`
    };
    const options = {
      "method": "GET",
      "headers": headers
    };
    
    // Fetch data from Airtable
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());

    // Append records to the sheet
    data.records.forEach(record => {
      const row = [
        record.fields['Location Name'] || '',
        record.fields['Address'] || '',
        record.fields['Location ID'] || ''
      ];
      sheet.appendRow(row);
    });

    // Check for more records
    if (data.offset) {
      offset = data.offset;
    } else {
      hasMoreRecords = false;
    }
  }

  Logger.log("All data pulled from Airtable and populated in the Google Sheet.");
}
*/
