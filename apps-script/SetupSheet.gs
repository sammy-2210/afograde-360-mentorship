/**
 * Workbook Provisioning & Column Protection Script (PRD Section 10)
 * Run `setupAfogradeWorkbook()` once from the Apps Script editor bound to the official Sheet.
 */

var TAB_REGISTRATIONS = "Registrations";
var TAB_SETTINGS = "Settings";
var TAB_SCORES = "Scores";
var TAB_TESTIMONIALS = "Testimonials";
var TAB_GALLERY = "Gallery";
var TAB_ERRORS = "Errors";
var TAB_IDEMPOTENCY = "_SystemMeta";

var REGISTRATION_HEADERS = [
  "Registration ID",      // 1 - Script
  "Date and Time",        // 2 - Script (Africa/Lagos)
  "Full Name",            // 3 - Script
  "WhatsApp Number",      // 4 - Script
  "Telegram Username",    // 5 - Script
  "Email",                // 6 - Script
  "State",                // 7 - Script
  "School",               // 8 - Script
  "UTME Subjects",        // 9 - Script
  "Plan",                 // 10 - Script
  "Months",               // 11 - Script
  "Start Cycle",          // 12 - Script
  "Access End",           // 13 - Script
  "Expected Amount",      // 14 - Script
  "Payment Status",       // 15 - Script sets Pending; Staff updates
  "Proof Received",       // 16 - Script sets No; Staff updates
  "Verification Date",    // 17 - Staff
  "Access Status",        // 18 - Script sets Not Granted; Staff updates
  "UTM Source",           // 19 - Script
  "UTM Medium",           // 20 - Script
  "UTM Campaign",         // 21 - Script
  "UTM Content",          // 22 - Script
  "UTM Term",             // 23 - Script
  "Updated By",           // 24 - Staff
  "Notes"                 // 25 - Staff
];

