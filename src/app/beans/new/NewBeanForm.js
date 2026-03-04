"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const initialState = {
  name: "",
  reviewerName: "",
  roaster: "",
  originCountry: "",
  originRegion: "",
  blend: false,
  process: "",
  roastLevel: "",
  roasterUrl: "",
  ratingScore: "",
  ratingNotes: "",
  ratingPricePaid: "",
};

const COUNTRY_OPTIONS = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

function normalize(value) {
  return (value || "")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;
  const matrix = Array.from({ length: b.length + 1 }, () => []);
  for (let i = 0; i <= b.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= a.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i += 1) {
    for (let j = 1; j <= a.length; j += 1) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
}

function similarity(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;
  const dist = levenshtein(na, nb);
  return 1 - dist / Math.max(na.length, nb.length);
}

function SearchSelect({
  id,
  name,
  label,
  value,
  onChange,
  options,
  required,
  placeholder,
  allowCustom = true,
}) {
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);

  const filtered = useMemo(() => {
    const query = normalize(value);
    if (!query) return options;
    return options.filter((option) => normalize(option).includes(query));
  }, [value, options]);

  const isValidSelection = useMemo(() => {
    if (allowCustom) return true;
    const normalizedValue = normalize(value);
    if (!normalizedValue) return false;
    return options.some((option) => normalize(option) === normalizedValue);
  }, [allowCustom, options, value]);

  function handleSelect(option) {
    onChange({ target: { name, value: option } });
    setOpen(false);
  }

  return (
    <div className="form-row combo">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        value={value}
        onChange={(event) => {
          onChange(event);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setTouched(true);
          setTimeout(() => setOpen(false), 120);
        }}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        aria-invalid={!isValidSelection}
      />
      {!allowCustom && touched && !isValidSelection ? (
        <p className="hint">Choose a value from the list.</p>
      ) : null}
      {open && filtered.length > 0 ? (
        <div
          className="combo-list"
          onMouseDown={(event) => event.preventDefault()}
        >
          {filtered.map((option) => (
            <button
              className="combo-item"
              type="button"
              key={option}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function NewBeanForm({ suggestions }) {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);
  const router = useRouter();
  const countryRegions = suggestions?.countryRegions || [];

  const fuzzyMatches = useMemo(() => {
    const names = suggestions?.names || [];
    const roasters = suggestions?.roasters || [];
    const countries = suggestions?.originCountries || [];
    const regions = suggestions?.originRegions || [];
    const beans = suggestions?.beans || [];

    const bestMatch = (value, list) => {
      if (!value) return null;
      let best = null;
      let score = 0;
      for (const item of list) {
        const s = similarity(value, item);
        if (s > score) {
          score = s;
          best = item;
        }
      }
      return score >= 0.8 ? { value: best, score } : null;
    };

    const nameMatch = bestMatch(form.name, names);
    const roasterMatch = bestMatch(form.roaster, roasters);
    const countryMatch = bestMatch(form.originCountry, countries);
    const regionMatch = bestMatch(form.originRegion, regions);

    const comboMatch = beans.find((bean) => {
      const nameOk = similarity(form.name, bean.name) >= 0.85;
      const roasterOk = similarity(form.roaster, bean.roaster || "") >= 0.85;
      const countryOk = similarity(form.originCountry, bean.origin_country) >= 0.85;
      const regionOk = similarity(form.originRegion, bean.origin_region || "") >= 0.85;
      return nameOk && roasterOk && countryOk && regionOk;
    });

    return {
      nameMatch,
      roasterMatch,
      countryMatch,
      regionMatch,
      comboMatch,
    };
  }, [
    form.name,
    form.roaster,
    form.originCountry,
    form.originRegion,
    suggestions,
  ]);

  const regionOptions = useMemo(() => {
    if (!form.originCountry) {
      return [];
    }
    const countryRegions = suggestions?.countryRegions || [];
    return countryRegions
      .filter(
        (row) => normalize(row.country) === normalize(form.originCountry)
      )
      .map((row) => row.region);
  }, [form.originCountry, suggestions]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleBagImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setAutoFilling(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("bagImage", file);
      const res = await fetch("/api/beans/ocr", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to read the photo.");
      }
      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        name: data.blendName || prev.name,
        roaster: data.roasterName || prev.roaster,
        roasterUrl: data.roasterUrl || prev.roasterUrl,
        originCountry: data.originCountry || prev.originCountry,
        originRegion: data.originRegion || prev.originRegion,
        roastLevel: data.roastLevel || prev.roastLevel,
        process: data.process || prev.process,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setAutoFilling(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const normalizedCountry = normalize(form.originCountry);
      const normalizedRegion = normalize(form.originRegion);
      const allowedCountries = new Set(
        countryRegions.map((row) => normalize(row.country))
      );
      const allowedRegions = new Set(
        countryRegions
          .filter(
            (row) => normalize(row.country) === normalizedCountry
          )
          .map((row) => normalize(row.region))
      );
      if (!normalizedCountry || !allowedCountries.has(normalizedCountry)) {
        setError("Select a valid origin country from the list.");
        setSaving(false);
        return;
      }
      if (normalizedRegion && !allowedRegions.has(normalizedRegion)) {
        setError("Select a valid origin region from the list.");
        setSaving(false);
        return;
      }
      if (!form.roaster.trim()) {
        setError("Roaster name is required.");
        setSaving(false);
        return;
      }
      if (!form.roasterUrl.trim()) {
        setError("Roaster website is required.");
        setSaving(false);
        return;
      }
      if (!form.roastLevel) {
        setError("Roast level is required.");
        setSaving(false);
        return;
      }

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      const bagImage = event.currentTarget.bagImage.files?.[0];
      const coffeeImage = event.currentTarget.coffeeImage.files?.[0];
      if (bagImage) formData.append("bagImage", bagImage);
      if (coffeeImage) formData.append("coffeeImage", coffeeImage);

      const res = await fetch("/api/beans", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to save bean.");
      }

      const data = await res.json();
      router.push(`/beans/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="bagImage">Coffee bag photo *</label>
        <input
          id="bagImage"
          name="bagImage"
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif"
          capture="environment"
          required
          onChange={handleBagImageChange}
        />
        {autoFilling ? <p className="hint">Reading the label…</p> : null}
      </div>

      <SearchSelect
        id="originCountry"
        name="originCountry"
        label="Origin country *"
        value={form.originCountry}
        onChange={updateField}
        options={Array.from(
          new Set(
            (suggestions?.countryRegions || []).map((row) => row.country)
          )
        ).sort()}
        allowCustom={false}
        required
        placeholder="Select a country"
      />
      {fuzzyMatches.countryMatch ? (
        <p className="hint">
          Similar origin country exists: {fuzzyMatches.countryMatch.value}
        </p>
      ) : null}

      <div className="form-row">
        <label htmlFor="reviewerName">Reviewer name</label>
        <input
          id="reviewerName"
          name="reviewerName"
          value={form.reviewerName}
          onChange={updateField}
          placeholder="Your name"
        />
      </div>

      <SearchSelect
        id="originRegion"
        name="originRegion"
        label="Origin region *"
        value={form.originRegion}
        onChange={updateField}
        options={regionOptions}
        allowCustom={false}
        required
        placeholder={
          form.originCountry ? "Select a region" : "Select a country first"
        }
      />
      {fuzzyMatches.regionMatch ? (
        <p className="hint">
          Similar origin region exists: {fuzzyMatches.regionMatch.value}
        </p>
      ) : null}

      <SearchSelect
        id="roaster"
        name="roaster"
        label="Roaster *"
        value={form.roaster}
        onChange={updateField}
        options={suggestions?.roasters || []}
        required
        placeholder="Start typing a roaster"
      />
      {fuzzyMatches.roasterMatch ? (
        <p className="hint">
          Similar roaster exists: {fuzzyMatches.roasterMatch.value}
        </p>
      ) : null}

      <div className="form-row">
        <label htmlFor="roasterUrl">Roaster website *</label>
        <input
          id="roasterUrl"
          name="roasterUrl"
          value={form.roasterUrl}
          onChange={updateField}
          placeholder="https://roaster.com"
          required
        />
      </div>

      <SearchSelect
        id="name"
        name="name"
        label="Blend name *"
        value={form.name}
        onChange={updateField}
        options={suggestions?.names || []}
        required
        placeholder="Start typing a blend name"
      />
      {fuzzyMatches.nameMatch ? (
        <p className="hint">
          Similar name already exists: {fuzzyMatches.nameMatch.value}
        </p>
      ) : null}

        {fuzzyMatches.comboMatch ? (
          <div className="card">
            <p className="muted">
              Possible duplicate: {fuzzyMatches.comboMatch.name} ·{" "}
              {fuzzyMatches.comboMatch.roaster || "Unknown roaster"} ·{" "}
              {fuzzyMatches.comboMatch.origin_country}
              {fuzzyMatches.comboMatch.origin_region
                ? ` · ${fuzzyMatches.comboMatch.origin_region}`
                : ""}
            </p>
            <a className="link" href={`/beans/${fuzzyMatches.comboMatch.id}`}>
              View bean and add your rating →
            </a>
            <p className="muted">
              You can add your own rating with bag and brew photos.
            </p>
          </div>
        ) : null}
      <div className="form-row">
        <label htmlFor="blend">Blend?</label>
        <select
          id="blend"
          name="blend"
          value={form.blend ? "true" : "false"}
          onChange={(event) =>
            updateField({
              target: {
                name: "blend",
                value: event.target.value === "true",
                type: "checkbox",
                checked: event.target.value === "true",
              },
            })
          }
        >
          <option value="false">Single origin</option>
          <option value="true">Blend</option>
        </select>
      </div>

      <div className="form-row">
        <label htmlFor="process">Process</label>
        <select
          id="process"
          name="process"
          value={form.process}
          onChange={updateField}
        >
          <option value="">Select a process</option>
          <option value="Washed">Washed</option>
          <option value="Natural">Natural</option>
          <option value="Honey">Honey</option>
          <option value="Wet-hulled">Wet-hulled</option>
          <option value="Anaerobic">Anaerobic</option>
          <option value="Carbonic maceration">Carbonic maceration</option>
        </select>
      </div>

      <div className="form-row">
        <label htmlFor="roastLevel">
          Roast level *
          <span
            className="tooltip"
            title="How dark the beans were roasted (e.g., light, medium, dark)."
          >
            ?
          </span>
        </label>
        <select
          id="roastLevel"
          name="roastLevel"
          value={form.roastLevel}
          onChange={updateField}
          required
        >
          <option value="">Select a roast</option>
          <option value="Light">Light</option>
          <option value="Light-medium">Light-medium</option>
          <option value="Medium">Medium</option>
          <option value="Medium-dark">Medium-dark</option>
          <option value="Dark">Dark</option>
        </select>
      </div>

      <div className="card">
        <h3>Add an initial rating (optional)</h3>
        <div className="form">
          <div className="form-row">
            <label htmlFor="ratingScore">Score (1-5)</label>
            <select
              id="ratingScore"
              name="ratingScore"
              value={form.ratingScore}
              onChange={updateField}
            >
              <option value="">Select a score</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="ratingPricePaid">Price paid (GBP)</label>
            <input
              id="ratingPricePaid"
              name="ratingPricePaid"
              value={form.ratingPricePaid}
              onChange={updateField}
              type="number"
              step="0.01"
              min="0"
              required={Boolean(form.ratingScore)}
            />
          </div>

          <div className="form-row">
            <label htmlFor="ratingNotes">Tasting notes</label>
            <textarea
              id="ratingNotes"
              name="ratingNotes"
              rows={3}
              value={form.ratingNotes}
              onChange={updateField}
              required={Boolean(form.ratingScore)}
            />
          </div>
        </div>
      </div>

      <div className="form-row">
        <label htmlFor="coffeeImage">Brew photo (optional)</label>
        <input
          id="coffeeImage"
          name="coffeeImage"
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif"
          capture="environment"
        />
      </div>

      {error ? <p className="muted">{error}</p> : null}

      <button className="button" type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Bean"}
      </button>
    </form>
  );
}
