

const diaplayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZG9sYWJvbWkiLCJhIjoiY2xrZWNzY3N4MDJsMzNmbzU0eGY0NTIwdyJ9.iLTXEhVb_FzwMGmmvzGolg';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/dolabomi/clkedow79003a01qydo6v8e5j', // style URL
    scrollZoom: false, // scroll
    //   center: [-118.113491, 34.111745], // starting position [lng, lat]
    //   zoom: 9, // starting zoom
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.map((loc) => {
    // CREATE MARKER
    const el = document.createElement('div');
    el.className = 'marker';

    // ADDING MARKER
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // ADD POPUP
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // EXTEND MAPBOUNDS TO INCLUDE CURRENT LOCATION
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      left: 100,
      right: 100,
      top: 200,
      bottom: 200,
    },
  });
};
