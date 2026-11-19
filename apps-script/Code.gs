/**
 * AFOGRADE 360+ Mentorship Series — Production Google Apps Script Web App
 * Implements PRD v1.1 Sections 8, 9, 10, 11, 12 & 18.
 *
 * Required Script Property (Project Settings -> Script Properties):
 *   TURNSTILE_SECRET_KEY = <Cloudflare Turnstile Secret Key>
 *   RECOVERY_PEPPER      = <Random 32+ char server secret for hashing keys>
 */

var TZ = "Africa/Lagos";
var MAX_BODY_BYTES = 16384;
var DUPLICATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes (PRD Section 11.3)
// Used when the Settings sheet has no REGISTRATION_DEADLINE_ISO row.
var DEFAULT_REGISTRATION_DEADLINE_ISO = "2026-11-22T23:59:00+01:00";

var ALLOWED_STATES_NG = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara"
];

function doGet(e) {
  var corr = Utilities.getUuid().slice(0, 8);
  try {
    var action = e && e.parameter ? String(e.parameter.action || "") : "";
    if (action !== "config") {
      return jsonResponse_({ ok: false, code: "VALIDATION", message: "Unsupported GET action." });
    }

    var cfg = readValidatedSettings_();
    if (!cfg.valid) {
      logSafeError_("doGet:config", "CONFIG_INVALID", corr);
      return jsonResponse_({
        ok: false,
        code: "CONFIG_INVALID",
        message: "Registration configuration is temporarily unavailable."
      });
    }

    return jsonResponse_({
      ok: true,
      data: {
        configVersion: cfg.configVersion,
        serverTimeIso: Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd'T'HH:mm:ssXXX"),
        registrationState: cfg.registrationState,
        stateMessage: cfg.stateMessage,
        openingDateLabel: cfg.openingDateLabel,
        closingDateLabel: cfg.closingDateLabel,
        programmePeriodLabel: cfg.programmePeriodLabel,
        allowInternationalCandidates: cfg.allowInternational,
        plans: cfg.plans,
        trackRecord: readTrackRecordSheets_(),
        socialLinks: cfg.socialLinks
      }
    });
  } catch (err) {
    logSafeError_("doGet:exception", "SERVER_ERROR", corr);
    return jsonResponse_({
      ok: false,
      code: "SERVER_ERROR",
      message: "Unexpected server error while loading configuration."
    });
  }
}

function doPost(e) {
  var corr = Utilities.getUuid().slice(0, 8);
  try {
    if (!e || !e.postData || typeof e.postData.contents !== "string") {
      return jsonResponse_({ ok: false, code: "VALIDATION", message: "Missing request body." });
    }
    if (e.postData.contents.length > MAX_BODY_BYTES) {
      return jsonResponse_({ ok: false, code: "VALIDATION", message: "Request payload exceeds size limit." });
    }

    var body = JSON.parse(e.postData.contents);
    var action = String(body.action || "");

    if (action === "status") {
      return handleStatusRecovery_(body, corr);
    }
    if (action === "register") {
      return handleRegister_(body, corr);
    }

    return jsonResponse_({ ok: false, code: "VALIDATION", message: "Unsupported action." });
  } catch (err) {
    logSafeError_("doPost:exception", "SERVER_ERROR", corr);
    return jsonResponse_({
      ok: false,
      code: "SERVER_ERROR",
      message: "Unexpected server error. Your submission key can be used to check status safely."
    });
  }
}

