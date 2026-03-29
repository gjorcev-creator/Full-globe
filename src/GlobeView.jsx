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

  function getName(f) {
    return normalize(f?.properties?.name || "Unknown");
  }

  async function handleClick(f) {
    const name = getName(f);

    setSelectedCountry(name);
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

  return (
    <>
      <Globe
        ref={globeRef}
        width={window.innerWidth}
        height={window.innerHeight}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"

        polygonsData={countries}

        /* ❌ ТРГНАТИ ЖОЛТИ ЛИНИИ */
        polygonStrokeColor={() => "rgba(0,0,0,0)"}

        /* 🎯 HOVER */
        polygonCapColor={(d) =>
          d === hoverD ? "rgba(120,160,255,0.4)" : "rgba(80,140,255,0.12)"
        }

        /* 🎯 SELECTED → BORDEAU HOLLOW */
        polygonSideColor={(d) =>
          d === selectedCountryFeature
            ? "rgba(120,0,30,0.9)"
            : "rgba(0,0,0,0)"
        }

        polygonAltitude={(d) =>
          d === hoverD ? 0.02 : 0.005
        }

        onPolygonHover={(d) => setHoverD(d || null)}

        onPolygonClick={(d) => {
          handleClick(d);
          selectedCountryFeature = d;
        }}
      />

      <CountryDrawer
        selectedCountry={selectedCountry}
        countryData={countryData}
        loading={loading}
        onClose={() => setSelectedCountry(null)}
      />
    </>
  );
}
