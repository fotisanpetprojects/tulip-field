# Publishing Prep

This project is prepared for Chrome Web Store submission, but a few dashboard-side steps still need to be completed manually.

## Included in the repo

- manifest icon set in `assets/icons/`
- privacy policy in `PRIVACY_POLICY.md`
- public privacy policy URL: `https://github.com/fotisanpetprojects/tulip-field/blob/main/PRIVACY_POLICY.md`
- listing draft in `STORE_LISTING.md`
- packaging script in `scripts/build-package.sh`

## Build the upload zip

Run:

```bash
./scripts/build-package.sh
```

This creates a zip in `dist/`.

## Before submitting

1. Review `STORE_LISTING.md`
2. Add a real support email or issue URL
3. Capture screenshots of the extension in use
4. Upload the generated zip to the Chrome Web Store Developer Dashboard
5. Fill in the privacy answers so they match `PRIVACY_POLICY.md`
6. Verify the single-purpose field matches the extension behaviour

## Official References

- Icons: [developer.chrome.com/docs/extensions/develop/ui/configure-icons](https://developer.chrome.com/docs/extensions/develop/ui/configure-icons)
- Policies: [developer.chrome.com/docs/webstore/program-policies/policies](https://developer.chrome.com/docs/webstore/program-policies/policies)
