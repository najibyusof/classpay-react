import type { PushDestination } from '../types/push';

type PushDestinationHandler = (destination: PushDestination) => void;

let destinationHandler: PushDestinationHandler | undefined;
let pendingDestination: PushDestination | undefined;

export function registerPushDestinationHandler(handler: PushDestinationHandler): () => void {
  destinationHandler = handler;
  if (pendingDestination) {
    handler(pendingDestination);
    pendingDestination = undefined;
  }
  return () => {
    if (destinationHandler === handler) destinationHandler = undefined;
  };
}

export function notifyPushDestination(destination: PushDestination): void {
  if (destinationHandler) {
    destinationHandler(destination);
    return;
  }
  pendingDestination = destination;
}