function handleRegister_(body, corr) {
  var submissionKey = String(body.submissionKey || "").trim();
  var payloadHash = String(body.payloadHash || "").trim();

  if (!/^sub_[a-zA-Z0-9-]{16,64}$/.test(submissionKey) || !/^[a-f0-9]{64}$/i.test(payloadHash)) {
    return jsonResponse_({
      ok: false,
      code: "VALIDATION",
      message: "Invalid submission key or payload signature."
    });
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var keyHash = sha256Hex_(submissionKey);

  // Step 2 (PRD 9.4): Pre-lock idempotency check — return original result even if closed!
  var existingReplay = findIdempotentRecord_(ss, keyHash, payloadHash);
  if (existingReplay.mismatch) {
    return jsonResponse_({
      ok: false,
      code: "VALIDATION",
      message: "Submission key cannot be reused with modified registration details."
    });
  }
  if (existingReplay.found) {
    return jsonResponse_({
      ok: true,
      idempotentReplay: true,
      data: existingReplay.record
    });
  }

  // Step 3: Validate server configuration & state
  var cfg = readValidatedSettings_();
  if (!cfg.valid) {
    logSafeError_("register:config", "CONFIG_INVALID", corr);
    return jsonResponse_({
      ok: false,
      code: "CONFIG_INVALID",
      message: "Online registration is temporarily paused due to a configuration check."
    });
  }

  if (cfg.registrationState !== "OPEN") {
    return jsonResponse_({
      ok: false,
      code: cfg.registrationState,
      message: cfg.stateMessage || "Online registration is not currently open."
    });
  }

  // Step 4: Honeypot & Turnstile Siteverify
  if (String(body.honeypot || "").trim() !== "") {
    return jsonResponse_({ ok: false, code: "VALIDATION", message: "Request rejected." });
  }

  if (!checkBestEffortThrottle_(keyHash)) {
    return jsonResponse_({
      ok: false,
      code: "RATE_LIMITED",
      message: "Too many rapid attempts. Please wait 30 seconds and try again."
    });
  }

  var turnstileOk = verifyTurnstileToken_(String(body.turnstileToken || ""));
  if (!turnstileOk) {
    return jsonResponse_({
      ok: false,
      code: "TURNSTILE_FAILED",
      message: "Security challenge expired or failed. Please complete the challenge again."
    });
  }

  // Step 5 & 6: Server-side field & plan validation
  var validated = validateStudentFields_(body.student, cfg);
  if (!validated.ok) {
    return jsonResponse_({
      ok: false,
      code: validated.code || "VALIDATION",
      message: validated.message,
      fieldErrors: validated.fieldErrors
    });
  }

  // Step 7: Acquire ScriptLock and re-verify idempotency + duplicate window inside lock
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(12000)) {
    logSafeError_("register:lock", "BUSY", corr);
    return jsonResponse_({
      ok: false,
      code: "BUSY",
      message: "High registration volume right now. Please tap retry—your submission key is preserved."
    });
  }

  try {
    var insideLockReplay = findIdempotentRecord_(ss, keyHash, payloadHash);
    if (insideLockReplay.mismatch) {
      return jsonResponse_({
        ok: false,
        code: "VALIDATION",
        message: "Submission key cannot be reused with modified details."
      });
    }
    if (insideLockReplay.found) {
      return jsonResponse_({
        ok: true,
        idempotentReplay: true,
        data: insideLockReplay.record
      });
    }

    var phonePlanFingerprint = sha256Hex_(
      validated.student.whatsappCanonical + "|" + validated.plan.id
    );

    if (!body.confirmDuplicateRecent && hasRecentDuplicate_(ss, phonePlanFingerprint)) {
      return jsonResponse_({
        ok: false,
        code: "DUPLICATE_RECENT",
        message: "A registration for this WhatsApp number and plan was recorded within the last 10 minutes. Confirm only if you intend to create a separate registration."
      });
    }

    // Step 8: Allocate unique, never-reused Registration ID and write row
    var regSheet = ss.getSheetByName("Registrations");
    var metaSheet = ss.getSheetByName("_SystemMeta");
    if (!regSheet || !metaSheet) {
      logSafeError_("register:sheets", "CONFIG_INVALID", corr);
      return jsonResponse_({
        ok: false,
        code: "CONFIG_INVALID",
        message: "Registration workbook tabs are not initialised."
      });
    }

    var registrationId = allocateUniqueRegistrationId_(regSheet);
    var now = new Date();
    var lagosTimestamp = Utilities.formatDate(now, TZ, "yyyy-MM-dd HH:mm:ss");
    var recoveryToken = "rec_" + Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, "");
    var recoveryTokenHash = sha256Hex_(recoveryToken);
    var utm = sanitizeUtmObject_(body.utm);

    var rowValues = [
      sanitizeSheetCell_(registrationId),
      sanitizeSheetCell_(lagosTimestamp),
      sanitizeSheetCell_(validated.student.fullName),
      sanitizeSheetCell_(validated.student.whatsappCanonical),
      sanitizeSheetCell_(validated.student.telegramUsername),
      sanitizeSheetCell_(validated.student.email),
      sanitizeSheetCell_(validated.student.stateOfResidence),
      sanitizeSheetCell_(validated.student.schoolName),
      sanitizeSheetCell_(validated.student.subjectsLabel),
      sanitizeSheetCell_(validated.plan.name),
      validated.plan.months,
      sanitizeSheetCell_(validated.plan.startCycleLabel),
      sanitizeSheetCell_(validated.plan.accessEndLabel),
      validated.plan.totalAmountNgn,
      "Pending",
      "No",
      "",
      "Not Granted",
      sanitizeSheetCell_(utm.utm_source),
      sanitizeSheetCell_(utm.utm_medium),
      sanitizeSheetCell_(utm.utm_campaign),
      sanitizeSheetCell_(utm.utm_content),
      sanitizeSheetCell_(utm.utm_term),
      "",
      ""
    ];

    regSheet.appendRow(rowValues);
    SpreadsheetApp.flush();

    // Confirm written row exists (PRD 9.4 step 8 & 9)
    var lastRow = regSheet.getLastRow();
    var writtenId = String(regSheet.getRange(lastRow, 1).getValue());
    if (writtenId !== registrationId) {
      logSafeError_("register:verifyWrite", "SERVER_ERROR", corr);
      return jsonResponse_({
        ok: false,
        code: "SERVER_ERROR",
        message: "Could not verify registration record write. Please check status before retrying."
      });
    }

    var firstName = validated.student.fullName.split(" ")[0] || "Candidate";
    metaSheet.appendRow([
      keyHash,
      payloadHash,
      registrationId,
      recoveryTokenHash,
      phonePlanFingerprint,
      now.getTime(),
      firstName
    ]);
    SpreadsheetApp.flush();

    return jsonResponse_({
      ok: true,
      data: {
        registrationId: registrationId,
        firstName: firstName,
        planId: validated.plan.id,
        planName: validated.plan.name,
        months: validated.plan.months,
        coveredCyclesLabel: validated.plan.coveredCyclesLabel,
        accessEndLabel: validated.plan.accessEndLabel,
        expectedAmountNgn: validated.plan.totalAmountNgn,
        recordedAtLagos: lagosTimestamp,
        recoveryToken: recoveryToken,
        bankDetails: cfg.bankDetails
      }
    });
  } finally {
    lock.releaseLock();
  }
}

