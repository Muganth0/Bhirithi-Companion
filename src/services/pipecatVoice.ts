import { PipecatClient, RTVIEvent } from '@pipecat-ai/client-js';

export type PipecatVoiceStatus = 'idle' | 'connecting' | 'connected' | 'error';

export interface PipecatVoiceOptions {
  endpoint: string;
  onStatus?: (status: PipecatVoiceStatus) => void;
  onUserTranscript?: (text: string) => void;
  onBotTranscript?: (text: string) => void;
}

export class PandaPipecatVoice {
  private client: PipecatClient | null = null;
  private audioElements = new Set<HTMLAudioElement>();
  private options: PipecatVoiceOptions;

  constructor(options: PipecatVoiceOptions) {
    this.options = options;
  }

  get isConnected() {
    return Boolean(this.client);
  }

  async connect() {
    if (this.client) return;
    this.options.onStatus?.('connecting');

    try {
      const { SmallWebRTCTransport } = await import('@pipecat-ai/small-webrtc-transport');
      const transport = new SmallWebRTCTransport();

      const client = new PipecatClient({
        transport,
        enableMic: true,
        enableCam: false,
        callbacks: {
          onConnected: () => this.options.onStatus?.('connected'),
          onDisconnected: () => {
            this.options.onStatus?.('idle');
            this.client = null;
            this.cleanupAudio();
          },
          onUserTranscript: (data) => {
            if (data.final && data.text?.trim()) this.options.onUserTranscript?.(data.text.trim());
          },
          onBotTranscript: (data) => {
            if (data.text?.trim()) this.options.onBotTranscript?.(data.text.trim());
          },
          onError: (error) => {
            console.warn('Panda Pipecat voice error:', error);
            this.options.onStatus?.('error');
          },
        },
      });

      client.on(RTVIEvent.TrackStarted, (track, participant) => {
        if (participant?.local || track.kind !== 'audio') return;
        const audio = document.createElement('audio');
        audio.autoplay = true;
        audio.setAttribute('playsinline', 'true');
        audio.srcObject = new MediaStream([track]);
        document.body.appendChild(audio);
        this.audioElements.add(audio);
      });

      client.on(RTVIEvent.TrackStopped, (track, participant) => {
        if (participant?.local || track.kind !== 'audio') return;
        this.cleanupAudio();
      });

      this.client = client;
      await client.startBotAndConnect({
        endpoint: this.options.endpoint,
        requestData: {
          createDailyRoom: false,
          enableDefaultIceServers: true,
          transport: 'webrtc',
        },
      });
    } catch (error) {
      console.warn('Panda Pipecat connection failed; browser voice remains available.', error);
      this.options.onStatus?.('error');
      this.client = null;
      this.cleanupAudio();
      throw error;
    }
  }

  async disconnect() {
    if (!this.client) return;
    const client = this.client;
    this.client = null;
    try {
      await client.disconnect();
    } finally {
      this.cleanupAudio();
      this.options.onStatus?.('idle');
    }
  }

  private cleanupAudio() {
    for (const audio of this.audioElements) {
      audio.srcObject = null;
      audio.remove();
    }
    this.audioElements.clear();
  }
}
