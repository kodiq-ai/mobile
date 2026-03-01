# Apple App Store — Privacy Nutrition Labels

> Заполнить в App Store Connect → App Privacy → Get Started
> Privacy Policy URL: `https://kodiq.ai/legal/privacy`

## Data Types Collected

### 1. Contact Info

| Data Type | Collected | Linked to User | Used for Tracking |
|-----------|-----------|----------------|-------------------|
| Email Address | Yes | Yes | No |
| Name | Yes (optional) | Yes | No |

**Purpose**: App Functionality (authentication, account management)

### 2. Identifiers

| Data Type | Collected | Linked to User | Used for Tracking |
|-----------|-----------|----------------|-------------------|
| User ID | Yes | Yes | No |
| Device ID | Yes | No | No |

**Purpose**: App Functionality (session management), Analytics (PostHog, Firebase)

### 3. Usage Data

| Data Type | Collected | Linked to User | Used for Tracking |
|-----------|-----------|----------------|-------------------|
| Product Interaction | Yes (opt-in) | No | No |

**Purpose**: Analytics — screen views, feature usage, lesson progress. Anonymised. User controls via in-app consent screen.

### 4. Diagnostics

| Data Type | Collected | Linked to User | Used for Tracking |
|-----------|-----------|----------------|-------------------|
| Crash Data | Yes | No | No |
| Performance Data | Yes | No | No |

**Purpose**: App Functionality — Firebase Crashlytics + Sentry for crash reporting and stability monitoring. Essential, always enabled.

## Data NOT Collected

- Precise Location
- Coarse Location
- Physical Address
- Phone Number
- Health & Fitness
- Financial Info (payments via web only, not in-app)
- Sensitive Info
- Photos or Videos
- Audio Data
- Browsing History
- Search History
- Contacts
- Emails or Text Messages
- Gameplay Content
- Advertising Data

## Summary for App Store Connect Form

1. **Do you or your third-party partners collect data from this app?** → **Yes**
2. **Privacy Policy URL** → `https://kodiq.ai/legal/privacy`
3. Data types:
   - Contact Info: Email (App Functionality), Name (App Functionality)
   - Identifiers: User ID (App Functionality), Device ID (Analytics)
   - Usage Data: Product Interaction (Analytics) — **opt-in**
   - Diagnostics: Crash Data (App Functionality), Performance Data (App Functionality)
4. **Data Used to Track You** → **No** (none of the data is used for tracking across apps/websites)
5. **Data Linked to You** → Email, Name, User ID
6. **Data Not Linked to You** → Device ID, Product Interaction, Crash Data, Performance Data