function handleStatusRecovery_(body, corr) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var cfg = readValidatedSettings_();
  var metaSheet = ss.getSheetByName("_SystemMeta");
  var regSheet = ss.getSheetByName("Registrations");

  if (!metaSheet || !regSheet || !cfg.valid) {
    return jsonResponse_({
      ok: false,
      code: "CONFIG_INVALID",
      message: "Status recovery is temporarily unavailable."
    });
  }

  var submissionKey = String(body.submissionKey || "").trim();
  var recoveryToken = String(body.recoveryToken || "").trim();
  var registrationId = String(body.registrationId || "").trim().toUpperCase();

  var keyHash = submissionKey ? sha256Hex_(submissionKey) : "";
  var tokenHash = recoveryToken ? sha256Hex_(recoveryToken) : "";

  var metaRows = metaSheet.getLastRow() > 1
    ? metaSheet.getRange(2, 1, metaSheet.getLastRow() - 1, 7).getValues()
    : [];

  var matchedRegId = "";
  for (var i = metaRows.length - 1; i >= 0; i--) {
    var row = metaRows[i];
    if (keyHash && row[0] === keyHash) {
      matchedRegId = String(row[2]);
      break;
    }
    if (tokenHash && row[3] === tokenHash && (!registrationId || String(row[2]) === registrationId)) {
      matchedRegId = String(row[2]);
      break;
    }
  }

  if (!matchedRegId) {
    return jsonResponse_({
      ok: false,
      code: "RECOVERY_NOT_FOUND",
      message: "Could not verify that session credential on this browser. Please contact AFOGRADE on WhatsApp with your Registration ID for assistance."
    });
  }

  var record = lookupRegistrationById_(regSheet, matchedRegId, cfg);
  if (!record) {
    logSafeError_("status:lookup", "SERVER_ERROR", corr);
    return jsonResponse_({
      ok: false,
      code: "RECOVERY_NOT_FOUND",
      message: "Registration record could not be loaded."
    });
  }

  return jsonResponse_({ ok: true, data: record });
}

