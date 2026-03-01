# Google Play — Data Safety Section

> Заполнить в Google Play Console → App content → Data safety
> Privacy Policy URL: `https://kodiq.ai/legal/privacy`

## Overview

| Question | Answer |
|----------|--------|
| Does your app collect or share any of the required user data types? | Yes |
| Is all of the user data collected by your app encrypted in transit? | Yes (HTTPS) |
| Do you provide a way for users to request that their data is deleted? | Yes (email support@kodiq.ai) |

## Data Collected

### 1. Email address

| Field | Value |
|-------|-------|
| Category | Personal info |
| Collected | Yes |
| Shared | No |
| Required | Yes (for authentication) |
| Purpose | App functionality, Account management |
| Ephemeral | No |

### 2. Name

| Field | Value |
|-------|-------|
| Category | Personal info |
| Collected | Yes |
| Shared | No |
| Required | No (optional) |
| Purpose | App functionality |
| Ephemeral | No |

### 3. App interactions (screen views, feature usage)

| Field | Value |
|-------|-------|
| Category | App activity |
| Collected | Yes |
| Shared | No |
| Required | No (opt-in via consent) |
| Purpose | Analytics |
| Ephemeral | No |

### 4. Crash logs

| Field | Value |
|-------|-------|
| Category | App info and performance |
| Collected | Yes |
| Shared | No |
| Required | Yes (essential) |
| Purpose | App functionality (stability) |
| Ephemeral | No |

### 5. Diagnostics

| Field | Value |
|-------|-------|
| Category | App info and performance |
| Collected | Yes |
| Shared | No |
| Required | Yes (essential) |
| Purpose | App functionality (performance monitoring) |
| Ephemeral | No |

### 6. Device or other IDs

| Field | Value |
|-------|-------|
| Category | Device or other IDs |
| Collected | Yes |
| Shared | No |
| Required | Yes (for push notifications — FCM token) |
| Purpose | App functionality (push notifications) |
| Ephemeral | No |

## Data NOT Collected

- Location (precise or approximate)
- Phone number
- Physical address
- Financial info (payments via web only)
- Health info
- Photos or videos
- Audio files
- Files and docs
- Calendar events
- Contacts
- SMS / call log
- Web browsing history
- Installed apps

## Security Practices

| Practice | Status |
|----------|--------|
| Data encrypted in transit | Yes (TLS/HTTPS) |
| Data encrypted at rest | Yes (Supabase managed) |
| Users can request data deletion | Yes (support@kodiq.ai) |
| App follows Google Play Families Policy | N/A (not targeted at children) |
| Independent security review | No |

## Third-Party SDKs & Data Processing

| SDK | Data accessed | Purpose |
|-----|---------------|---------|
| Supabase | Email, User ID | Authentication |
| PostHog | Anonymised events, Device ID | Analytics (opt-in) |
| Firebase Analytics | Anonymised events | Analytics (opt-in) |
| Firebase Crashlytics | Crash logs, device info | Crash reporting (essential) |
| Firebase Cloud Messaging | FCM token | Push notifications |
| Sentry | Crash logs, device info | Error monitoring (essential) |
