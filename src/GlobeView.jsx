import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";

function CountryDrawer({ selectedCountry, countryData, loading, onClose }) {
  if (!selectedCountry) return null;

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-kicker">Country profile</div>
          <h2>{selectedCountry}</h2>
        </div>

        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : (
        <>
          <div className="section">
            <h3>General</h3>
            <p>{countryData?.general || "No data available."}</p>
          </div>

          <div className="section">
            <h3>EU</h3>
            <p>{countryData?.eu || "No EU data."}</p>
          </div>

          <div className="section">
            <h3>USA</h3>
            <p>{countryData?.usa || "No USA data."}</p>
          </div>

          <div className="section">
            <h3>Macedonia</h3>
            <p>{countryData?.mk || "No MK data."}</p>
          </div>

          <div className="section">
            <h3>News</h3>
            <ul>
              {(countryData?.news || []).map((n, i) => (
                <li key={i}>{n.title}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default function GlobeView() {
  const globeRef = useRef();

  const [countries, setCountries] = useState([]);
  const [hoverD, setHoverD] = useState(null);
  const [selectedCountryFeature, setSelectedCountryFeature] = useState(null);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = "https://globe-api-42cp.onrender.com";

  useEffect(() => {
    fetch("/countries.geojson")
      .then((res) => res.json())
      .then((data) => setCountries(data.features || []));
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;
    globeRef.current.controls().autoRotate = false;
  }, []);

  function normalize(name) {
    if (name === "North Macedonia") return "Macedonia";
    return name;
  }

  function getName(feature) {
    return normalize(feature?.properties?.name || "Unknown");
  }

  async function handleClick(feature) {
    const name = getName(feature);

    setSelectedCountry(name);
    setSelectedCountryFeature(feature);
    setLoading(true);
    setCountryData(null);

    try {
      const res = await fetch(API_BASE + "/country/" + encodeURIComponent(name));
      const json = await res.json();
      setCountryData(json);
    } catch {
      setCountryData({});
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setSelectedCountry(null);
    setSelectedCountryFeature(null);
    setCountryData(null);
  }

  return (
    <>
      <Globe
        ref={globeRef}
        width={window.innerWidth}
        height={window.innerHeight}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        polygonsData={countries}

        /* 🔥 ПОЈАКИ ГРАНИЦИ */
        polygonStrokeColor={() => "rgba(255,255,255,0.75)"}
        polygonStrokeWidth={0.6}

        /* 🎯 COLOR LOGIC */
        polygonCapColor={(d) => {
          if (d === selectedCountryFeature) return "rgba(0,0,0,0)";
          if (d === hoverD) return "rgba(120, 0, 30, 0.35)";
          return "rgba(80,140,255,0.08)";
        }}

        /* 🎯 SELECTED */
        polygonSideColor={(d) =>
          d === selectedCountryFeature
            ? "rgba(120, 0, 30, 1)"
            : "rgba(0,0,0,0)"
        }

        polygonAltitude={(d) => {
          if (d === selectedCountryFeature) return 0.035;
          if (d === hoverD) return 0.02;
          return 0.004;
        }}

        onPolygonHover={(d) => setHoverD(d || null)}
        onPolygonClick={handleClick}
      />

      <CountryDrawer
        selectedCountry={selectedCountry}
        countryData={countryData}
        loading={loading}
        onClose={handleClose}
      />
    </>
  );
}
