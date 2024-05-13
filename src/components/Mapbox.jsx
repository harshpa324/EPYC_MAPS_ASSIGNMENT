"use client"
import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl";
import algoliasearch from 'algoliasearch/lite';
import "mapbox-gl/dist/mapbox-gl.css";
import SearchBar from './SearchBar'; 

function MapboxMap() {
    const mapContainer = useRef(null);
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [query, setQuery] = useState('');
    const [mapMarkers, setMapMarkers] = useState([]);


    useEffect(() => {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

        const initializeMap = ({ setMap, mapContainer }) => {
            const map = new mapboxgl.Map({
                container: mapContainer.current,
                style: "mapbox://styles/mapbox/streets-v11",
                center: [0, 0],
                zoom: 2
            });

            map.on("load", () => {
                setMap(map);
                map.resize();
            });
        };

        if (!map) initializeMap({ setMap, mapContainer });
    }, [map]);

    useEffect(() => {
        const fetchMembers = async () => {
            const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY);
            const index = client.initIndex('members');
    
            const { hits } = await index.search(query, { hitsPerPage: 50 });
    
            const newMarkers = hits
                .filter(hit => 'location.lat' in hit && 'location.lng' in hit && hit['location.lat'] !== "" && hit['location.lng'] !== "")
                .map(hit => ({
                    lng: hit['location.lng'],
                    lat: hit['location.lat'],
                    fullName: hit.fullName,
                    companyName: hit.companyName,
                    photo: hit.photo
                }));
    
            setMarkers(newMarkers);
        };

        fetchMembers();
    }, [query]);

    useEffect(() => {
        if (map) {
            // Create a new array to hold the new markers
            const newMapMarkers = [];
    
            // For each marker data
            markers.forEach(marker => {
                const el = document.createElement('div');
                el.innerHTML = `
                    <div style="display: flex; align-items: center; background-color: #fff; padding: 10px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                        <img src="${marker.photo}" style="width: 50px; height: 50px; border-radius: 50%;" />
                        <div style="margin-left: 10px;">
                            <h3 style="margin: 0;">${marker.fullName}</h3>
                            <p style="margin: 0;">${marker.companyName}</p>
                        </div>
                    </div>
                `;
    
                // Create a new marker and add it to the map
                const mapMarker = new mapboxgl.Marker(el)
                    .setLngLat([marker.lng, marker.lat])
                    .addTo(map);
    
                // Add the new marker to the array
                newMapMarkers.push(mapMarker);
            });
    
            // If there were any previous markers, remove them
            if (mapMarkers) {
                mapMarkers.forEach(marker => marker.remove());
            }
    
            // Update the mapMarkers state with the new markers
            setMapMarkers(newMapMarkers);
        }
    }, [markers, map]);
    
    

    return (
        <div className="relative">
            <SearchBar setMarkers={setMarkers} setQuery={setQuery} />
            <div id="map" className="w-full h-screen" ref={mapContainer} />
        </div>
    );
}

export default MapboxMap;

