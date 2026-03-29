import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";

function CountryDrawer({ selectedCountry, countryData, loading, onClose }) {
  if (!selectedCountry) return null;

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <div className="panel-kicker">Country profile</div>
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
            <h3>Relations with North Macedonia</h3>
            <p>
              {countryData?.mk ||
                "No structured North Macedonia assessment is available yet. This section will summarize bilateral relations, political dialogue, regional cooperation, economic ties, and any active diplomatic issues relevant to Skopje."}
            </p>
          </div>

          <div className="section">
            <h3>Current Developments and Top News</h3>
            <ul className="news-list">
              {(countryData?.news || []).map((item, idx) => (
                <li key={idx}>{item.title}</li>
              ))}
            </ul>
          </div>

          <div className="section">
            <h3>Analytical Note</h3>
            <p>
              This panel is designed as the first layer of a broader geopolitical
              intelligence tool. In the next iteration, this area can include AI
              summaries, risk indicators, diplomatic timelines, and source-ranked
              live news so that each country profile becomes a real operational
              brief rather than a simple info card.
            </p>
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
        general:
          countryName +
          " is displayed in the globe platform. A fuller strategic country brief will be shown here in the next iteration, including political context, regional significance, and current diplomatic posture.",
        eu:
          "No structured EU assessment yet for " +
          countryName +
          ". This space will later include a longer analytical summary covering political alignment, accession dynamics, sanctions posture, institutional cooperation, and diplomatic friction points where relevant.",
        usa:
          "No structured USA assessment yet for " +
          countryName +
          ". This section will later summarize bilateral ties, defense links, strategic partnership level, and the most relevant recent developments affecting the relationship with Washington.",
        mk:
          "No structured North Macedonia assessment yet for " +
          countryName +
          ". This section will later include a country-specific bilateral note covering political dialogue, regional cooperation, trade, and any issues of direct relevance for Macedonian foreign policy.",
        news: [
          { title: "Top headlines for " + countryName + " will appear here" },
          { title: "Diplomatic update feed placeholder" },
          { title: "Economic developments placeholder" },
          { title: "Regional affairs placeholder" },
          { title: "Security developments placeholder" }
        ]
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
