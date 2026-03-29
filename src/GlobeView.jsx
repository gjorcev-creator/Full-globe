import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";

function CountryDrawer({ selectedCountry, countryData, loading, onClose }) {
  if (!selectedCountry) return null;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>{selectedCountry}</h2>
        <button className="close-btn" onClick={onClose}>
          X
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
            <p>{countryData?.eu || "Unavailable"}</p>
          </div>

          <div className="section">
            <h3>USA</h3>
            <p>{countryData?.usa || "Unavailable"}</p>
          </div>

          <div className="section">
            <h3>North Macedonia</h3>
            <p>{countryData?.mk || "Unavailable"}</p>
          </div>

          <div className="section">
            <h3>Top news</h3>
            <ul className="news-list">
              {(countryData?.news || []).map((item, idx) => (
                <li key={idx}>{item.title}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default function GlobeView() {
  const globeRef = useRef(null);

  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [countries, setCountries] = useState([]);
  const [hoverD, setHoverD] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = "https://globe-api-42cp.onrender.com";

  useEffect(() => {
    function onResize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    fetch("/countries.geojson")
      .then((res) => res.json())
      .then((data) => {
        setCountries(data.features || []);
      })
      .catch((err) => {
        console.error("GeoJSON load error:", err);
      });
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;

    const controls = globeRef.current.controls();
    controls.autoRotate = false;
    controls.enablePan = false;

    globeRef.current.pointOfView({ lat: 20, lng: 15, altitude: 2.2 }, 0);
  }, [countries]);

  function normalizeCountryName(name) {
    const map = {
      Macedonia: "North Macedonia",
      "Republic of Macedonia": "North Macedonia",
      "Russian Federation": "Russia",
      "United States of America": "United States",
      "Syrian Arab Republic": "Syria"
    };

    return map[name] || name;
  }

  function getCountryName(feature) {
    const rawName = feature?.properties?.name || "Unknown";
    return normalizeCountryName(rawName);
  }

  async function handleCountryClick(feature) {
    const countryName = getCountryName(feature);

    setSelectedCountry(countryName);
    setLoading(true);
    setCountryData(null);

    try {
      const res = await fetch(
        API_BASE + "/country/" + encodeURIComponent(countryName)
      );
      const json = await res.json();
      setCountryData(json);
    } catch (err) {
      console.error("API fetch error:", err);
      setCountryData({
        general: "No data available for " + countryName + ".",
        eu: "Unavailable",
        usa: "Unavailable",
        mk: "Unavailable",
        news: [{ title: "No news available." }]
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="globe-wrap">
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          atmosphereColor="#4f8cff"
          atmosphereAltitude={0.22}
          polygonsData={countries}
          polygonCapColor={(d) =>
            d === hoverD ? "rgba(110,168,255,0.65)" : "rgba(80,140,255,0.18)"
          }
          polygonSideColor={() => "rgba(0,60,140,0.15)"}
          polygonStrokeColor={() => "rgba(220,235,255,0.95)"}
          polygonAltitude={(d) => (d === hoverD ? 0.03 : 0.01)}
          polygonsTransitionDuration={200}
          polygonLabel={(d) =>
            `<div style="padding:8px 10px;color:white;background:rgba(10,20,40,0.92);border-radius:8px;font-size:13px;">${
              d?.properties?.name || "Unknown"
            }</div>`
          }
          onPolygonHover={(polygon) => setHoverD(polygon || null)}
          onPolygonClick={(polygon) => handleCountryClick(polygon)}
        />
      </div>

      <CountryDrawer
        selectedCountry={selectedCountry}
        countryData={countryData}
        loading={loading}
        onClose={() => {
          setSelectedCountry(null);
          setCountryData(null);
        }}
      />
    </>
  );
}
