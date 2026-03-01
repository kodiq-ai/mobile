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

## APNs Key → Firebase (#46) ⬜ PENDING

**Единственный незавершённый шаг** — ручная загрузка APNs Authentication Key.

Подробные шаги: [`docs/apns-setup.md`](./apns-setup.md)

**Краткое**:
1. [Apple Developer → Keys](https://developer.apple.com/account/resources/authkeys/list) → Create → APNs → Download `.p8`
2. [Firebase Console → Cloud Messaging](https://console.firebase.google.com/project/academy-286bd/settings/cloudmessaging) → Upload `.p8` + Key ID + Team ID

**Без этого шага**: iOS push-уведомления НЕ будут работать. Android push работает.
