/**
 * Auth: Nikko Dutra Bouck
 *
 *  StartupService is used to load data into the cache
 *    Data may come from the cloud or a local storage layer
 */

 import * as Location from 'expo-location';
 import { fetchDataWithLocation } from '../../models/charger-locations/ChargerLocationsModel.functions';

/***** LOAD DATA INTO THE MODEL CACHE AND LOCAL_STORAGE *****/

export function LoadModels() {
  updateModelLocation(eventHandler);

  // Add all models that need to be initialized to this class.
}

/**** DEFINE MODEL INITILIZERS HERE ****/

function eventHandler(location) {
  console.log("StartupService");
  console.log(location);
  const radiusInKm = 3;
  fetchDataWithLocation(location.coords.latitude, location.coords.longitude, radiusInKm);
}

// This is used to prevent overlapping calls to updateModelLocation()
let isWaiting = false;
// Use the getLocation to request an update right now.
async function updateModelLocation(locationHandler) {
  if (isWaiting) {
    return;
  }
  isWaiting = true;

  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    isWaiting = false;
    return;
  }

  let location = await Location.getCurrentPositionAsync({});
  locationHandler(location);
  isWaiting = false;

}
