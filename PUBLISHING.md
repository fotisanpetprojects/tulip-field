# Publishing Notes

Tulip Field Generator is already published in the Chrome Web Store:

- [Tulip Field Generator](https://chromewebstore.google.com/detail/tulip-field-generator/nkllngcebaboplbljhhedlnllkjjeemf?utm_source=item-share-cb)

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

## For future releases

1. Update the version in `manifest.json`
2. Rebuild the upload zip
3. Review `STORE_LISTING.md` and `PRIVACY_POLICY.md` if behaviour or permissions change
4. Upload the new zip in the Chrome Web Store Developer Dashboard
5. Update screenshots or listing copy if the product presentation changes

## Official References

- Icons: [developer.chrome.com/docs/extensions/develop/ui/configure-icons](https://developer.chrome.com/docs/extensions/develop/ui/configure-icons)
- Policies: [developer.chrome.com/docs/webstore/program-policies/policies](https://developer.chrome.com/docs/webstore/program-policies/policies)