function allocateUniqueRegistrationId_(regSheet) {
  var props = PropertiesService.getScriptProperties();
  var propCounter = parseInt(props.getProperty("LAST_REG_SEQ") || "0", 10);
  if (isNaN(propCounter) || propCounter < 0) {
    propCounter = 0;
  }

  var maxInSheet = 0;
  var existingSet = {};
  var lastRow = regSheet.getLastRow();
  if (lastRow > 1) {
    var ids = regSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      var val = String(ids[i][0] || "").trim();
      if (val) {
        existingSet[val] = true;
        var m = /^AFO-2027-(\d+)$/.exec(val);
        if (m) {
          var n = parseInt(m[1], 10);
          if (n > maxInSheet) maxInSheet = n;
        }
      }
    }
  }

  var nextNum = Math.max(propCounter, maxInSheet) + 1;
  var candidate = formatRegId_(nextNum);
  while (existingSet[candidate]) {
    nextNum++;
    candidate = formatRegId_(nextNum);
  }

  props.setProperty("LAST_REG_SEQ", String(nextNum));
  return candidate;
}

function formatRegId_(n) {
  var padded = ("00000" + String(n)).slice(-Math.max(5, String(n).length));
  return "AFO-2027-" + padded;
}

function verifyTurnstileToken_(token) {
  var secret = PropertiesService.getScriptProperties().getProperty("TURNSTILE_SECRET_KEY");
  if (!secret) {
    // Fail closed in production if Turnstile secret has not been configured!
    return false;
  }
  if (secret === "SKIP_FOR_DEV" || secret === "skip") {
    return true;
  }
  if (!token || token.length < 10 || token.length > 2048) {
    return false;
  }

  var resp = UrlFetchApp.fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "post",
    payload: {
      secret: secret,
      response: token
    },
    muteHttpExceptions: true
  });

  if (resp.getResponseCode() !== 200) return false;
  var result = JSON.parse(resp.getContentText());
  return Boolean(result && result.success === true);
}

function validateStudentFields_(raw, cfg) {
  if (!raw || typeof raw !== "object") {
    return { ok: false, message: "Missing student details." };
  }

  var fieldErrors = {};
  var fullName = String(raw.fullName || "").replace(/\s+/g, " ").trim();
  if (fullName.length < 2 || fullName.length > 80 || /[<>0-9]/.test(fullName)) {
    fieldErrors.fullName = "Enter a valid full name (2–80 characters).";
  }

  var whatsapp = String(raw.whatsappCanonical || "").trim();
  var validNg = /^\+234[789][01]\d{8}$/.test(whatsapp);
  var validIntl = cfg.allowInternational && /^\+[1-9]\d{6,14}$/.test(whatsapp);
  if (!validNg && !validIntl) {
    fieldErrors.whatsappNumber = "Enter a valid WhatsApp phone number.";
  }

  var telegram = String(raw.telegramUsername || "").trim();
  if (telegram.indexOf("@") === 0) telegram = telegram.slice(1);
  if (telegram && !/^[a-zA-Z0-9_]{5,32}$/.test(telegram)) {
    fieldErrors.telegramUsername = "Telegram username must be 5–32 valid characters.";
  }

  var email = String(raw.email || "").trim().toLowerCase();
  if (email && (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(email))) {
    fieldErrors.email = "Enter a valid email address.";
  }

  var state = String(raw.stateOfResidence || "").trim();
  var allowedStates = cfg.allowInternational
    ? ALLOWED_STATES_NG.concat(["Outside Nigeria"])
    : ALLOWED_STATES_NG;
  if (allowedStates.indexOf(state) === -1) {
    fieldErrors.stateOfResidence = "Select an eligible state of residence.";
  }

  var school = String(raw.schoolName || "").trim();
  if (school.length > 100 || /[<>]/.test(school) || /^[=+@\-]/.test(school)) {
    fieldErrors.schoolName = "School name must be 100 characters or fewer and cannot contain formulas or special symbols.";
  }

  var subjectsLabel = String(raw.subjectsLabel || "").trim();
  var allowedElectives = {
    "Mathematics": true, "Biology": true, "Chemistry": true, "Physics": true,
    "CRS/IRS": true, "Literature in English": true, "Economics": true, "Government": true, "Financial Accounting": true
  };
  var subjParts = subjectsLabel.split(",").map(function(s) { return s.trim(); }).filter(Boolean);
  var seenElectives = {};
  var validElectiveCount = 0;
  for (var sIdx = 1; sIdx < subjParts.length; sIdx++) {
    var el = subjParts[sIdx];
    if (allowedElectives[el] && !seenElectives[el]) {
      seenElectives[el] = true;
      validElectiveCount++;
    }
  }
  if (subjParts.length !== 4 || subjParts[0] !== "Use of English" || validElectiveCount !== 3) {
    fieldErrors.electiveSubjects = "Select Use of English plus 3 distinct subjects.";
  }

  var planId = String(raw.planId || "").trim();
  var matchedPlan = null;
  for (var i = 0; i < cfg.plans.length; i++) {
    if (cfg.plans[i].id === planId && cfg.plans[i].available) {
      matchedPlan = cfg.plans[i];
      break;
    }
  }
  if (!matchedPlan) {
    return {
      ok: false,
      code: "PLAN_UNAVAILABLE",
      message: "The selected plan is no longer available. Please select an available plan.",
      fieldErrors: { planId: "Please choose an available plan." }
    };
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      code: "VALIDATION",
      message: "Please correct the highlighted fields.",
      fieldErrors: fieldErrors
    };
  }

  return {
    ok: true,
    student: {
      fullName: fullName,
      whatsappCanonical: whatsapp,
      telegramUsername: telegram,
      email: email,
      stateOfResidence: state,
      schoolName: school,
      subjectsLabel: subjectsLabel
    },
    plan: matchedPlan
  };
}

