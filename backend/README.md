# Bhirithi Companion Secure Gemini Backend

The Android app talks to this service instead of Vercel.

Architecture:

Android APK
  -> HTTPS
Bhirithi Gemini Backend
  -> Gemini API / Google Search grounding

The Gemini API key is never included in the Android APK.

## Local test

1. Install Node.js 22+.
2. Copy `.env.example` to `.env`.
3. Set `GEMINI_API_KEY`.
4. Run:

```bash
npm install
npm start
```

Health check:

```
GET http://localhost:8080/health
```

Chat:

```
POST http://localhost:8080/v1/chat
Content-Type: application/json

{"message":"Hi Panda","history":[],"role":"friend"}
```

## Google Cloud Run

This backend is containerized for Google Cloud Run. Cloud Run can deploy the container and provides a stable HTTPS service URL. Store GEMINI_API_KEY as a server-side secret/environment variable; never put it in Android source code.

Example:

```bash
gcloud run deploy bhirithi-gemini-backend \
  --source backend \
  --region asia-south1 \
  --allow-unauthenticated
```

Then configure GEMINI_API_KEY in the Cloud Run service environment/secrets.

After deployment, set the Android Gradle property `bhirithiBackendUrl` to the service URL.

For production, add authentication/rate controls such as Firebase Authentication and/or Play Integrity before opening the service broadly.
