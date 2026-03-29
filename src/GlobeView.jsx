import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";

function CountryFullScreen({ country, data, loading, onClose }) {
  if (!country) return null;

  return (
    <div className="fullscreen">
      <div className="fs-header">
        <div>
          <div className="fs-kicker">Geopolitical Brief</div>
          <h1>{country}</h1>
        </div>

        <button className="fs-close" onClick={onClose}>
          ← Back
        </button>
      </div>

      {loading ? (
        <p className="fs-loading">Loading analysis...</p>
      ) : (
        <div className="fs-content">
          <Section title="General Overview" text={data?.general} />
          <Section title="EU Relations" text={data?.eu} />
          <Section title="USA Relations" text={data?.usa} />
          <Section title="Macedonia Relations" text={data?.mk} />

          <div className="fs-section">
            <h3>Top Headlines</h3>
            <ul>
              {(data?.news || []).map((n, i) => (
                <li key={i}>{n.title}</li>
              ))}
            </ul>
          </div>

          <Section title="Потсетник" text={data?.reminder} />
          <Section title="Talking Points" text={data?.talkingPoints} />
        </div>
      )}
    </div>
  );
}

function Section({ title, text }) {
  return (
    <div className="fs-section">
      <h3>{title}</h3>
      <p>{text || "No data available yet."}</p>
    </div>
  );
}

export default function GlobeView() {
  const globeRef = useRef(null);

  const [countries, setCountries] = useState([]);
  const [hoverD, setHoverD] = useState(null);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = "https://globe-api-42cp.onrender.com";

  useEffect(() => {
    fetch("/countries.geojson")
      .then((res) => res.json())
      .then((d) => setCountries(d.features || []));
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;
    const c = globeRef.current.controls();
    c.autoRotate = false;
  }, []);

  function normalize(name) {
    const map = {
      Macedonia: "Macedonia",
      "North Macedonia": "Macedonia"
    };
    return map[name] || name;
  }

  function getName(f) {
    return normalize(f?.properties?.name || "Unknown");
  }

  async function handleClick(f) {
    const name = getName(f);

    setSelectedCountry(name);
    setLoading(true);
    setData(null);

    try {
      const res = await fetch(API_BASE + "/country/" + encodeURIComponent(name));
      const json = await res.json();
      setData(json);
    } catch {
      setData({});
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!selectedCountry && (
        <Globe
          ref={globeRef}
          width={window.innerWidth}
          height={window.innerHeight}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          polygonsData={countries}
          polygonCapColor={(d) =>
            d === hoverD
              ? "rgba(110,168,255,0.65)"
              : "rgba(80,140,255,0.18)"
          }
          polygonStrokeColor={() => "#fff"}
          onPolygonHover={(d) => setHoverD(d || null)}
          onPolygonClick={handleClick}
        />
      )}

      <CountryFullScreen
        country={selectedCountry}
        data={data}
        loading={loading}
        onClose={() => setSelectedCountry(null)}
      />
    </>
  );
}
