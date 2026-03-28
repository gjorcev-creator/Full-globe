import Globe from 'react-globe.gl';
import { useMemo } from 'react';

export default function GlobeView({
  globeRef,
  countries,
  selectedFeature,
  continentMode,
  zoomedContinent,
  onCountryClick,
  onCountryDoubleClick
}) {
  const filteredCountries = useMemo(() => {
    if (!continentMode || !zoomedContinent) return countries;
    return countries.filter((feature) => feature.properties.CONTINENT === zoomedContinent);
  }, [continentMode, countries, zoomedContinent]);

  return (
    <Globe
      ref={globeRef}
      width={typeof window === 'undefined' ? 900 : window.innerWidth - 360}
      height={typeof window === 'undefined' ? 900 : window.innerHeight}
      backgroundColor="#020817"
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      polygonsData={filteredCountries}
      polygonAltitude={(feature) => {
        const iso = feature.properties.ADM0_A3;
        const selectedIso = selectedFeature?.properties?.ADM0_A3;
        return iso === selectedIso ? 0.06 : 0.015;
      }}
      polygonCapColor={(feature) => {
        const isSelected = feature.properties.ADM0_A3 === selectedFeature?.properties?.ADM0_A3;
        if (isSelected) return 'rgba(96,165,250,0.85)';
        if (continentMode) return 'rgba(148,163,184,0.55)';
        return 'rgba(148,163,184,0.35)';
      }}
      polygonSideColor={() => 'rgba(59,130,246,0.12)'}
      polygonStrokeColor={() => 'rgba(255,255,255,0.65)'}
      polygonLabel={(feature) => `
        <div style="padding:8px 10px;background:#0f172a;color:#fff;border-radius:10px;border:1px solid rgba(255,255,255,.12)">
          <div style="font-weight:700">${feature.properties.NAME}</div>
          <div style="font-size:12px;opacity:.8">${feature.properties.CONTINENT} · ${feature.properties.SUBREGION}</div>
          <div style="font-size:12px;opacity:.8">Double click → zoom</div>
        </div>
      `}
      onPolygonClick={onCountryClick}
      onPolygonDoubleClick={onCountryDoubleClick}
      polygonsTransitionDuration={220}
      atmosphereColor="#60a5fa"
      atmosphereAltitude={0.18}
      enablePointerInteraction={true}
      onGlobeReady={() => {
        globeRef.current?.pointOfView({ lat: 20, lng: 10, altitude: 2.4 }, 0);
      }}
    />
  );
}
