"use client";

import { useMemo, useState } from "react";

function normalize(value) {
  return (value || "")
    .toString()
    .trim()
    .toLowerCase();
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

export default function BeansList({ beans, initialFilters = {} }) {
  const [filters, setFilters] = useState(() => ({
    search: "",
    country: "",
    region: "",
    blend: "",
    process: "",
    roast: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
    ...initialFilters,
  }));

  const countries = useMemo(
    () => unique(beans.map((bean) => bean.origin_country)),
    [beans]
  );
  const regions = useMemo(() => {
    if (!filters.country) {
      return unique(beans.map((bean) => bean.origin_region));
    }
    return unique(
      beans
        .filter((bean) => bean.origin_country === filters.country)
        .map((bean) => bean.origin_region)
    );
  }, [beans, filters.country]);
  const processes = useMemo(
    () => unique(beans.map((bean) => bean.process)),
    [beans]
  );
  const roasts = useMemo(
    () => unique(beans.map((bean) => bean.roast_level)),
    [beans]
  );

  const filtered = useMemo(() => {
    const query = normalize(filters.search);
    return beans.filter((bean) => {
      if (query) {
        const haystack = [bean.name, bean.roaster, bean.origin_country, bean.origin_region]
          .map(normalize)
          .join(" ");
        if (!haystack.includes(query)) return false;
      }
      if (filters.country && bean.origin_country !== filters.country) return false;
      if (filters.region && bean.origin_region !== filters.region) return false;
      if (filters.process && bean.process !== filters.process) return false;
      if (filters.roast && bean.roast_level !== filters.roast) return false;
      if (filters.blend === "blend" && !bean.blend) return false;
      if (filters.blend === "single" && bean.blend) return false;
      if (filters.minPrice) {
        const minPrice = Number(filters.minPrice);
        if (!Number.isFinite(minPrice)) return false;
        const price = Number(bean.price_usd);
        if (!Number.isFinite(price) || price < minPrice) return false;
      }
      if (filters.maxPrice) {
        const maxPrice = Number(filters.maxPrice);
        if (!Number.isFinite(maxPrice)) return false;
        const price = Number(bean.price_usd);
        if (!Number.isFinite(price) || price > maxPrice) return false;
      }
      if (filters.minRating) {
        const minRating = Number(filters.minRating);
        if (!Number.isFinite(minRating)) return false;
        const rating = Number(bean.avg_score);
        if (!Number.isFinite(rating) || rating < minRating) return false;
      }
      return true;
    });
  }, [beans, filters]);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <section className="bean-list">
      <div className="card filter-bar">
        <div className="form-row">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            name="search"
            value={filters.search}
            onChange={updateFilter}
            placeholder="Name, roaster, country, region"
          />
        </div>
        <div className="form-row">
          <label htmlFor="country">Country</label>
          <select id="country" name="country" value={filters.country} onChange={updateFilter}>
            <option value="">All</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label htmlFor="region">Region</label>
          <select id="region" name="region" value={filters.region} onChange={updateFilter}>
            <option value="">All</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label htmlFor="blend">Type</label>
          <select id="blend" name="blend" value={filters.blend} onChange={updateFilter}>
            <option value="">All</option>
            <option value="blend">Blend</option>
            <option value="single">Single origin</option>
          </select>
        </div>
        <div className="form-row">
          <label htmlFor="process">Process</label>
          <select id="process" name="process" value={filters.process} onChange={updateFilter}>
            <option value="">All</option>
            {processes.map((process) => (
              <option key={process} value={process}>
                {process}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label htmlFor="roast">Roast</label>
          <select id="roast" name="roast" value={filters.roast} onChange={updateFilter}>
            <option value="">All</option>
            {roasts.map((roast) => (
              <option key={roast} value={roast}>
                {roast}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label htmlFor="minPrice">Min price (GBP)</label>
          <input
            id="minPrice"
            name="minPrice"
            type="number"
            step="0.01"
            min="0"
            value={filters.minPrice}
            onChange={updateFilter}
            placeholder="0.00"
          />
        </div>
        <div className="form-row">
          <label htmlFor="maxPrice">Max price (GBP)</label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            step="0.01"
            min="0"
            value={filters.maxPrice}
            onChange={updateFilter}
            placeholder="25.00"
          />
        </div>
        <div className="form-row">
          <label htmlFor="minRating">Min rating</label>
          <input
            id="minRating"
            name="minRating"
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={filters.minRating}
            onChange={updateFilter}
            placeholder="4.0"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="muted">No beans match those filters.</p>
      ) : (
        <div className="bean-rows">
          {filtered.map((bean) => (
            <details className="bean-row" key={bean.id}>
              <summary>
                <div>
                  <h3>{bean.name}</h3>
                  <p className="muted">
                    {bean.origin_country}
                    {bean.origin_region ? ` · ${bean.origin_region}` : ""}
                  </p>
                </div>
                <div>
                  <p className="rating">
                    {Number.isFinite(Number(bean.avg_score))
                      ? Number(bean.avg_score).toFixed(1)
                      : "0.0"}
                    ★
                  </p>
                  <p className="muted">{bean.rating_count} ratings</p>
                </div>
              </summary>
              <div className="bean-row-body">
                {bean.reviewer_name ? (
                  <p className="muted">Reviewed by {bean.reviewer_name}</p>
                ) : null}
                {bean.roaster ? <p><strong>Roaster:</strong> {bean.roaster}</p> : null}
                {bean.roaster_url ? (
                  <p>
                    <a className="link" href={bean.roaster_url} target="_blank" rel="noreferrer">
                      Visit roaster website
                    </a>
                  </p>
                ) : null}
                <div className="bean-row-grid">
                  <p><strong>Type:</strong> {bean.blend ? "Blend" : "Single origin"}</p>
                  {bean.process ? <p><strong>Process:</strong> {bean.process}</p> : null}
                  {bean.roast_level ? <p><strong>Roast:</strong> {bean.roast_level}</p> : null}
                  {Number.isFinite(Number(bean.price_usd)) ? (
                    <p><strong>Price:</strong> £{Number(bean.price_usd).toFixed(2)}</p>
                  ) : null}
                </div>
                {bean.flavor_notes ? (
                  <p><strong>Tasting notes:</strong> {bean.flavor_notes}</p>
                ) : null}
                {(bean.bag_image_type || bean.coffee_image_type) && (
                  <div className="photo-grid">
                    {bean.bag_image_type && (
                      <a
                        href={`/api/beans/${bean.id}/image?kind=bag`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          className="bean-photo"
                          src={`/api/beans/${bean.id}/image?kind=bag`}
                          alt="Bag"
                        />
                      </a>
                    )}
                    {bean.coffee_image_type && (
                      <a
                        href={`/api/beans/${bean.id}/image?kind=coffee`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          className="bean-photo"
                          src={`/api/beans/${bean.id}/image?kind=coffee`}
                          alt="Brew"
                        />
                      </a>
                    )}
                  </div>
                )}
                <a className="link" href={`/beans/${bean.id}`}>
                  Open full detail →
                </a>
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
