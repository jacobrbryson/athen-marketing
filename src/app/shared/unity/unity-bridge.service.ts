import { Injectable, signal } from '@angular/core';

type GestureName = 'Wave' | 'Happy' | 'Yes' | 'No';

interface UnityInstanceLike {
  SendMessage(gameObject: string, methodName: string, parameter?: string): void;
  Quit?: () => Promise<void>;
}

@Injectable({
  providedIn: 'root',
})
export class UnityBridgeService {
  private readonly unityInstance = signal<UnityInstanceLike | null>(null);

  register(instance: UnityInstanceLike) {
    this.unityInstance.set(instance);
  }

  unregister(instance: UnityInstanceLike | null) {
    if (this.unityInstance() === instance) {
      this.unityInstance.set(null);
    }
  }

  playGesture(gesture: GestureName) {
    this.send('PlayGesture', gesture);
  }

  setThinking(isThinking: boolean) {
    this.send('SetThinking', String(isThinking));
  }

  thinkingOn() {
    this.send('ThinkingOn');
  }

  thinkingOff() {
    this.send('ThinkingOff');
  }

  stopAllExpressiveStates() {
    this.send('StopAllExpressiveStates');
  }

  sendToGameObject(gameObject: string, methodName: string, parameter?: string) {
    const instance = this.unityInstance();
    if (!instance) return;

    console.log('[UnityBridgeService] SendMessage', {
      gameObject,
      methodName,
      hasParameter: parameter !== undefined,
    });

    if (parameter === undefined) {
      instance.SendMessage(gameObject, methodName);
      return;
    }

    instance.SendMessage(gameObject, methodName, parameter);
  }

  private send(methodName: string, parameter?: string) {
    this.sendToGameObject('AthenaBridge', methodName, parameter);
  }
}
