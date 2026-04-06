# Chrome Web Store Listing Draft

## Extension Name

Tulip Field

## Category

Fun

## Language

English

## Single Purpose

Tulip Field transforms the current webpage into a stylized Dutch tulip-field composition by detecting page regions and rendering a local decorative overlay.

## Short Description

Turn the current webpage into a Dutch tulip-field composition with procedural flower parcels.

## Detailed Description

Tulip Field reinterprets the current webpage as a stylized Dutch landscape.

When you click the extension, it analyzes the visible page structure, groups related content areas, and paints them as tulip-field parcels using procedural flowers and vertical field corridors.

Key behaviors:

- works on the active tab only when you click it
- processes the page locally in the browser
- uses procedural tulip rendering instead of static sprite sheets
- keeps page structure recognizable while transforming it into a field composition

Tulip Field is an artistic browsing tool. It does not collect user data, does not require an account, and does not send page contents to external servers.

## Permissions Justification

### `activeTab`

Required so the extension can run on the page the user explicitly chooses.

### `scripting`

Required to inject the content script that reads page structure and renders the overlay.

## Privacy Disclosure Draft

- Handles user data: No personal or sensitive user data is collected or transmitted
- Remote code: No
- Data sale: No
- Data sharing: No
- Authentication: No
- Encryption claim: Not applicable, because no user data is transmitted to a backend

## Support

Add your preferred support email or repository issue URL before publication.

## Listing Assets Checklist

- extension icon set: included in `assets/icons/`
- at least one screenshot: still needed
- promotional images: optional unless you want richer listing presentation

## Official References

- Chrome extension icons: [developer.chrome.com/docs/extensions/develop/ui/configure-icons](https://developer.chrome.com/docs/extensions/develop/ui/configure-icons)
- Chrome Web Store policies: [developer.chrome.com/docs/webstore/program-policies/policies](https://developer.chrome.com/docs/webstore/program-policies/policies)
