const staticStoreName = 'restaurants';

const idbApp = (() => {
  if (!navigator.serviceWorker) {
    console.log('Service worker not installed');
    return Promise.resolve();
  }

  const dbPromise = idb.open('restaurant-reviews', 1, function(upgradeDb) {
    switch (upgradeDb.oldVersion) {
      case 0:
        upgradeDb.createObjectStore(staticStoreName, {
          keyPath: 'id'
        });
    }
  });

  /**
   * Fetch restaurant by ID.
   */
  async function fetchRestaurantById(id) {
    return dbPromise
      .then(function(db) {
        const tx = db.transaction(staticStoreName);
        const store = tx.objectStore(staticStoreName);
        return store.get(parseInt(id));
      })
      .then(function(restaurantObject) {
        return restaurantObject;
      })
      .catch(function(e) {
        console.log(e);
      });
  }

  /**
   * Add restaurant.
   */
  async function addRestaurantById(restaurant) {
    return dbPromise
      .then(function(db) {
        const tx = db.transaction(staticStoreName, 'readwrite');
        const store = tx.objectStore(staticStoreName);
        store.put(restaurant);
        return tx.complete;
      })
      .catch(function(e) {
        console.log(e);
      });
  }

  return { dbPromise, fetchRestaurantById, addRestaurantById };
})();

/**
 * Common database helper functions.
 */
class DBHelper {
  /**
   * URL to API end point which returns JSON.
   */
  static get DATABASE_URL() {
    const port = 1337;
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * URL to static JSON file.
   */
  // static get LOCAL_DATABASE_URL() {
  //   const port = 8000;
  //   return `http://localhost:${port}/data/restaurants.json`;
  // }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    fetch(DBHelper.DATABASE_URL)
      .then(DBHelper.checkStatus)
      .then(DBHelper.parseJson)
      .then(json => {
        callback(null, json);
      })
      .catch(e => {
        console.error(e);
        callback(null, e);
      });
  }

  /**
   * Check response status.
   */
  static checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response);
    } else {
      return Promise.reject(new Error(response.statusText));
    }
  }

  /**
   * Parse JSON.
   */
  static parseJson(response) {
    return response.json();
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    const idbRestaurant = idbApp.fetchRestaurantById(id);
    idbRestaurant.then(function(idbRestaurantObject) {
      if (idbRestaurantObject) {
        callback(null, idbRestaurantObject);
        return;
      } else {
        DBHelper.fetchRestaurants((error, restaurants) => {
          if (error) {
            callback(error, null);
          } else {
            const restaurant = restaurants.find(r => r.id == id);
            if (restaurant) {
              let idbMessages = idbApp.addRestaurantById(restaurant);
              callback(null, restaurant);
            } else {
              callback(`Restaurant ID ${id} not found`, null);
            }
          }
        });
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') {
          // Filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') {
          // Filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map(
          (v, i) => restaurants[i].neighborhood
        );
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        );
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        );
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return `/img/${restaurant.photograph}.jpg`;
  }

  /**
   * Restaurant image URL.
   */
  static imageSrcSetForRestaurant(restaurant, srcSets) {
    let imageSrcSet = '';

    // Add each provided srcSet
    for (let srcSet of srcSets) {
      imageSrcSet += `img/${restaurant.photograph}-${srcSet}.jpg ${srcSet}w, `;
    }

    // Remove last instance of ','
    if (imageSrcSet.includes(',')) {
      const commaIndex = imageSrcSet.lastIndexOf(',');
      imageSrcSet =
        imageSrcSet.substring(0, commaIndex) +
        imageSrcSet.substring(commaIndex + 1);
    }

    return imageSrcSet;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker(
      [restaurant.latlng.lat, restaurant.latlng.lng],
      {
        title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant)
      }
    );
    marker.addTo(newMap);
    return marker;
  }
}
