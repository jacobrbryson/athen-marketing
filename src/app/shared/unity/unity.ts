import { Component, OnInit } from '@angular/core';
import { asset } from 'src/app/asset';

declare global {
  interface Window {
    createUnityInstance: (
      canvas: HTMLCanvasElement,
      config: any,
      onProgress: (progress: number) => void
    ) => Promise<any>;
  }
}

@Component({
  selector: 'app-unity-player',
  template: `<div id="unity-container" class="unity-container">
    <canvas id="unity-canvas" style="width: 100%; height: 100%"></canvas>
  </div>`,
  styleUrls: ['./unity.css'],
})
export class UnityPlayerComponent implements OnInit {
  ngOnInit() {
    const loaderScript = document.createElement('script');
    loaderScript.src = asset('unity/Build/Dist.loader.js');

    loaderScript.onload = () => {
      this.initializeUnity();
    };

    document.body.appendChild(loaderScript);
  }

  initializeUnity() {
    const canvas = document.querySelector('#unity-canvas') as HTMLCanvasElement;

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * pixelRatio;
    canvas.height = canvas.clientHeight * pixelRatio;

    // Configuration object (paths are relative to the loader script location)
    const config = {
      dataUrl: asset('unity/Build/Dist.data'),
      frameworkUrl: asset('unity/Build/Dist.framework.js'),
      codeUrl: asset('unity/Build/Dist.wasm'),
      streamingAssetsUrl: 'StreamingAssets',
      companyName: 'DefaultCompany',
      productName: 'MyUnityProject',
      productVersion: '1.0',
    };

    if (window.createUnityInstance && canvas) {
      window
        .createUnityInstance(canvas, config, (progress) => {
          // Optional: Handle loading progress here (e.g., update a progress bar)
          // console.log('Loading progress:', progress * 100 + '%');
        })
        .then((unityInstance) => {
          console.log('Unity instance created:', unityInstance);
          // You can save the instance here to call methods later (e.g., unityInstance.SendMessage)
        })
        .catch((message) => {
          console.error('Unity initialization failed:', message);
        });
    }
  }
}
