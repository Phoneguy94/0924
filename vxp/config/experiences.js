window.VXP_CONFIG = {
  version: "0.1.0",
  platformName: "Veytec Experience Platform",
  baseUrl: "https://phoneguy94.github.io/0924",
  airtable: {
    baseId: "appSxuH0GH10rxd5y",
    tableId: "tblI7llQH93Xkin3O",
    token: "patYsJQ4hhojOhYuk.a0839f88a7ae231ce3bf1db6816c451efd8cc6dc7a313a99d4216dc1e557336e",
    returnFieldsByFieldId: true,
    maxWallEntries: 30,
    refreshMs: 30000
  },
  webexConnect: {
    captureWebhookUrl: "https://hooks.us.webexconnect.io/events/X6LYS4HP7U"
  },
  fields: {
    qr: "fld2Ehe0YS7e6W6jm",
    mlb: "fldvQvP6xGTCpB71A",
    nbaCard: "fldUDkaG8rZwL4Dk4",
    flgisa: "fldptFIDcWfVutGRP",
    webexOne1: "fld7W7JS6XPIZLoMp",
    webexOne2: "fld6ejAJTGpRuztwp",
    webexOne3: "fldJ4mNylPdtD8u14",
    usa2501: "fldjLx8XrIxda4FcV",
    usa2502: "fldoj4Im2cUcxua5D",
    usa2503: "fld2p2xcD1atuV7CM"
  },
  defaults: {
    capture: {
      outWidth: 768,
      outHeight: 1024,
      jpegQuality: 0.7,
      idleTimeoutMs: 45000,
      defaultMode: "front"
    },
    wall: {
      rotateMs: 10000,
      masterEventMs: 20000
    }
  },
  experiences: {
    usa250: {
      id: "usa250",
      aliases: ["usa250", "usa", "america250", "july4", "fourth"],
      label: "USA250",
      cameraTitle: "USA250 Photo Kiosk",
      cameraSubtitle: "Choose a camera or upload a photo",
      readyMessage: "Sent! Tap below to view your USA250 photo 🇺🇸",
      photoTitle: "Your USA250 Photo",
      waitingMessage: "Creating your USA250 image. This page will update automatically.",
      wallTitle: "USA250 Wall",
      accent: "#B23A48",
      backgroundImage: "https://phoneguy94.github.io/0924/VXP/assets/backgrounds/usa250.png",
      source: "USA250v2",
      demoType: "usa250",
      eventName: "Kiosk-USA250",
      layout: "multi",
      fields: ["fldjLx8XrIxda4FcV", "fldoj4Im2cUcxua5D", "fld2p2xcD1atuV7CM"],
      captions: ["America 250", "Liberty Celebration", "Hometown Parade"]
    },
    mlb: {
      id: "mlb",
      aliases: ["mlb", "baseball", "pirates", "pittsburgh"],
      label: "MLB",
      cameraTitle: "Baseball Photo Kiosk",
      cameraSubtitle: "Take your baseball demo photo",
      readyMessage: "Sent! Tap below to view your baseball photo ⚾",
      photoTitle: "Your Baseball Photo",
      waitingMessage: "Creating your baseball image. This page will update automatically.",
      wallTitle: "MLB Wall",
      accent: "#2E86DE",
      backgroundImage: "https://phoneguy94.github.io/0924/VXP/assets/backgrounds/mlb.png",
      source: "VXP-MLB",
      demoType: "mlb",
      eventName: "Kiosk-MLB",
      layout: "single",
      fields: ["fldvQvP6xGTCpB71A"],
      captions: ["Game Day"]
    },
    nba: {
      id: "nba",
      aliases: ["nba", "basketball", "magic", "orlando"],
      label: "NBA",
      cameraTitle: "Basketball Photo Kiosk",
      cameraSubtitle: "Take your basketball demo photo",
      readyMessage: "Sent! Tap below to view your basketball photo 🏀",
      photoTitle: "Your Basketball Photo",
      waitingMessage: "Creating your basketball image. This page will update automatically.",
      wallTitle: "NBA Wall",
      accent: "#C8102E",
      backgroundImage: "https://phoneguy94.github.io/0924/VXP/assets/backgrounds/nba.png",
      source: "VXP-NBA",
      demoType: "nba",
      eventName: "Kiosk-NBA",
      layout: "single",
      fields: ["fldUDkaG8rZwL4Dk4"],
      captions: ["All-Star"]
    },
    flgisa: {
      id: "flgisa",
      aliases: ["flgisa", "florida", "gisa"],
      label: "FLGISA Florida Hero",
      cameraTitle: "Florida Hero Photo Kiosk",
      cameraSubtitle: "Take your Florida hero demo photo",
      readyMessage: "Sent! Tap below to view your Florida hero photo 🐊",
      photoTitle: "Your Florida Hero Photo",
      waitingMessage: "Creating your Florida hero image. This page will update automatically.",
      wallTitle: "FLGISA Wall",
      accent: "#2ECC71",
      backgroundImage: "https://phoneguy94.github.io/0924/VXP/assets/backgrounds/flgisa.png",
      source: "VXP-FLGISA",
      demoType: "flgisa",
      eventName: "Kiosk-FLGISA",
      layout: "single",
      fields: ["fldptFIDcWfVutGRP"],
      captions: ["Florida Hero"]
    },
    webexone: {
      id: "webexone",
      aliases: ["webexone", "webex", "austin"],
      label: "WebexOne Austin 2026",
      cameraTitle: "WebexOne Photo Kiosk",
      cameraSubtitle: "Take your WebexOne demo photo",
      readyMessage: "Sent! Tap below to view your WebexOne photos ✨",
      photoTitle: "Your WebexOne Photos",
      waitingMessage: "Creating your WebexOne images. This page will update automatically.",
      wallTitle: "WebexOne Wall",
      accent: "#FFD400",
      backgroundImage: "https://phoneguy94.github.io/0924/VXP/assets/backgrounds/webexone.png",
      source: "VXP-WebexOne",
      demoType: "webexone",
      eventName: "Kiosk-WebexOne",
      layout: "webex3",
      fields: ["fld7W7JS6XPIZLoMp", "fld6ejAJTGpRuztwp", "fldJ4mNylPdtD8u14"],
      captions: ["Drone Show Activated", "DJ Set In-Progress", "Showtime"]
    }
  }
};
