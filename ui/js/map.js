let map;

function CountryMap(countryName, mapElementId, API_KEY) {
    function loadGoogleMapsAPI() {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.maps) {
                resolve();
            } else {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            }
        });
    }

    async function getCountryCoordinates() {
        const apiUrl = `https://restcountries.com/v3.1/name/${countryName}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.length === 0 || !data[0].latlng) {
            throw new Error(`Coordinates not found for ${countryName}`);
        }

        const [latitude, longitude] = data[0].latlng;
        return { latitude, longitude };
    } catch (error) {
        console.error(`Error fetching coordinates for ${countryName}:`, error);
        throw error; // Re-throw
    }

    }


    async function initMap({ latitude, longitude }) {
    const { Map } = await google.maps.importLibrary("maps");
    map = new Map(document.getElementById(mapElementId), {
        center: { lat: latitude, lng: longitude },
        zoom: 8,
    });
    }

    loadGoogleMapsAPI()
        .then(() => getCountryCoordinates())
        .then(initMap)
        .catch(error => {
            console.error(`Error initializing country map for ${countryName}:`, error);
            document.getElementById(mapElementId).innerHTML = (`Error loading map for ${countryName}`);
        });
}