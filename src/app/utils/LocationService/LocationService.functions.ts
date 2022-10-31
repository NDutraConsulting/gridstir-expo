import * as Location from 'expo-location';
import _EventBus from '../../events/_event-bus/_EventBus';
import { EventRegistry } from '../../events/event-registry/EventRegistry';

// This is a private instance level variable because it is not exported
//  meaning that when imported into a new class it is reset
// This is be better than using a static semaphore
//   because it prevents deadlock when system failures occur.
// Which makes this approach more recoverable by nature.

const EVENT_CHANNEL = EventRegistry.LocationUpdated;

let isWaiting = false;

// Use the subscriber to consume location updates
export function subscribeToLocationService(handler) {
  _EventBus.subscribe(EVENT_CHANNEL, handler);
}

// Use the getLocation to request an update right now.
export async function getLocation() {
  if (isWaiting) {
    return;
  }
  isWaiting = true;

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    isWaiting = false;
    console.log("failed");
    return;
  }

  const {coords} = await Location.getCurrentPositionAsync({});
  
      // Publish the location event for other services to consume.
      //   Pros & Cons:
      //       - Functional Components that subscribe to an event won't die without unsubscribe.
      //          - This is because the garbage collector will see that it is still being used
      //          - If components are able to mutate then this become very memory effecient and fully decoupled.
      //       + Using an event system has many benifits:
      //            + it allows us to do integration testing at the pub-sub layer
      //            + it allows us to extend functionality very quickly with zero impact on the existing system
      //            + it forces decoupling of functionality
      //            + it enables multithreading & background services
      //       + Creates very easy to read code.
      //       + Reduces Callback hell
      //       + Subscribers must send a message to ask for an update.
      //        + This is okay if we don't need the update immediately
      //        - This is not good for things that need to run synchronously

      _EventBus.publish(EVENT_CHANNEL, {
        location: coords,
      });

  isWaiting = false;

}