function readValidatedSettings_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Settings");
  if (!sheet || sheet.getLastRow() < 2) return { valid: false };

  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  var map = {};
  for (var i = 0; i < rows.length; i++) {
    var k = String(rows[i][0] || "").trim();
    if (k) map[k] = String(rows[i][1] || "").trim();
  }

  var regState = map.REGISTRATION_STATE;
  if (["NOT_OPEN", "OPEN", "PAUSED", "CLOSED"].indexOf(regState) === -1) {
    return { valid: false };
  }

  // Automatic close at the registration deadline. To reopen or extend, put
  // the new date in REGISTRATION_DEADLINE_ISO on the Settings sheet (no
  // redeploy needed), e.g. 2026-11-29T23:59:00+01:00.
  var deadlineIso = map.REGISTRATION_DEADLINE_ISO || DEFAULT_REGISTRATION_DEADLINE_ISO;
  var deadlineMs = Date.parse(deadlineIso);
  var closedByDeadline = regState === "OPEN" && !isNaN(deadlineMs) && Date.now() >= deadlineMs;
  if (closedByDeadline) {
    regState = "CLOSED";
  }

  var monthlyPrice = parseInt(map.MONTHLY_PRICE_NGN || "0", 10);
  if (isNaN(monthlyPrice) || monthlyPrice <= 0) return { valid: false };

  var accountNum = map.BANK_ACCOUNT_NUMBER || "";
  if (!/^\d{10}$/.test(accountNum) || !map.BANK_NAME || !map.BANK_ACCOUNT_NAME) {
    return { valid: false };
  }

  var nowMs = new Date().getTime();
  var cutoffs = [
    Date.parse(map.CYCLE_1_CUTOFF_ISO || ""),
    Date.parse(map.CYCLE_2_CUTOFF_ISO || ""),
    Date.parse(map.CYCLE_3_CUTOFF_ISO || ""),
    Date.parse(map.CYCLE_4_CUTOFF_ISO || "")
  ];

  // Determine earliest open cycle (1..4)
  var startCycleIdx = -1;
  for (var c = 0; c < 4; c++) {
    if (!isNaN(cutoffs[c]) && nowMs <= cutoffs[c]) {
      startCycleIdx = c; // 0-indexed -> Cycle (c + 1)
      break;
    }
  }

  var maxAvailableMonths = startCycleIdx === -1 ? 0 : (4 - startCycleIdx);
  var endLabels = [
    map.CYCLE_1_END_LABEL || "End of Cycle 1",
    map.CYCLE_2_END_LABEL || "End of Cycle 2",
    map.CYCLE_3_END_LABEL || "End of Cycle 3",
    String(map.CYCLE_4_END_LABEL || "31 March 2027").replace(/\s*\([Cc]onfirm\s*P0\)/i, "").trim()
  ];

  var plans = [];
  // The 1-month plan was withdrawn: plans now start at 2 months.
  for (var m = 2; m <= 4; m++) {
    var isAvail = m <= maxAvailableMonths;
    var startNum = startCycleIdx === -1 ? 1 : (startCycleIdx + 1);
    var endCycleIndex = Math.min(3, startNum - 1 + m - 1);
    plans.push({
      id: "plan-" + m + "m",
      name: m === 4 ? "4-Month Full Series Plan" : (m + "-Month Plan"),
      months: m,
      monthlyPriceNgn: monthlyPrice,
      totalAmountNgn: monthlyPrice * m,
      startCycleLabel: "Cycle " + startNum,
      coveredCyclesLabel: m === 1
        ? ("Cycle " + startNum)
        : ("Cycles " + startNum + "–" + (startNum + m - 1)),
      accessEndLabel: endLabels[endCycleIndex],
      available: isAvail,
      badge: m === 4 ? "Most Recommended" : undefined
    });
  }

  return {
    valid: true,
    configVersion: map.CONFIG_VERSION || "1.0.0",
    registrationState: regState,
    stateMessage: closedByDeadline
      ? "Online registration has closed. If AFOGRADE announces an extension, the form will reopen on the website."
      : (map.STATE_MESSAGE || ""),
    openingDateLabel: map.OPENING_DATE_LABEL || "",
    closingDateLabel: map.CLOSING_DATE_LABEL || "",
    programmePeriodLabel: String(map.PROGRAMME_PERIOD_LABEL || "30 November 2026 – 31 March 2027").replace(/\s*\([Cc]onfirm\s*P0\)/i, "").trim(),
    allowInternational: map.ALLOW_INTERNATIONAL === "TRUE",
    plans: plans,
    socialLinks: {
      facebookPage: map.SOCIAL_FACEBOOK_PAGE || "",
      facebookCommunity: map.SOCIAL_FACEBOOK_COMMUNITY || "",
      instagram: map.SOCIAL_INSTAGRAM || "",
      whatsappChannel: map.SOCIAL_WHATSAPP_CHANNEL || "",
      whatsappChannel2: map.SOCIAL_WHATSAPP_CHANNEL_2 || "",
      tiktok: map.SOCIAL_TIKTOK || "",
      telegram: map.SOCIAL_TELEGRAM || "",
      xTwitter: map.SOCIAL_X_TWITTER || ""
    },
    bankDetails: {
      bankName: map.BANK_NAME,
      accountName: map.BANK_ACCOUNT_NAME,
      accountNumber: accountNum
    }
  };
}

