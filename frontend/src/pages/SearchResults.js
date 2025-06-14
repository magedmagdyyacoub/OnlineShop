import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query");

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchResults();
  }, [query]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Search Results for "{query}"</h2>
      {loading ? (
        <p>Loading...</p>
      ) : results.length > 0 ? (
        <ul>
          {results.map((item, index) => {
            let link = "#";
            if (item.type === "product") {
              link = `/product/${item.id}`;
            } else if (item.type === "category") {
              link = `/category/${item.id}`;
            } else if (item.type === "brand") {
              link = `/brand/${item.id}`;
            }

            return (
              <li key={index} style={{ marginBottom: "15px" }}>
                <h4>
                  <Link to={link}>{item.name}</Link> ({item.type})
                </h4>
                {item.description && <p>{item.description}</p>}
                {item.price && <p><strong>Price:</strong> ${item.price}</p>}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
};

export default SearchResults;
