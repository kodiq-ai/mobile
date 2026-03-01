# App Store & Google Play — Setup Status

> Проверено 1 марта 2026. Все credentials в GitHub Secrets repo `kodiq-ai/mobile`.

## App Store Connect (#47) ✅ DONE

| Item | Status | Value |
|------|--------|-------|
| Bundle ID | Registered | `ai.kodiq` |
| Team ID | Configured | `JRJGS4U2DJ` |
| API Key | In secrets | `APPSTORE_CONNECT_API_KEY_ID` + `ISSUER_ID` + `API_KEY` |
| Certificates | match (git) | `kodiq-mobile-certs` repo |
| CI Workflow | Ready | `.github/workflows/build-ios.yml` |
| Fastlane | Configured | `beta` (TestFlight), `release` (App Store) |
| TestFlight Setup | Workflow ready | `.github/workflows/setup-testflight.yml` |

### Первый релиз

```bash
# 1. Запустить setup-testflight для настройки бета-группы
gh workflow run setup-testflight.yml

# 2. Создать тег для релиза → CI автоматически соберёт и загрузит
git tag v1.0.0
git push origin v1.0.0
```

## Google Play Console (#48) ✅ DONE

| Item | Status | Value |
|------|--------|-------|
| Package Name | Registered | `ai.kodiq` |
| Upload Keystore | In secrets | `ANDROID_UPLOAD_KEYSTORE_BASE64` + passwords |
| Service Account | In secrets | `GOOGLE_PLAY_SERVICE_ACCOUNT` |
| CI Workflow | Ready | `.github/workflows/build-android.yml` |
| Auto-upload | Enabled | On push to `main` → internal testing (draft) |

### Первый релиз

```bash
# CI уже загружает AAB в internal testing на каждый push в main.
# В Google Play Console:
# 1. Console → Internal testing → Review and roll out
# 2. Или переместить в Production track
```

## APNs Key → Firebase (#46) ✅ DONE

| Item | Status | Value |
|------|--------|-------|
| APNs Auth Key (.p8) | Uploaded to Firebase | Key ID in `APNS_AUTH_KEY_ID` secret |
| Team ID | Configured | `JRJGS4U2DJ` |
| Backup in GitHub | Secrets | `APNS_AUTH_KEY_P8`, `APNS_AUTH_KEY_ID`, `APNS_TEAM_ID` |
| Firebase Admin SDK | Configured on server | `FIREBASE_ADMIN_KEY` in `.env.local` |
| Server push code | Ready | `web/src/lib/push/send.ts` |

iOS и Android push-уведомления полностью настроены.
