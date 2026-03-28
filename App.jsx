import { useEffect, useMemo, useRef, useState } from 'react';
import GlobeView from './components/GlobeView.jsx';
import CountryDrawer from './components/CountryDrawer.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function App() {
  const globeRef = useRef(null);
  const [countries, setCountries] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [continentMode, setContinentMode] = useState(false);
  const [zoomedContinent, setZoomedContinent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/geo/countries`)
      .then((res) => res.json())
      .then((data) => setCountries(data.features || []))
      .catch((err) => setError(err.message || 'Не успеав да ги вчитам границите.'));
  }, []);

  const countriesByIso = useMemo(() => {
    const map = new Map();
    for (const feature of countries) {
      map.set(feature.properties.ADM0_A3, feature);
    }
    return map;
  }, [countries]);

  async function openCountry(feature) {
    if (!feature) return;
    setSelectedFeature(feature);
    setLoadingProfile(true);
    setError('');

    try {
      const iso3 = feature.properties.ADM0_A3;
      const response = await fetch(`${API_BASE}/country/${iso3}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.details || payload.error || 'Failed to fetch country profile');
      setSelectedProfile(payload);
    } catch (err) {
      setSelectedProfile(null);
      setError(err.message || 'Грешка при вчитување на профилот.');
    } finally {
      setLoadingProfile(false);
    }
  }

  function zoomToContinent(feature) {
    if (!feature || !globeRef.current) return;
    const continent = feature.properties.CONTINENT;
    const members = countries.filter((item) => item.properties.CONTINENT === continent);
    if (!members.length) return;

    const coords = members
      .flatMap((item) => extractCoords(item.geometry))
      .filter(Boolean);

    if (!coords.length) return;

    let latMin = 90;
    let latMax = -90;
    let lngMin = 180;
    let lngMax = -180;

    for (const [lng, lat] of coords) {
      latMin = Math.min(latMin, lat);
      latMax = Math.max(latMax, lat);
      lngMin = Math.min(lngMin, lng);
      lngMax = Math.max(lngMax, lng);
    }

    const centerLat = (latMin + latMax) / 2;
    const centerLng = normalizeLng((lngMin + lngMax) / 2);
    const latSpan = Math.max(8, latMax - latMin);
    const lngSpan = Math.max(8, lngMax - lngMin);
    const maxSpan = Math.max(latSpan, lngSpan);
    const altitude = Math.max(0.9, Math.min(2.1, maxSpan / 45));

    globeRef.current.pointOfView({ lat: centerLat, lng: centerLng, altitude }, 1400);
    setContinentMode(true);
    setZoomedContinent(continent);
    setSelectedFeature(feature);
  }

  function resetView() {
    globeRef.current?.pointOfView({ lat: 20, lng: 10, altitude: 2.4 }, 1200);
    setContinentMode(false);
    setZoomedContinent(null);
    setSelectedFeature(null);
    setSelectedProfile(null);
    setError('');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Iteration 3</p>
          <h1>GeoLens Globe</h1>
          <p className="lede">
            Drag/touch за ротирање. Скрол или pinch за zoom. Double-click на држава за zoom до континент.
            Откако ќе си во континент режим, еднократен клик на држава отвора аналитички панел.
          </p>
        </div>

        <div className="status-card">
          <div>
            <span className="status-label">Режим</span>
            <strong>{continentMode ? `Континент: ${zoomedContinent}` : 'Глобален поглед'}</strong>
          </div>
          <button className="secondary-btn" onClick={resetView}>Reset view</button>
        </div>

        <div className="hint-list">
          <div>
            <strong>1.</strong> Double-click на France, Brazil, India... за брз скок до континент.
          </div>
          <div>
            <strong>2.</strong> Во континент режим кликај држави за drawer со детали.
          </div>
          <div>
            <strong>3.</strong> Додади GNEWS_API_KEY во backend за live вести.
          </div>
        </div>

        {error ? <div className="error-box">{error}</div> : null}
      </aside>

      <main className="globe-stage">
        <GlobeView
          globeRef={globeRef}
          countries={countries}
          selectedFeature={selectedFeature}
          continentMode={continentMode}
          zoomedContinent={zoomedContinent}
          onCountryClick={(feature) => {
            if (continentMode) {
              void openCountry(feature);
            } else {
              setSelectedFeature(feature);
            }
          }}
          onCountryDoubleClick={zoomToContinent}
        />
      </main>

      <CountryDrawer
        open={Boolean(selectedProfile) || loadingProfile}
        loading={loadingProfile}
        onClose={() => {
          setSelectedProfile(null);
          setSelectedFeature(null);
        }}
        payload={selectedProfile}
        feature={selectedFeature}
        fallbackFeature={countriesByIso.get(selectedFeature?.properties?.ADM0_A3)}
      />
    </div>
  );
}

function extractCoords(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.flat();
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.flat(2);
  }
  return [];
}

function normalizeLng(lng) {
  if (lng > 180) return lng - 360;
  if (lng < -180) return lng + 360;
  return lng;
}
