"use client";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customIcon = L.divIcon({
  className: "custom-pin",
  html: `<div style="background-color: #D35400; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(211, 84, 0, 0.8);"></div>`,
});

export default function MapComponent() {
  const openMaps = () => {
    window.open("https://www.google.com/maps/dir/?api=1&destination=45.3168,13.5638", "_blank");
  };

  return (
    <div className="relative h-[400px] w-full rounded-[2rem] overflow-hidden border border-neutral-800 shadow-xl">
      <MapContainer center={[45.3178570, 13.5595510]} zoom={15} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <Marker position={[45.3178570, 13.5595510]} icon={customIcon} />
      </MapContainer>
      
      <button 
        onClick={openMaps}
        className="absolute bottom-6 left-6 z-[1000] bg-[#D35400] text-white px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#b04500] transition-colors shadow-lg"
      >
        Upute za dolazak
      </button>
    </div>
  );
}