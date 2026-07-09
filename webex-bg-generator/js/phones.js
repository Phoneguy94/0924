/**
 * Webex Custom Wallpaper / Logo — Device Spec Table
 * Source: Cisco "Custom wallpaper and logo for 9800/8875 (Control Hub)"
 * https://help.webex.com/en-us/article/nq1xuwo/
 *
 * This is the single source of truth for dimensions, file size caps,
 * and whether a device supports the logo overlay. Everything else in
 * the app reads from this table — don't hardcode sizes elsewhere.
 */

const DEVICES = [
  {
    id: "9851",
    label: "Desk Phone 9851",
    tag: "DP-9851",
    wallpaper: { w: 480, h: 240 },
    thumbnail: { w: 100, h: 56 },
    logo: { w: 190, h: 125 },
    maxFileSizeKB: 250,
    maxImages: 10,
    logoHiddenOnMultiline: true,
    frame: "desk-wide"
  },
  {
    id: "9861",
    label: "Desk Phone 9861",
    tag: "DP-9861",
    wallpaper: { w: 800, h: 480 },
    thumbnail: { w: 150, h: 90 },
    logo: { w: 380, h: 250 },
    maxFileSizeKB: 1000,
    maxImages: 20,
    logoHiddenOnMultiline: true,
    frame: "desk-wide"
  },
  {
    id: "9871",
    label: "Desk Phone 9871",
    tag: "DP-9871",
    wallpaper: { w: 1280, h: 720 },
    thumbnail: { w: 228, h: 128 },
    logo: { w: 494, h: 325 },
    maxFileSizeKB: 1000,
    maxImages: 20,
    logoHiddenOnMultiline: false,
    frame: "desk-large"
  },
  {
    id: "8875",
    label: "Video Phone 8875",
    tag: "VP-8875",
    wallpaper: { w: 1024, h: 600 },
    thumbnail: { w: 180, h: 100 },
    logo: { w: 380, h: 250 },
    maxFileSizeKB: 1000,
    maxImages: 20,
    logoHiddenOnMultiline: false,
    frame: "video"
  },
  {
    id: "kem",
    label: "9800 Key Expansion Module",
    tag: "KEM",
    wallpaper: { w: 480, h: 800 },
    thumbnail: null,
    logo: null,
    maxFileSizeKB: 1000,
    maxImages: 20,
    logoHiddenOnMultiline: false,
    frame: "kem",
    note: "Wallpaper only — inherits phone's theme, no separate logo or thumbnail."
  }
];

// Multi-line note applies to these three models per Cisco docs:
// "When multiple lines are configured on Cisco Desk Phone 9841, 9851,
//  and 9861, the logo and the logo setting in the menu are unavailable."
const MULTILINE_LOGO_NOTE =
  "Logo is unavailable on this model when multiple lines are configured.";