function readTrackRecordSheets_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var out = { scores: [], testimonials: [], gallery: [] };

  var scoresSheet = ss.getSheetByName("Scores");
  if (scoresSheet && scoresSheet.getLastRow() > 1) {
    var sRows = scoresSheet.getRange(2, 1, scoresSheet.getLastRow() - 1, 4).getValues();
    for (var i = 0; i < sRows.length; i++) {
      var scoreVal = Number(sRows[i][0]);
      var approved = sRows[i][3] === true || String(sRows[i][3]).toUpperCase() === "TRUE";
      if (approved && !isNaN(scoreVal) && scoreVal > 0 && scoreVal <= 400) {
        out.scores.push({
          id: "score-row-" + (i + 2),
          score: scoreVal,
          examYear: String(sRows[i][1] || "2026").trim(),
          note: String(sRows[i][2] || "").trim(),
          approved: true
        });
      }
    }
  }

  var testSheet = ss.getSheetByName("Testimonials");
  if (testSheet && testSheet.getLastRow() > 1) {
    var maxCols = Math.max(7, testSheet.getLastColumn());
    var tRows = testSheet.getRange(2, 1, testSheet.getLastRow() - 1, maxCols).getValues();
    var headers = testSheet.getRange(1, 1, 1, maxCols).getValues()[0].map(function(h) {
      return String(h || "").toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_");
    });

    function findCol_(nameMatches, fallbackIdx) {
      for (var m = 0; m < nameMatches.length; m++) {
        for (var c = 0; c < headers.length; c++) {
          if (headers[c].indexOf(nameMatches[m]) !== -1) return c;
        }
      }
      return fallbackIdx;
    }

    var idxName = findCol_(["display_name", "student_name", "name"], 0);
    var idxScore = findCol_(["utme_score", "score"], -1);
    var idxYear = findCol_(["utme_year", "exam_year", "year"], -1);
    var idxUni = findCol_(["university", "institution"], -1);
    var idxCourse = findCol_(["course_of_study", "course"], -1);
    var idxInst = findCol_(["institution_and_course"], 1);
    var idxPhoto = findCol_(["student_photo_url", "photo", "image"], 3);
    var idxReview = findCol_(["review_text", "quote", "review"], 2);
    var idxShot = findCol_(["feedback_screenshot", "screenshot"], 4);
    var idxConsent = findCol_(["consent_verified", "consent"], 5);
    var idxApproved = findCol_(["approved_to_publish", "approved"], 6);

    for (var t = 0; t < tRows.length; t++) {
      var row = tRows[t];
      var tConsent = idxConsent >= 0 ? (row[idxConsent] === true || String(row[idxConsent]).toUpperCase() === "TRUE") : true;
      var tApproved = idxApproved >= 0 ? (row[idxApproved] === true || String(row[idxApproved]).toUpperCase() === "TRUE") : true;
      var tName = String(row[idxName] || "").trim();
      var tScore = idxScore >= 0 && !isNaN(Number(row[idxScore])) && Number(row[idxScore]) > 0 ? Number(row[idxScore]) : undefined;
      var tYear = idxYear >= 0 ? String(row[idxYear] || "").trim() : "";
      var tUni = idxUni >= 0 ? String(row[idxUni] || "").trim() : "";
      var tCourse = idxCourse >= 0 ? String(row[idxCourse] || "").trim() : "";
      var tInst = idxInst >= 0 ? String(row[idxInst] || "").trim() : "";
      if (!tInst && (tUni || tCourse)) {
        tInst = tCourse && tUni ? (tCourse + " — " + tUni) : (tUni || tCourse);
      }
      var tReview = idxReview >= 0 ? String(row[idxReview] || "").trim() : "";
      var tPhoto = idxPhoto >= 0 ? String(row[idxPhoto] || "").trim() : "";
      var tShot = idxShot >= 0 ? String(row[idxShot] || "").trim() : "";

      if (tConsent && tApproved && tName) {
        out.testimonials.push({
          id: "scholar-row-" + (t + 2),
          displayName: tName,
          score: tScore,
          examYear: tYear || "2026",
          university: tUni,
          course: tCourse,
          institutionAndCourse: tInst,
          reviewText: tReview,
          photoUrl: tPhoto,
          feedbackScreenshotUrl: tShot,
          consentVerified: true,
          approved: true
        });
      }
    }
  }

  var galSheet = ss.getSheetByName("Gallery");
  if (galSheet && galSheet.getLastRow() > 1) {
    var gRows = galSheet.getRange(2, 1, galSheet.getLastRow() - 1, 6).getValues();
    for (var g = 0; g < gRows.length; g++) {
      var gConsent = gRows[g][4] === true || String(gRows[g][4]).toUpperCase() === "TRUE";
      var gApproved = gRows[g][5] === true || String(gRows[g][5]).toUpperCase() === "TRUE";
      var gTitle = String(gRows[g][0] || "").trim();
      var gUrl = String(gRows[g][2] || "").trim();
      if (gConsent && gApproved && gTitle && gUrl) {
        out.gallery.push({
          id: "gal-row-" + (g + 2),
          title: gTitle,
          category: String(gRows[g][1] || "Achievement").trim(),
          imageUrl: gUrl,
          caption: String(gRows[g][3] || "").trim(),
          consentVerified: true,
          approved: true
        });
      }
    }
  }

  return out;
}

