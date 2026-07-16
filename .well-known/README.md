# Digital Asset Links for TWA / Play Store Trusted Web Activity

After your AAB is built and you have the signing cert SHA-256 fingerprint
(from Play Console → App integrity → App signing),
replace `REPLACE_WITH_SHA256_FROM_PLAY_CONSOLE` in `assetlinks.json` with the real fingerprint.

To get the fingerprint from a keystore:

    keytool -list -v -keystore android.keystore -alias your-alias -storepass your-pass | grep SHA256

Then host the file at:

    https://YOUR-DOMAIN/.well-known/assetlinks.json

Until you have a real keystore (after first build), Play Store shows
the URL bar in TWA — but the app still installs and works.
