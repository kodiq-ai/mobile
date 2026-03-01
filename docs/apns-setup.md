# APNs Key → Firebase Console (Issue #46)

> iOS push-уведомления через Firebase Cloud Messaging требуют APNs Authentication Key.

## Текущий статус
- Firebase Project: `academy-286bd`
- iOS App: `ai.kodiq` (appId: `1:883916650071:ios:e3add57ebcc688aee05512`)
- Android push: работает (FCM)
- **iOS push: требует APNs key**

## Шаги

### 1. Создать APNs Key в Apple Developer Portal

1. Открыть [developer.apple.com/account/resources/authkeys](https://developer.apple.com/account/resources/authkeys/list)
2. "+" → Create a New Key
3. Key Name: `Kodiq FCM APNs`
4. Отметить **Apple Push Notifications service (APNs)**
5. Continue → Register
6. **Скачать** `.p8` файл (доступен ТОЛЬКО один раз!)
7. Записать **Key ID** (10 символов, напр. `ABC1234567`)

### 2. Загрузить в Firebase Console

1. Открыть [Firebase Console → Project Settings → Cloud Messaging](https://console.firebase.google.com/project/academy-286bd/settings/cloudmessaging)
2. В секции "Apple app configuration" → iOS app `ai.kodiq`
3. Нажать "Upload" рядом с "APNs Authentication Key"
4. Загрузить `.p8` файл
5. Ввести:
   - **Key ID**: из шага 1.7
   - **Team ID**: из Apple Developer → Membership → Team ID

### 3. Проверка

```bash
# Отправить тестовое push через FCM API
curl -X POST \
  "https://fcm.googleapis.com/v1/projects/academy-286bd/messages:send" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "x-goog-user-project: academy-286bd" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "token": "<FCM_DEVICE_TOKEN>",
      "notification": {
        "title": "Test",
        "body": "APNs works!"
      }
    }
  }'
```

### 4. Безопасность

- **НЕ коммитить** `.p8` файл в репо!
- После загрузки в Firebase — удалить локальный файл
- Key можно отозвать в Apple Developer Portal если скомпрометирован
