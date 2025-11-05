"use client";

import { useState } from "react";
import axios from "axios";

export default function ProcessPage() {
  const [prompt, setPrompt] = useState("");
  const [height, setHeight] = useState(512);
  const [files, setFiles] = useState([]);
  const [outputImages, setOutputImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [userId, setUserId] = useState("");

  const isDev = true;
  const baseURL = isDev
    ? "https://weclick.dev.api.yonderwonder.ai"
    : "https://weclick.api.yonderwonder.ai";

  const handleProcess = async () => {
    if (!userId) return alert("Please enter your user ID first.");
    if (files.length < 2) return alert("Please upload two images first.");

    setLoading(true);
    setProgress("Creating group...");

    try {
      const groupRes = await axios.post(
        `${baseURL}/v2/group/create`,
        {},
        { params: { user_id: userId } }
      );
      const groupId = groupRes.data.groupId;
      setProgress(`Group created: ${groupId}`);

      const filenames = files.map((f) => f.name);
      const uploadRes = await axios.post(
        `${baseURL}/v2/uploads/generate-upload-urls`,
        { user_id: userId, filenames }
      );
      const uploads = uploadRes.data.upload_urls;
      const blobPaths = uploads.map((u) => u.blob_path);

      setProgress("Uploading images...");
      await Promise.all(
        uploads.map(async (u, i) => {
          await fetch(u.upload_url, {
            method: "PUT",
            headers: {
              "x-ms-blob-type": "BlockBlob",
              "Content-Type": files[i].type,
            },
            body: files[i],
          });
        })
      );

      setProgress("Finalizing uploads...");
      await axios.post(`${baseURL}/v2/uploads/uploads-complete`, {
        blob_paths: blobPaths,
        user_id: userId,
        group_id: groupId,
      });

      setProgress("Starting processing...");
      const processRes = await axios.post(
        `${baseURL}/v2/process/groups/${groupId}`,
        {
          prompt,
          mode: "default",
          generations: 1,
          height_index_list: [height],
        }
      );

      const reqIds = processRes.data.request_ids;
      if (!reqIds || reqIds.length === 0)
        throw new Error("No request IDs returned from processing API.");

      setProgress("Processing images (may take a few minutes)...");
      const interval = setInterval(async () => {
        try {
          const statusRes = await axios.get(`${baseURL}/process/status`, {
            params: { request_ids: reqIds },
          });
          const { status, outputs } = statusRes.data;

          if (status === "done") {
            clearInterval(interval);
            const doneUrls = outputs
              .filter((o) => o.status === "done" && o.url)
              .map((o) => o.url);
            setOutputImages(doneUrls);
            setProgress("Processing complete!");
            setLoading(false);
          } else if (status === "error") {
            clearInterval(interval);
            setProgress("Error during processing. Try again.");
            setLoading(false);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 8000);
    } catch (err) {
      console.error(err);
      setProgress("Something went wrong. Please retry.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgba(25,25,40,1) 0%, rgba(10,10,20,1) 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "20px",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.2)",
          padding: "40px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          color: "#fff",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            textAlign: "center",
            marginBottom: "30px",
            fontWeight: "600",
            letterSpacing: "0.5px",
          }}
        >
          AI Image Processor
        </h1>

        {/* User ID */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <label style={{ fontWeight: "500", width: "100px" }}>User ID:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID"
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "10px",
              border: "none",
              outline: "none",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
            }}
          />
        </div>

        {/* Prompt */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Write your prompt..."
          style={{
            width: "100%",
            minHeight: "100px",
            background: "rgba(255,255,255,0.15)",
            border: "none",
            borderRadius: "10px",
            color: "#fff",
            padding: "12px 16px",
            outline: "none",
            resize: "none",
            marginBottom: "20px",
          }}
        />

        {/* Height */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <label style={{ fontWeight: "500", width: "100px" }}>Height:</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            style={{
              width: "100px",
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              outline: "none",
            }}
          />
        </div>

        {/* File Upload */}
        <div style={{ marginBottom: "25px" }}>
          <label style={{ fontWeight: "500", display: "block", marginBottom: 8 }}>
            Upload two images:
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            style={{
              color: "#ccc",
            }}
          />
        </div>

        {/* Button */}
        <button
          onClick={handleProcess}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            border: "none",
            background: loading
              ? "rgba(0,0,0,0.4)"
              : "linear-gradient(135deg, #4b6cb7 0%, #182848 100%)",
            color: "#fff",
            fontWeight: "600",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "0.3s",
          }}
        >
          {loading ? "Processing..." : "Start Processing"}
        </button>

        {/* Progress */}
        {progress && (
          <p
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontStyle: "italic",
              color: "#ddd",
            }}
          >
            {progress}
          </p>
        )}

        {/* Output Images */}
        {outputImages.length > 0 && (
          <div style={{ marginTop: "30px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "500",
                marginBottom: "15px",
              }}
            >
              Output Images:
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              {outputImages.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`output-${idx}`}
                  style={{
                    width: "100%",
                    borderRadius: "15px",
                    border: "1px solid rgba(255,255,255,0.3)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
