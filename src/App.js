import { useState, useEffect, useRef } from "react";
import useDebounce from "./debounce";

// Mock API
const fetchSuggestions = async (query) => {
  if (!query) return [];
  await new Promise((res) => setTimeout(res, 300)); // simulate network
  const data = ["apple", "banana", "orange", "grape", "mango", "pineapple"];
  return data.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase())
  );
};

export default function AutoComplete() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const cache = useRef(new Map());

  useEffect(() => {
    let ignore = false;

    const getResults = async () => {
      if (!debouncedQuery) {
        setResults([]);
        return;
      }

      // Check cache
      if (cache.current.has(debouncedQuery)) {
        setResults(cache.current.get(debouncedQuery));
        return;
      }

      setLoading(true);
      const data = await fetchSuggestions(debouncedQuery);

      if (!ignore) {
        cache.current.set(debouncedQuery, data);
        setResults(data);
        setLoading(false);
      }
    };

    getResults();

    return () => {
      ignore = true; // prevents race condition
    };
  }, [debouncedQuery]);

  return (
    <div style={{ width: 300, margin: "50px auto" }}>
      <input
        type="text"
        placeholder="Search fruits..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: "100%", padding: 8 }}
      />

      {loading && <div>Loading...</div>}

      {results.length > 0 && (
        <ul style={{ border: "1px solid #ccc", marginTop: 4 }}>
          {results.map((item, index) => (
            <li
              key={index}
              style={{ padding: 6, cursor: "pointer" }}
              onClick={() => setQuery(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
