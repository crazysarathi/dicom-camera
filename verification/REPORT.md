# Automated verification report

Base: http://localhost:4173  
Generated: 2026-09-24T08:40:48.964Z

## Summary

| Check | Result |
| --- | --- |
| Horizontal overflow | none across 54 route×viewport combinations |
| Console/page errors | none |
| axe violations (WCAG 2.x A/AA + best-practice) | none |
| Exactly one h1 per page | yes |
| Broken images | none |
| Content still hidden after scrolling (reveal/split) | none |
| Link/destination issues | none |
| Keyboard flows | 10/10 passed |
| Firefox | ran; 0 page errors; overflow desktop 0px / mobile 0px |
| WebKit | not run: Error: browserType.launch: 
╔═════════════════════════════════════════════════════════╗
║ Host system is missing dependencies to run browsers.    ║
║ Please install them with the following command:         ║
║                                                         ║
║     sudo npx playwright install-deps                    ║
║                                                         ║
║ Alternatively, use apt:                                 ║
║     sudo apt-get install libgstreamer-plugins-bad1.0-0\ ║
║         libavif16                                       ║
║                                                         ║
║ <3 Playwright Team                                      ║
╚═════════════════════════════════════════════════════════╝ |

## Details

### overflowIssues

- none

### consoleErrors

- none

### axeViolations

- none

### h1Issues

- none

### brokenImgs

- none

### hiddenContent

- none

### linkIssues

- none

### keyboardFailures

- none

## Store and email destinations per page (1440px)

| Route | App Store | Google Play | mailto info@ | mailto support@ |
| --- | --- | --- | --- | --- |
| / | exact | exact | 1 | 1 |
| /#/workflows/ | exact | exact | 1 | 1 |
| /#/enterprise/ | exact | exact | 1 | 1 |
| /#/integration/ | exact | exact | 1 | 1 |
| /#/privacy-and-retention/ | exact | exact | 1 | 1 |
| /#/download/ | exact | exact | 1 | 1 |
| /#/support/ | exact | exact | 1 | 3 |
| /#/contact/ | exact | exact | 2 | 2 |
| /#/this-page-does-not-exist/ | exact | exact | 1 | 1 |

## Keyboard flows

- PASS — skip link appears on Tab and moves focus to main
- PASS — mobile navigation opens with keyboard, traps focus, Escape closes and returns focus
- PASS — FAQ disclosures open/close with keyboard on /support/
- PASS — copy email control on /#/support/ copies support@raster.in and confirms
- PASS — copy email control on /#/contact/ copies info@raster.in and confirms
- PASS — screenshot viewer (if present) opens, traps focus, Escape closes and returns focus
- PASS — platform tabs (if present) are keyboard operable
- PASS — 200% zoom equivalent (720px wide, desktop UA) has no horizontal overflow on home
- PASS — legacy path URLs redirect to hash routes (/workflows/ → /#/workflows/)
- PASS — back-to-top control appears after scrolling, is keyboard operable and returns to the top