function findIdempotentRecord_(ss, keyHash, payloadHash) {
  var metaSheet = ss.getSheetByName("_SystemMeta");
  var regSheet = ss.getSheetByName("Registrations");
  if (!metaSheet || !regSheet || metaSheet.getLastRow() < 2) {
    return { found: false, mismatch: false };
  }

  var rows = metaSheet.getRange(2, 1, metaSheet.getLastRow() - 1, 7).getValues();
  for (var i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i][0]) === keyHash) {
      if (String(rows[i][1]) !== payloadHash) {
        return { found: false, mismatch: true };
      }
      var cfg = readValidatedSettings_();
      var record = lookupRegistrationById_(regSheet, String(rows[i][2]), cfg);
      if (record) {
        return { found: true, mismatch: false, record: record };
      }
    }
  }
  return { found: false, mismatch: false };
}

function hasRecentDuplicate_(ss, phonePlanFingerprint) {
  var metaSheet = ss.getSheetByName("_SystemMeta");
  if (!metaSheet || metaSheet.getLastRow() < 2) return false;
  var nowMs = new Date().getTime();
  var rows = metaSheet.getRange(2, 5, metaSheet.getLastRow() - 1, 2).getValues();
  for (var i = rows.length - 1; i >= 0; i--) {
    var createdMs = Number(rows[i][1] || 0);
    if (nowMs - createdMs > DUPLICATE_WINDOW_MS) break;
    if (String(rows[i][0]) === phonePlanFingerprint) return true;
  }
  return false;
}

