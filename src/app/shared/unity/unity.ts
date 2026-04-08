import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { asset } from 'src/app/asset';
import { ChatService } from 'src/app/services/chat';
import { environment } from 'src/environments/environment';
import { UnityBridgeService } from './unity-bridge.service';

declare global {
  interface Window {
    unityInstance?: {
      SendMessage: (gameObject: string, methodName: string, parameter?: string) => void;
    };
    createUnityInstance: (
      canvas: HTMLCanvasElement,
      config: any,
      onProgress: (progress: number) => void
    ) => Promise<any>;
  }
}

@Component({
  selector: 'app-unity-player',
  template: `
    <div id="unity-container" class="unity-container">
      <canvas
        id="unity-canvas"
        class="unity-canvas"
        [class.unity-canvas--loading]="isLoading()"
        style="width: 100%; height: 100%"
        tabindex="1"
      ></canvas>

      @if (isLoading()) {
        <div class="unity-loading-overlay" aria-live="polite" aria-busy="true">
          <div class="unity-loading-card">
            <div class="unity-loading-copy">
              <p class="unity-loading-eyebrow">Learning Companion</p>
              <p class="unity-loading-title">Starting up</p>
            </div>

            <div class="unity-loading-bar" aria-hidden="true">
              <div
                class="unity-loading-bar__fill"
                [style.width.%]="loadingProgress()"
              ></div>
            </div>

            <p class="unity-loading-progress">{{ loadingProgress() }}%</p>
          </div>
        </div>
      }

      @if (errorMessage(); as errorMessage) {
        <div class="unity-error-overlay" role="alert">
          <p>{{ errorMessage }}</p>
        </div>
      }
    </div>
  `,
  styleUrls: ['./unity.css'],
})
export class UnityPlayerComponent implements OnInit, OnDestroy {
  private readonly chatService = inject(ChatService);
  private readonly unityBridge = inject(UnityBridgeService);

  protected readonly isLoading = signal(true);
  protected readonly loadingProgress = signal(0);
  protected readonly errorMessage = signal<string | null>(null);

  private loaderScript: HTMLScriptElement | null = null;
  private unityInstance: { SendMessage: (gameObject: string, methodName: string, parameter?: string) => void } | null =
    null;

  private readonly handleUnityReadyForWebSocket = () => {
    console.log('[Angular] Received athena-unity-ready-for-websocket');

    const sessionId = this.chatService.sessionId();
    const token = localStorage.getItem('auth_token') || '';

    if (!sessionId || !token) {
      console.warn('[Angular] Missing sessionId or token for Unity websocket.', {
        hasSessionId: !!sessionId,
        hasToken: !!token,
      });
      return;
    }

    const params = new URLSearchParams({ sessionId, token });
    const wsUrl = environment.proxyServer.replace('http', 'ws') + `/ws?${params.toString()}`;
    const payload = JSON.stringify({
      wsUrl,
      sessionId,
      token,
    });

    console.log('[Angular] Sending websocket config to Unity', {
      sessionId,
      hasToken: true,
      wsUrl,
    });

    this.unityBridge.sendToGameObject('AthenaSocketBridge', 'ConfigureWebSocket', payload);
    this.unityBridge.sendToGameObject('AthenaSocketBridge', 'ConnectWebSocket');
  };

  private readonly handleUnityWebSocketConnected = () => {
    console.log('[Angular] Received athena-unity-websocket-connected');
  };

  ngOnInit() {
    window.addEventListener(
      'athena-unity-ready-for-websocket',
      this.handleUnityReadyForWebSocket
    );
    window.addEventListener(
      'athena-unity-websocket-connected',
      this.handleUnityWebSocketConnected
    );

    const loaderScript = document.createElement('script');
    loaderScript.src = asset('unity/Build/unity.loader.js');
    loaderScript.async = true;

    loaderScript.onload = () => {
      this.initializeUnity();
    };

    loaderScript.onerror = () => {
      this.errorMessage.set('Unable to load the learning companion right now.');
      this.isLoading.set(false);
    };

    this.loaderScript = loaderScript;
    document.body.appendChild(loaderScript);
  }

  ngOnDestroy() {
    if (window.unityInstance === this.unityInstance) {
      delete window.unityInstance;
    }
    window.removeEventListener(
      'athena-unity-ready-for-websocket',
      this.handleUnityReadyForWebSocket
    );
    window.removeEventListener(
      'athena-unity-websocket-connected',
      this.handleUnityWebSocketConnected
    );
    this.unityBridge.unregister(this.unityInstance);
    this.loaderScript?.remove();
  }

  initializeUnity() {
    const canvas = document.querySelector('#unity-canvas') as HTMLCanvasElement;
    if (!canvas) {
      this.errorMessage.set('Unable to start the learning companion right now.');
      this.isLoading.set(false);
      return;
    }

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * pixelRatio;
    canvas.height = canvas.clientHeight * pixelRatio;

    // Configuration object (paths are relative to the loader script location)
    const config = {
      dataUrl: asset('unity/Build/unity.data'),
      frameworkUrl: asset('unity/Build/unity.framework.js'),
      codeUrl: asset('unity/Build/unity.wasm'),
      streamingAssetsUrl: 'StreamingAssets',
      companyName: 'DefaultCompany',
      productName: 'MyUnityProject',
      productVersion: '1.0',
    };

    if (window.createUnityInstance && canvas) {
      window
        .createUnityInstance(canvas, config, (progress) => {
          this.loadingProgress.set(Math.round(progress * 100));
        })
        .then((unityInstance) => {
          console.log('Unity instance created:', unityInstance);
          this.unityInstance = unityInstance;
          window.unityInstance = unityInstance;
          this.unityBridge.register(unityInstance);
          this.loadingProgress.set(100);
          this.isLoading.set(false);
          this.errorMessage.set(null);
        })
        .catch((message) => {
          console.error('Unity initialization failed:', message);
          this.errorMessage.set('Unable to load the learning companion right now.');
          this.isLoading.set(false);
        });
      return;
    }

    this.errorMessage.set('Unity is unavailable in this browser.');
    this.isLoading.set(false);
  }
}
