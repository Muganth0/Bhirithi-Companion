# Panda Pipecat Voice Prototype

This prototype adds a realtime Pipecat voice path without removing Panda's existing browser voice.

## Architecture

- **Primary prototype:** Pipecat + SmallWebRTC.
- **Fallback:** the existing browser SpeechRecognition + speechSynthesis implementation.
- **Activation:** set `VITE_PIPECAT_BOT_START_URL`, then press **Try Live** in Panda's voice controls.
- **Safety:** if Pipecat is not configured or the connection fails, the browser voice remains available.

Pipecat's SmallWebRTC transport is intended for local development and demos. Production can later move the bot to Pipecat Cloud/Daily or another supported transport.

## Local Pipecat bot

Pipecat's current official tooling uses Python 3.11+ and `uv`.

```bash
uv tool install "pipecat-ai[cli]"
pipecat init
```

Create a web voice bot with SmallWebRTC and configure your chosen STT, LLM and TTS providers. For Panda, use a distinctive voice prompt such as:

> You are Panda, a cheerful young Indian-English companion for a school student. Speak warmly, clearly and naturally. Keep replies concise enough for realtime conversation. Never imitate a named character or actor. Avoid emojis, markdown and bullet points in spoken output.

Then expose the bot start endpoint and set:

```env
VITE_PIPECAT_BOT_START_URL=http://localhost:7860/start
```

Run Bhirithi Companion and click **Try Live**.

## Production

Do not put provider API keys in the Vite client. Keep them in the Pipecat bot/server. Vercel can continue hosting the Bhirithi Companion web app while the realtime Pipecat worker runs separately.