function setupAfogradeWorkbook() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Registrations Tab (25 columns)
  var regSheet = ensureSheet_(ss, TAB_REGISTRATIONS);
  regSheet.getRange(1, 1, 1, REGISTRATION_HEADERS.length).setValues([REGISTRATION_HEADERS]);
  regSheet.setFrozenRows(1);
  regSheet.getRange(1, 1, 1, REGISTRATION_HEADERS.length).setFontWeight("bold");

  // Dropdown validations for staff workflow columns (15, 16, 18)
  var maxRows = Math.max(regSheet.getMaxRows() - 1, 1000);
  var paymentRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Pending", "Paid", "Amount Mismatch", "Rejected"], true)
    .setAllowInvalid(false)
    .build();
  var proofRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["No", "Yes"], true)
    .setAllowInvalid(false)
    .build();
  var accessRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Not Granted", "Granted"], true)
    .setAllowInvalid(false)
    .build();

  regSheet.getRange(2, 15, maxRows, 1).setDataValidation(paymentRule);
  regSheet.getRange(2, 16, maxRows, 1).setDataValidation(proofRule);
  regSheet.getRange(2, 18, maxRows, 1).setDataValidation(accessRule);

  // Protect script-owned columns (1..14 and 19..23) from accidental staff edits
  applyScriptColumnProtection_(regSheet, "A:N", "Script-owned registration fields (Cols 1-14)");
  applyScriptColumnProtection_(regSheet, "S:W", "Script-owned UTM attribution fields (Cols 19-23)");

  // 2. Settings Tab
  var settingsSheet = ensureSheet_(ss, TAB_SETTINGS);
  if (settingsSheet.getLastRow() === 0) {
    var defaultSettings = [
      ["Key", "Value", "Notes"],
      ["CONFIG_VERSION", "1.0.0", "Increment whenever plan/cycle settings change"],
      ["REGISTRATION_STATE", "NOT_OPEN", "Allowed: NOT_OPEN | OPEN | PAUSED | CLOSED"],
      ["STATE_MESSAGE", "Registration opens once all P0 launch checks are signed off.", "Public banner message when not OPEN"],
      ["OPENING_DATE_LABEL", "9 November 2026 (Provisional)", "Displayed when NOT_OPEN"],
      ["CLOSING_DATE_LABEL", "", "Optional closing date display"],
      ["PROGRAMME_PERIOD_LABEL", "30 November 2026 – 31 March 2027", "Approved programme window"],
      ["MONTHLY_PRICE_NGN", "1500", "Approved monthly fee in Naira"],
      ["ALLOW_INTERNATIONAL", "FALSE", "TRUE only if international candidates are approved"],
      ["BANK_NAME", "Kuda Bank", "Verified official bank name"],
      ["BANK_ACCOUNT_NAME", "AFOGRADE TUTORIALS AND EDUSERVICES", "Verified official account name"],
      ["BANK_ACCOUNT_NUMBER", "3003920115", "Two-person verified official account number"],
      ["CYCLE_1_CUTOFF_ISO", "2026-12-07T23:59:59+01:00", "Last moment to join Cycle 1"],
      ["CYCLE_2_CUTOFF_ISO", "2027-01-07T23:59:59+01:00", "Last moment to join Cycle 2"],
      ["CYCLE_3_CUTOFF_ISO", "2027-02-07T23:59:59+01:00", "Last moment to join Cycle 3"],
      ["CYCLE_4_CUTOFF_ISO", "2027-03-07T23:59:59+01:00", "Last moment to join Cycle 4"],
      ["CYCLE_1_END_LABEL", "End of Cycle 1", "Access end label for Cycle 1"],
      ["CYCLE_2_END_LABEL", "End of Cycle 2", "Access end label for Cycle 2"],
      ["CYCLE_3_END_LABEL", "End of Cycle 3", "Access end label for Cycle 3"],
      ["CYCLE_4_END_LABEL", "31 March 2027", "Access end label for Cycle 4"],
      ["SOCIAL_FACEBOOK_PAGE", "", "Official Facebook Page https:// URL (hidden if blank)"],
      ["SOCIAL_FACEBOOK_COMMUNITY", "", "Official Facebook Community https:// URL (hidden if blank)"],
      ["SOCIAL_INSTAGRAM", "", "Official Instagram https:// URL (hidden if blank)"],
      ["SOCIAL_WHATSAPP_CHANNEL", "", "Official WhatsApp Channel https:// URL (hidden if blank)"],
      ["SOCIAL_WHATSAPP_CHANNEL_2", "", "Official WhatsApp Channel 2 https:// URL (hidden if blank)"],
      ["SOCIAL_TIKTOK", "", "Official TikTok https:// URL (hidden if blank)"],
      ["SOCIAL_TELEGRAM", "", "Official Telegram https:// URL (hidden if blank)"],
      ["SOCIAL_X_TWITTER", "", "Official X (Twitter) https:// URL (hidden if blank)"]
    ];
    settingsSheet.getRange(1, 1, defaultSettings.length, 3).setValues(defaultSettings);
    settingsSheet.setFrozenRows(1);
    settingsSheet.getRange(1, 1, 1, 3).setFontWeight("bold");
  }

  // 3. Staff-Editable Track Record Tabs (No Admin Portal Required!)
  var checkboxRule = SpreadsheetApp.newDataValidation().requireCheckbox().build();

  var scoresSheet = ensureSheet_(ss, TAB_SCORES);
  if (scoresSheet.getLastRow() === 0) {
    var scoreHeaders = ["Score", "Exam Year", "Optional Note", "Approved_To_Publish"];
    scoresSheet.getRange(1, 1, 1, scoreHeaders.length).setValues([scoreHeaders]);
    scoresSheet.setFrozenRows(1);
    scoresSheet.getRange(1, 1, 1, scoreHeaders.length).setFontWeight("bold");
    scoresSheet.getRange(2, 4, 100, 1).setDataValidation(checkboxRule);
  }

  var testSheet = ensureSheet_(ss, TAB_TESTIMONIALS);
  if (testSheet.getLastRow() === 0) {
    var testHeaders = [
      "Student_Name",
      "UTME_Score",
      "UTME_Year",
      "Current_University",
      "Course_Of_Study",
      "Student_Photo_URL (Drive share link or https)",
      "Review_Text (Optional)",
      "Consent_Verified",
      "Approved_To_Publish"
    ];
    testSheet.getRange(1, 1, 1, testHeaders.length).setValues([testHeaders]);
    testSheet.setFrozenRows(1);
    testSheet.getRange(1, 1, 1, testHeaders.length).setFontWeight("bold");

    testSheet.getRange(2, 8, 200, 2).setDataValidation(checkboxRule);
  }

  var galSheet = ensureSheet_(ss, TAB_GALLERY);
  if (galSheet.getLastRow() === 0) {
    galSheet.getRange(1, 1, 1, 6).setValues([[
      "Title",
      "Category",
      "Image_URL (Google Drive share link or https)",
      "Caption",
      "Consent_Verified",
      "Approved_To_Publish"
    ]]);
    galSheet.setFrozenRows(1);
    galSheet.getRange(1, 1, 1, 6).setFontWeight("bold");
    var catRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["UTME Result", "Student Testimonial", "WhatsApp Feedback", "Admission Success", "Achievement"], true)
      .setAllowInvalid(false)
      .build();
    galSheet.getRange(2, 2, 200, 1).setDataValidation(catRule);
    galSheet.getRange(2, 5, 200, 2).setDataValidation(checkboxRule);
  }

  // 4. Privacy-Safe Errors Tab (No PII, tokens, or submission keys!)
  var errSheet = ensureSheet_(ss, TAB_ERRORS);
  if (errSheet.getLastRow() === 0) {
    errSheet.getRange(1, 1, 1, 4).setValues([["Timestamp (Africa/Lagos)", "Stage", "Error Code", "Correlation Ref"]]);
    errSheet.setFrozenRows(1);
    errSheet.getRange(1, 1, 1, 4).setFontWeight("bold");
  }

  // 4. Hidden Idempotency & Recovery Hash Metadata Tab (Owner-protected)
  var metaSheet = ensureSheet_(ss, TAB_IDEMPOTENCY);
  if (metaSheet.getLastRow() === 0) {
    metaSheet.getRange(1, 1, 1, 7).setValues([[
      "Submission Key Hash",
      "Payload Hash",
      "Registration ID",
      "Recovery Token Hash",
      "Phone+Plan Fingerprint",
      "Created Epoch Ms",
      "First Name"
    ]]);
    metaSheet.setFrozenRows(1);
  }
  metaSheet.hideSheet();
  applyScriptColumnProtection_(metaSheet, "A:G", "System idempotency metadata (do not edit)");
}

function ensureSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function applyScriptColumnProtection_(sheet, a1Range, description) {
  try {
    var protection = sheet.getRange(a1Range).protect().setDescription(description);
    var me = Session.getEffectiveUser();
    if (me && me.getEmail()) {
      protection.addEditor(me);
      var editors = protection.getEditors();
      for (var i = 0; i < editors.length; i++) {
        var ed = editors[i];
        if (ed.getEmail() !== me.getEmail()) {
          protection.removeEditor(ed);
        }
      }
    }
    if (protection.canDomainEdit()) {
      protection.setDomainEdit(false);
    }
  } catch (err) {
    Logger.log("Note on column protection for " + a1Range + ": " + err);
  }
}


/**
 * One-click utility function for staff to wipe any placeholder mock data from
 * the Scores, Testimonials, and Gallery sheets in the active Google Sheet,
 * preserving clean header columns ready for verified entries.
 */
function clearAllMockDataFromSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var scoresSheet = ss.getSheetByName(TAB_SCORES);
  if (scoresSheet && scoresSheet.getLastRow() > 1) {
    scoresSheet.getRange(2, 1, scoresSheet.getLastRow() - 1, scoresSheet.getLastColumn()).clearContent();
  }

  var testSheet = ss.getSheetByName(TAB_TESTIMONIALS);
  if (testSheet && testSheet.getLastRow() > 1) {
    testSheet.getRange(2, 1, testSheet.getLastRow() - 1, testSheet.getLastColumn()).clearContent();
  }

  var galSheet = ss.getSheetByName(TAB_GALLERY);
  if (galSheet && galSheet.getLastRow() > 1) {
    galSheet.getRange(2, 1, galSheet.getLastRow() - 1, galSheet.getLastColumn()).clearContent();
  }
}

/**
 * One-click utility function to reset the registration sequence back to 1 (AFO-2027-00001).
 *
 * This function:
 * 1. Resets the internal counter property (LAST_REG_SEQ) to "0".
 * 2. Wipes test registration rows from the "Registrations" sheet (preserving header row 1).
 * 3. Wipes test session metadata from "_SystemMeta" (preserving header row 1).
 * 4. Wipes test logs from "Errors" (preserving header row 1).
 *
 * After running this, the very next candidate registration will be assigned AFO-2027-00001.
 */
function resetRegistrationsAndStartFromOne() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Reset the counter stored in Apps Script Properties
  var props = PropertiesService.getScriptProperties();
  props.setProperty("LAST_REG_SEQ", "0");

  // 2. Clear test rows from Registrations sheet (keep headers in row 1)
  var regSheet = ss.getSheetByName(TAB_REGISTRATIONS);
  if (regSheet && regSheet.getLastRow() > 1) {
    regSheet.deleteRows(2, regSheet.getLastRow() - 1);
  }

  // 3. Clear test rows from _SystemMeta (keep headers in row 1)
  var metaSheet = ss.getSheetByName(TAB_IDEMPOTENCY);
  if (metaSheet && metaSheet.getLastRow() > 1) {
    metaSheet.deleteRows(2, metaSheet.getLastRow() - 1);
  }

  // 4. Clear test rows from Errors sheet (keep headers in row 1)
  var errSheet = ss.getSheetByName(TAB_ERRORS);
  if (errSheet && errSheet.getLastRow() > 1) {
    errSheet.deleteRows(2, errSheet.getLastRow() - 1);
  }

  Logger.log("Successfully reset registration counter to 0 and cleared all test rows. Next Registration ID will be AFO-2027-00001.");
}
