import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";

function CountrySheet({ selectedCountry, countryData, loading, onClose }) {
  if (!selectedCountry) return null;

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div className="sheet-header">
          <div className="sheet-title-wrap">
            <div className="sheet-kicker">Country profile</div>
            <h2>{selectedCountry}</h2>
          </div>

          <button className="close-btn" onClick={onClose}>
            X
          </button>
        </div>

        {loading ? (
          <p className="loading-text">Loading country brief...</p>
        ) : (
          <>
            <div className="section">
              <h3>General Overview</h3>
              <p>
                {countryData?.general ||
                  "No general overview is available yet for this country. This section will contain a concise geopolitical and strategic summary, including the country’s regional role, institutional alignment, and major political dynamics."}
              </p>
            </div>

            <div className="section">
              <h3>Relations with the European Union</h3>
              <p>
                {countryData?.eu ||
                  "No structured EU assessment is available yet. This section will summarize the country’s political relationship with the European Union, status in accession or partnership frameworks, trade and regulatory alignment, and current diplomatic sensitivities."}
              </p>
            </div>

            <div className="section">
              <h3>Relations with the United States</h3>
              <p>
                {countryData?.usa ||
                  "No structured U.S. assessment is available yet. This section will summarize the bilateral strategic relationship, defense and security cooperation, diplomatic positioning, and recent shifts in the policy relationship with Washington."}
              </p>
            </div>

            <div className="section">
              <h3>Relations with Macedonia</h3>
              <p>
                {countryData?.mk ||
                  "No structured Macedonia assessment is available yet. This section will summarize bilateral relations, political dialogue, regional cooperation, economic ties, and any active diplomatic issues relevant to Skopje."}
              </p>
            </div>

            <div className="section">
              <h3>Top Headlines</h3>
              <ul className="news-list">
                {(countryData?.news || []).map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.title}</strong>
                    {item.source ? <div className="news-source">{item.source}</div> : null}
                  </li>
                ))}
              </ul>
            </div>

            <div className="section">
              <h3>Media Analysis</h3>
              <p>
                {countryData?.mediaAnalysis ||
                  "A short AI-generated media analysis will appear here, based on the latest major domestic headlines translated into English and summarized into a concise operational brief."}
              </p>
            </div>

            <div className="section">
              <h3>Потсетник</h3>
              <p>
                {countryData?.reminder ||
                  "Овој дел е резервиран за рачно внесен дипломатски потсетник од трета страна."}
              </p>
            </div>

            <div className="section">
              <h3>Talking Points</h3>
              <p>
                {countryData?.talkingPoints ||
                  "This section is reserved for manually maintained talking points pushed from a third-party editorial/admin workflow."}
              </p>
            </div>
          </>
        )}
      </div>
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
      Macedonia: "Macedonia",
      "North Macedonia": "Macedonia",
      "Republic of Macedonia": "Macedonia",
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
        general:
          countryName +
          " is displayed in the globe platform. A fuller strategic country brief will be shown here in the next iteration, including political context, regional significance, and current diplomatic posture.",
        eu:
          "No structured EU assessment yet for " + countryName + ".",
        usa:
          "No structured USA assessment yet for " + countryName + ".",
        mk:
          "No structured Macedonia assessment yet for " + countryName + ".",
        news: [
          { title: "Top headlines for " + countryName + " will appear here", source: "Pending" },
          { title: "Diplomatic update feed placeholder", source: "Pending" },
          { title: "Economic developments placeholder", source: "Pending" }
        ],
        mediaAnalysis:
          "A five-sentence synthesized media analysis will appear here after live source ingestion and AI processing are connected.",
        reminder:
          "Reserved for third-party input.",
        talkingPoints:
          "Reserved for third-party input."
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

      <CountrySheet
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
