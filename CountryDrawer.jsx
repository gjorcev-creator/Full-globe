export default function CountryDrawer({ open, loading, onClose, payload, feature }) {
  return (
    <section className={`drawer ${open ? 'open' : ''}`}>
      <div className="drawer-header">
        <div>
          <p className="eyebrow">Country brief</p>
          <h2>{payload?.profile?.name || feature?.properties?.NAME || 'Select a country'}</h2>
        </div>
        <button className="icon-btn" onClick={onClose}>×</button>
      </div>

      {loading ? <div className="skeleton">Вчитувам профил...</div> : null}

      {!loading && payload?.profile ? (
        <>
          <div className="meta-grid">
            <Stat label="Capital" value={payload.profile.capital} />
            <Stat label="Region" value={payload.profile.region} />
            <Stat label="Subregion" value={payload.profile.subregion} />
            <Stat label="Population" value={formatNumber(payload.profile.population)} />
            <Stat label="Area" value={`${formatNumber(payload.profile.area)} km²`} />
            <Stat label="Languages" value={payload.profile.languages.join(', ') || 'N/A'} />
          </div>

          <div className="section-block">
            <h3>General info</h3>
            <p>
              <strong>{payload.profile.officialName}</strong> со главен град <strong>{payload.profile.capital}</strong>,
              лоцирана во <strong>{payload.profile.subregion}</strong>.
            </p>
          </div>

          <div className="section-block">
            <h3>Relations</h3>
            <InfoCard title="ЕУ" text={payload.profile.relations.eu} />
            <InfoCard title="САД" text={payload.profile.relations.usa} />
            <InfoCard title="Северна Македонија" text={payload.profile.relations.macedonia} />
          </div>

          <div className="section-block">
            <div className="section-headline">
              <h3>Top 5 daily news</h3>
              {payload.news.note ? <span className="muted-tag">setup required</span> : null}
            </div>
            {payload.news.note ? <p className="muted-copy">{payload.news.note}</p> : null}
            <div className="news-list">
              {payload.news.items.length ? payload.news.items.map((item) => (
                <a className="news-item" key={`${item.url}-${item.publishedAt}`} href={item.url} target="_blank" rel="noreferrer">
                  <strong>{item.title}</strong>
                  <span>{item.source}</span>
                  <small>{new Date(item.publishedAt).toLocaleString('mk-MK')}</small>
                </a>
              )) : <p className="muted-copy">Нема live вести додека не внесеш GNews API key.</p>}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InfoCard({ title, text }) {
  return (
    <div className="info-card">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

function formatNumber(value) {
  if (value == null) return 'N/A';
  return new Intl.NumberFormat('mk-MK').format(value);
}
