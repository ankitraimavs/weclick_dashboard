"use client";

import { useEffect, useState } from "react";
import { ENV_CONFIG } from "../../../config";

export default function FeedbackCards() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const { API_BASE } = ENV_CONFIG["dev"];

  useEffect(() => {
    fetch(`${API_BASE}/dashboard/api/feedback`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching feedback:", err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "white", fontSize: "1.2rem", fontWeight: "bold" }}>
        Loading Feedback...
      </div>
    );

  if (Object.keys(data).length === 0)
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#aaa", fontSize: "1.1rem" }}>
        No Feedback Available
      </div>
    );

  return (
    <div style={{ width: "100%", minHeight: "100vh", backgroundColor: "#1a1a1a", color: "white", padding: "24px", boxSizing: "border-box" }}>
      <h1 style={{ textAlign: "center", fontSize: "2.5rem", fontWeight: "bold", color: "#4ade80", marginBottom: "24px" }}>
        Feedback Dashboard
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {Object.entries(data).reverse().map(([groupId, generations]) =>
          Object.entries(generations).map(([genId, feedbackArr]) =>
            feedbackArr.map((fb, index) => (
              <div
                key={fb.feedback_id}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "12px",
                  backgroundColor: "#2c2c2c",
                  borderRadius: "12px",
                  padding: "16px",
                  minHeight: "80px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.7)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.5)")}
              >
                {/* Group ID */}
                <div style={{ flex: "1", minWidth: "120px", color: "#4ade80", fontWeight: "600" }}>
                  Group: {groupId}
                </div>

                {/* User Email */}
                <div style={{ flex: "1", minWidth: "160px", color: "#4ade80", fontWeight: "600" }}>
                  {fb.user_email}
                </div>

                {/* Rating */}
                <div style={{ flex: "0.5", minWidth: "80px", color: "#4ade80", fontWeight: "600" }}>
                  {fb.rating} ({fb.stars})
                </div>

                {/* Review */}
                <div
                  style={{
                    flex: "2",
                    minWidth: "200px",
                    color: "#ddd",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={fb.text_feedback}
                >
                  {fb.text_feedback || "—"}
                </div>

                {/* Image */}
                <div style={{ flex: "0.5", minWidth: "80px", maxWidth: "100px" }}>
                  {fb.generated_url ? (
                    <a href={fb.generated_url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={fb.generated_url}
                        alt={`Generated for ${genId}`}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
                        }}
                        loading={index < 3 ? "eager" : "lazy"} 
                      />
                    </a>
                  ) : (
                    "—"
                  )}
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
