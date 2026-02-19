# TestFlight Setup Guide for MyKeto

**Objective:** Prepare and submit MyKeto to TestFlight for beta testing.

**Estimated Time:** 2-3 hours total

---

## ✅ Completed (Week 3 - TestFlight Prep)

- [x] **App Configuration** (`app.json`)
  - ✓ Version: 1.0.0
  - ✓ App name: MyKeto
  - ✓ iOS bundle ID: com.myketo.app
  - ✓ Android package: com.myketo.app
  - ✓ Theme: dark mode
  - ✓ Permissions configured: Camera, Photos, Health

- [x] **App Icons Generated**
  - ✓ Main icon (1024×1024): `assets/icon.png`
  - ✓ Splash screen (1024×1024): `assets/splash-icon.png`
  - ✓ Adaptive icon (1024×1024): `assets/adaptive-icon.png`
  - ✓ Favicon (192×192): `assets/favicon.png`

---

## 📋 Step-by-Step TestFlight Submission

### Phase 1: Prerequisites (30 minutes)

#### 1.1 Apple Developer Account Setup

1. Go to [Apple Developer](https://developer.apple.com)
2. Sign in or create account ($99/year)
3. Accept latest agreements and terms
4. Enable two-factor authentication on your Apple ID

#### 1.2 Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

When prompted:
- Email: Your Apple Developer email
- Password: Your app-specific password (or Apple ID password)
- Username: Your Apple ID

#### 1.3 Create App ID in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+"
3. Select "New App"
4. Fill in:
   - **Platform:** iOS
   - **Name:** MyKeto
   - **Primary Language:** English
   - **Bundle ID:** com.myketo.app ← **MUST match app.json**
   - **SKU:** myketo-app-2026
5. Click "Create"

### Phase 2: Build Configuration (45 minutes)

#### 2.1 Configure EAS Build

Initialize EAS in your project:

```bash
eas build:configure
```

Select **iOS** when prompted.

This creates `eas.json` with build configuration.

#### 2.2 Create App Signing Credentials

```bash
eas credentials
```

Follow the prompts:
1. Select **iOS**
2. Choose "Log in with Apple"
3. Select "Create new" for provisioning profile
4. Let EAS manage signing credentials (recommended)

**Note:** EAS can automatically generate all required certificates and provisioning profiles.

#### 2.3 Verify eas.json

Your `eas.json` should look like:

```json
{
  "build": {
    "preview": {
      "ios": {
        "buildType": "simulator"
      }
    },
    "preview2": {
      "ios": {
        "buildType": "simulator"
      }
    },
    "preview3": {
      "ios": {
        "buildType": "simulator"
      }
    },
    "production": {
      "ios": {
        "buildType": "app-store"
      }
    }
  }
}
```

### Phase 3: Build for App Store (20 minutes)

#### 3.1 Trigger App Store Build

```bash
eas build --platform ios --auto-submit
```

The `--auto-submit` flag automatically submits to TestFlight after build.

**Without auto-submit (manual):**

```bash
eas build --platform ios
```

Then manually submit via `eas submit --platform ios --latest`

#### 3.2 Monitor Build Progress

```bash
eas build:list
```

The build typically takes:
- First build: 15-20 minutes
- Subsequent builds: 10-15 minutes

You'll see logs in the EAS dashboard: https://expo.dev/builds

### Phase 4: TestFlight Submission (15 minutes)

#### 4.1 Submit to TestFlight

**If not auto-submitted:**

```bash
eas submit --platform ios
```

Follow the wizard:
1. Select your App Store Connect app
2. Choose "Test Flight" as submission service
3. Confirm submission

#### 4.2 Build Compliance in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com) → MyKeto
2. Click "Builds" → Your new build
3. Complete **Export Compliance** (usually "No" for keto app)
4. Click "Save"

#### 4.3 Add Testers

**Internal Testing:**
1. App Store Connect → MyKeto → "TestFlight" → "Internal Testing"
2. Click "+" under Testers
3. Add your own Apple ID email
4. Complete consent screen if needed

**External Testing:**
1. Click "External Testing"
2. Create a test group (e.g., "Beta Testers")
3. Invite testers via email
4. They'll receive TestFlight invite link

---

## 📱 Testing Checklist

Before inviting external testers, verify these features:

- [ ] Login/Signup works with real Supabase credentials
- [ ] Onboarding flow completes without errors
- [ ] Dashboard displays correctly (dark theme)
- [ ] Food scanner permissions request works
- [ ] AI responses come back properly (health coach)
- [ ] Meals can be logged and deleted
- [ ] Settings/Privacy/Terms links work
- [ ] Sign out functionality works
- [ ] App doesn't crash on common actions

---

## 🔧 Troubleshooting Common Issues

### Build Fails with Certificate Error

```bash
eas credentials
# Select "Remove" for credentials
# Then "Create new" to regenerate
```

### App ID Mismatch

Ensure `app.json` bundleIdentifier **exactly** matches App Store Connect bundle ID:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.myketo.app"
    }
  }
}
```

### Build Hangs on "Waiting for Build"

Check build status online: https://expo.dev/builds

It may still be building in the cloud. Wait or check logs.

### Can't Export Compliance

For health/diet apps, you may need to claim:
- Uses encryption: Usually "No" unless you're using HTTPS (which Expo provides)
- Select "This app does not use encryption"

### Testers Don't Receive Invite

1. Testers must have an Apple ID
2. They need to accept TestFlight invitation in email
3. They must download TestFlight app from App Store first
4. They must accept the app's consent/compliance details in TestFlight

---

## 📊 Version Management

When ready to update the build:

1. Update version in `app.json`:
   ```json
   {
     "version": "1.0.1"
   }
   ```

2. Rebuild:
   ```bash
   eas build --platform ios
   ```

---

## 🚀 Next Steps (Week 4-5)

After TestFlight beta testing:

1. **Gather Feedback** (1 week)
   - Monitor crash logs in App Store Connect
   - Collect feedback from testers
   - Track bugs in GitHub Issues

2. **Bug Fixes & Polish** (3-4 days)
   - Fix critical bugs found in testing
   - Optimize performance
   - Polish UI if needed

3. **App Store Submission** (1 week)
   - Create compelling app screenshots
   - Write marketing description
   - Set up app privacy label (required by Apple)
   - Submit for App Store review

---

## 📝 Important Legal Notes

Before submitting to App Store, ensure:

- [ ] Privacy Policy is live and linked correctly
- [ ] Terms of Service are accurate
- [ ] Medical disclaimer is prominent (Health-related app)
- [ ] All third-party licenses are documented
- [ ] GDPR/CCPA compliance verified

Check your `PRIVACY_POLICY.md` and `TERMS_OF_SERVICE.md` files for completeness.

---

## 💡 Quick Reference Commands

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to EAS
eas login

# Configure build
eas build:configure

# Manage credentials
eas credentials

# Build and auto-submit
eas build --platform ios --auto-submit

# List recent builds
eas build:list

# Submit manually
eas submit --platform ios

# View build logs
eas build:view [BUILD_ID]
```

---

**Last Updated:** February 19, 2026

For more info: https://docs.expo.dev/eas-update/introduction/