function lookupRegistrationById_(regSheet, regId, cfg) {
  if (regSheet.getLastRow() < 2) return null;
  var rows = regSheet.getRange(2, 1, regSheet.getLastRow() - 1, 14).getValues();
  for (var i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i][0]) === regId) {
      var fullName = String(rows[i][2] || "Candidate");
      var months = Number(rows[i][10]) || 1;
      return {
        registrationId: regId,
        firstName: fullName.split(" ")[0] || "Candidate",
        planId: "plan-" + months + "m",
        planName: String(rows[i][9]),
        months: months,
        coveredCyclesLabel: String(rows[i][11]),
        accessEndLabel: String(rows[i][12]),
        expectedAmountNgn: Number(rows[i][13]),
        recordedAtLagos: String(rows[i][1]),
        bankDetails: cfg.bankDetails
      };
    }
  }
  return null;
}

function checkBestEffortThrottle_(keyHash) {
  try {
    var cache = CacheService.getScriptCache();
    var cacheKey = "thr_" + keyHash.slice(0, 24);
    var count = parseInt(cache.get(cacheKey) || "0", 10);
    if (count >= 6) return false;
    cache.put(cacheKey, String(count + 1), 60);
    return true;
  } catch (e) {
    return true;
  }
}

/**
 * Neutralizes CSV / Spreadsheet formula injection (CWE-1236).
 * Any cell value starting with '=', '+', '-', '@', tab, or newline will be
 * prefixed with a single quote "'" to force Google Sheets to store it strictly
 * as inert plain text, preventing malicious formula execution when opened.
 */
function sanitizeSheetCell_(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "number" || typeof val === "boolean") return val;
  var str = String(val).trim();
  if (/^[=+@\-\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
}

function sanitizeUtmObject_(raw) {
  var out = { utm_source: "", utm_medium: "", utm_campaign: "", utm_content: "", utm_term: "" };
  if (!raw || typeof raw !== "object") return out;
  var keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    var cleaned = String(raw[k] || "").replace(/[<>="'\u0000-\u001F]/g, "").trim().slice(0, 100);
    while (/^[=+@\-]/.test(cleaned)) {
      cleaned = cleaned.slice(1).trim();
    }
    out[k] = cleaned;
  }
  return out;
}

function sha256Hex_(input) {
  var pepper = PropertiesService.getScriptProperties().getProperty("RECOVERY_PEPPER") || "afograde-default-pepper";
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    pepper + ":" + input,
    Utilities.Charset.UTF_8
  );
  var hex = "";
  for (var i = 0; i < digest.length; i++) {
    var byteVal = (digest[i] + 256) % 256;
    hex += ("0" + byteVal.toString(16)).slice(-2);
  }
  return hex;
}

function logSafeError_(stage, code, corr) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var errSheet = ss.getSheetByName("Errors");
    if (errSheet) {
      var ts = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd HH:mm:ss");
      errSheet.appendRow([ts, stage, code, corr]);
    }
  } catch (e) {
    // Do not throw from error logger
  }
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

