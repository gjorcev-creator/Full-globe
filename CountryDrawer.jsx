export default function CountryDrawer(props) {
  const { countryData, selectedCountry, onClose, loading } = props;

  if (!selectedCountry) return null;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>{selectedCountry}</h2>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        countryData && (
          <>
            <div className="section">
              <h3>General</h3>
              <p>{countryData.general}</p>
            </div>

            <div className="section">
              <h3>EU</h3>
              <p>{countryData.eu}</p>
            </div>

            <div className="section">
              <h3>USA</h3>
              <p>{countryData.usa}</p>
            </div>

            <div className="section">
              <h3>North Macedonia</h3>
              <p>{countryData.mk}</p>
            </div>

            <div className="section">
              <h3>Top news</h3>
              <ul className="news-list">
                {(countryData.news || []).map((item, idx) => (
                  <li key={idx}>{item.title}</li>
                ))}
              </ul>
            </div>
          </>
        )
      )}
    </div>
  );
}
