"use client";

import { useState, useCallback, useEffect, memo } from "react";
import axios from "axios";
import { ENV_CONFIG } from "../../../config";

const DARK_BG_COLOR = "#1a1a2e";
const CARD_BG = "rgba(40, 40, 60, 0.6)";
const ACCENT_COLOR = "#66b3ff";
const TEXT_COLOR = "#f0f0f0";
const BORDER_COLOR = "rgba(255, 255, 255, 0.1)";
const INPUT_BG = "rgba(255, 255, 255, 0.05)";

const glassStyle = {
  background: CARD_BG,
  borderRadius: "16px",
  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: `1px solid ${BORDER_COLOR}`,
};

const FileUploadCard = memo(({ label, file, setFile }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [file]);

  return (
    <div
      style={{
        flex: 1,
        padding: "15px",
        borderRadius: "10px",
        textAlign: "center",
        background: file ? "rgba(50, 70, 90, 0.4)" : "rgba(40, 60, 80, 0.3)",
        border: `1px solid ${BORDER_COLOR}`,
        minHeight: "240px",
        position: "relative",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      }}
    >
      <label
        style={{
          fontWeight: "bold",
          display: "block",
          marginBottom: "8px",
          color: TEXT_COLOR,
        }}
      >
        {label}
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        style={{
          display: file ? "none" : "block",
          margin: "0 auto",
          color: TEXT_COLOR,
          border: `1px solid ${BORDER_COLOR}`,
          padding: "5px",
          borderRadius: "5px",
        }}
      />

      {file && (
        <div
          style={{
            fontSize: "14px",
            color: TEXT_COLOR,
            marginBottom: "8px",
            wordBreak: "break-all",
          }}
        >
          Uploaded: {file.name.substring(0, 25)}
          <button
            onClick={() => setFile(null)}
            style={{
              marginLeft: "10px",
              background: "rgba(220, 53, 69, 0.2)",
              border: `1px solid #dc3545`,
              color: "#ff8080",
              cursor: "pointer",
              fontSize: "12px",
              padding: "2px 5px",
              borderRadius: "3px",
              transition: "all 0.2s",
            }}
          >
            Remove
          </button>
        </div>
      )}

      <div
        style={{
          width: "200px",
          height: "200px",
          margin: "0 auto",
          borderRadius: "5px",
          border: `1px solid ${preview ? BORDER_COLOR : "transparent"}`,
          overflow: "hidden",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border-color 0.3s ease-out",
        }}
      >
        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              animation: "fadeIn 0.4s ease-out",
            }}
          />
        )}
      </div>
    </div>
  );
});
FileUploadCard.displayName = "FileUploadCard";

export default function ProcessPage() {
  const [prompt, setPrompt] = useState("");
  const [displayPrompt, setDisplayPrompt] = useState("");

  const [height1, setHeight1] = useState(150);
  const [height2, setHeight2] = useState(150);
  const [height3, setHeight3] = useState(150);
  const [height4, setHeight4] = useState(150);

  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [file3, setFile3] = useState(null);
  const [file4, setFile4] = useState(null);

  const [error, setError] = useState("");

  const [outputImages, setOutputImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [timings, setTimings] = useState([]);

  const [userEmail, setUserEmail] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [preloading, setPreloading] = useState(true);

  const [env, setEnv] = useState("dev"); // default dev
  const { API_BASE, AUTH_TOKEN, USER_ID } = ENV_CONFIG[env];

  const normalizeHeight = (value, min, max) => {
    const raw = 0.4 + ((value - min) / (max - min)) * (1.0 - 0.4);
    return Math.round(raw * 10) / 10;
  };

  const toggleEnv = () => setEnv(env === "dev" ? "prod" : "dev");

  const handleClear = useCallback(() => {
    setPrompt("");
    setDisplayPrompt("");
    setHeight1(150);
    setHeight2(150);
    setHeight3(150);
    setHeight4(150);
    setFile1(null);
    setFile2(null);
    setFile3(null);
    setFile4(null);
    setOutputImages([]);
    setLoading(false);
    setProgress("");
    setTimings([]);
    setError("");
  }, []);

  useEffect(() => {
    const email = localStorage.getItem("email");
    setUserEmail(email);
    if (email && email.endsWith("@yonderwonder.ai")) {
      setAuthorized(true);
    }
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search); // client-side only

    const rawPrompt = searchParams.get("prompt") || "";
    const decodedPrompt = decodeURIComponent(rawPrompt);
    setPrompt(decodedPrompt);
    setDisplayPrompt(decodedPrompt);

    const incomingInput1 = searchParams.get("input1") || "";
    const incomingInput2 = searchParams.get("input2") || "";
    const incomingInput3 = searchParams.get("input3") || "";
    const incomingInput4 = searchParams.get("input4") || "";

    const fetchImage = async (url) => {
      const res = await fetch(url);
      const blob = await res.blob();
      // create a name based on url so uploads have distinct names
      const name = url.split("/").pop().split("?")[0] || "input_from_group.jpg";
      return new File([blob], name, { type: blob.type });
    };

    const preloadImages = async () => {
      try {
        if (incomingInput1) {
          const file1Obj = await fetchImage(incomingInput1);
          setFile1(file1Obj);
        }
        if (incomingInput2) {
          const file2Obj = await fetchImage(incomingInput2);
          setFile2(file2Obj);
        }
        if (incomingInput3) {
          const file3Obj = await fetchImage(incomingInput3);
          setFile3(file3Obj);
        }
        if (incomingInput4) {
          const file4Obj = await fetchImage(incomingInput4);
          setFile4(file4Obj);
        }
      } catch (err) {
        console.error("Error loading input images:", err);
      } finally {
        setPreloading(false);
      }
    };

    preloadImages();
  }, []);

  if (preloading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: DARK_BG_COLOR,
          color: ACCENT_COLOR,
          fontSize: "18px",
          fontWeight: "600",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            width: "200px",
            height: "6px",
            background: INPUT_BG,
            borderRadius: "3px",
            overflow: "hidden",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              width: "60%",
              height: "100%",
              background: ACCENT_COLOR,
              borderRadius: "3px",
              animation: "loadingBar 1.5s infinite ease-in-out",
            }}
          />
        </div>
        Loading images and prompt...
        <style>
          {`
            @keyframes loadingBar {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(0); }
              100% { transform: translateX(100%); }
            }
            
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
          `}
        </style>
      </div>
    );
  }

const handleProcess = async () => {

  if (!file1 || !file2) return alert("Please upload the first two images.");
  setError("");


  const filesToUpload = [file1, file2, file3, file4].filter(Boolean);

  setLoading(true);
  setOutputImages([]);
  setTimings([]);
  let stepTimings = [];

  let processingStartTime = 0;

  try {
    const headers = {
      Authorization: `Bearer ${AUTH_TOKEN}`,
    };

    // Step 1: Create group
    let start = performance.now();
    setProgress("Creating group...");
    const groupRes = await axios.post(
      `${API_BASE}/v2/group/create`,
      null,
      { params: { user_id: USER_ID }, headers }
    );
    const groupId = groupRes.data.groupId;
    let end = performance.now();
    stepTimings.push({
      step: "Create group",
      time: ((end - start) / 1000).toFixed(2) + "s",
    });

    // Step 2: Generate upload URLs
    start = performance.now();
    setProgress("Generating upload URLs...");
    const uploads = await Promise.all(
      filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append("user_id", USER_ID.toString());
        formData.append("filename", file.name);

        const res = await axios.post(
          `${API_BASE}/v2/uploads/generate-upload-url`,
          formData,
          { headers }
        );
        return res.data;
      })
    );
    end = performance.now();
    stepTimings.push({
      step: "Generate upload URLs",
      time: ((end - start) / 1000).toFixed(2) + "s",
    });
    const blobPaths = uploads.map((u) => u.blob_path);

    // Step 3: Upload images
    start = performance.now();
    setProgress("Uploading images...");
    await Promise.all(
      uploads.map((u, i) =>
        fetch(u.upload_url, {
          method: "PUT",
          headers: {
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": filesToUpload[i].type,
          },
          body: filesToUpload[i],
        })
      )
    );
    end = performance.now();
    stepTimings.push({
      step: "Upload images",
      time: ((end - start) / 1000).toFixed(2) + "s",
    });

    // Step 4: Finalize uploads
    start = performance.now();
    setProgress("Finalizing uploads...");
    const finalizeForm = new FormData();
    blobPaths.forEach((path) => finalizeForm.append("blob_paths", path));
    finalizeForm.append("user_id", USER_ID.toString());
    finalizeForm.append("group_id", groupId.toString());

    await axios.post(
      `${API_BASE}/v2/uploads/uploads-complete`,
      finalizeForm,
      { headers }
    );
    end = performance.now();
    stepTimings.push({
      step: "Finalize uploads",
      time: ((end - start) / 1000).toFixed(2) + "s",
    });

    // Step 5: Start processing
    start = performance.now();
    setProgress("Starting processing...");
    const normalizedHeights = [
      normalizeHeight(height1, 140, 160),
      normalizeHeight(height2, 140, 160),
      normalizeHeight(height3, 140, 160),
      normalizeHeight(height4, 140, 160),
    ].slice(0, filesToUpload.length); // only for uploaded files

    const promptToSend = displayPrompt.trim() || prompt;

    const processRes = await axios.post(
      `${API_BASE}/v2/process/groups/${groupId}`,
      {
        prompt: promptToSend,
        mode: "full_body",
        generations: filesToUpload.length, // match uploaded files
        height_index_list: normalizedHeights,
      },
      { headers: { ...headers, "Content-Type": "application/json" } }
    );

    const reqIds = processRes.data.request_ids;
    if (!reqIds || reqIds.length === 0)
      throw new Error("No request IDs returned from processing API.");
    end = performance.now();
    stepTimings.push({
      step: "Start processing",
      time: ((end - start) / 1000).toFixed(2) + "s",
    });

    processingStartTime = performance.now();

    setProgress("Processing images (may take a few minutes)...");
    const pollStatus = async (reqIds) => {
      try {
        const params = new URLSearchParams();
        reqIds.forEach((id) => params.append("request_ids", id));

        const statusRes = await axios.get(
          `${API_BASE}/process/status?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
          }
        );

        const { status, outputs } = statusRes.data;

        if (status === "done") {
          const generationEnd = performance.now();
          stepTimings.push({
            step: "Pipeline Processing",
            time: ((generationEnd - processingStartTime) / 1000).toFixed(2) + "s",
          });

          const doneUrls = outputs
            .filter((o) => o.status === "done" && o.url)
            .map((o) => o.url);
          setOutputImages(doneUrls);
          setProgress("Processing complete.");
          setLoading(false);
          setTimings(stepTimings);
        } else if (status === "error") {
          setProgress("Error during processing. Try again.");
          setLoading(false);
        } else {
          setTimeout(() => pollStatus(reqIds), 8000);
        }
      } catch (err) {
        console.error("Polling error:", err);
        setProgress("Polling encountered an error. Retrying...");
        setTimeout(() => pollStatus(reqIds), 8000);
      }
    };
    pollStatus(reqIds);
  } catch (err) {
    console.error(err);

    let message = "Something went wrong. Please retry.";

    if (axios.isAxiosError(err)) {
      if (err.response) {
        message = `Error ${err.response.status}: ${
          err.response.data?.message || err.response.statusText
        }`;
      } else if (err.request) {
        message = "Network error: No response from server.";
      } else {
        message = `Request error: ${err.message}`;
      }
    } else if (err instanceof Error) {
      message = err.message;
    }

    setError(message);
    setProgress("Something went wrong. Please retry.");
    setLoading(false);
  }
};


  // --- Unauthorized Screen (Styled) ---
  if (!authorized) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: DARK_BG_COLOR,
          color: "#dc3545",
          fontSize: "18px",
          fontWeight: "600",
          textAlign: "center",
          lineHeight: "1.5",
        }}
      >
        <div>
          Not authorized to access this page.
          <br />
          Please use your @yonderwonder.ai email.
        </div>
      </div>
    );
  }

  // --- Main Component Render (Styled) ---
  return (
    <div
      style={{
        minHeight: "100vh",
        background: DARK_BG_COLOR,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      {/* --- Global animation styles --- */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>

      <div
        style={{
          ...glassStyle,
          width: "100%",
          maxWidth: "1000px",
          padding: "30px",
          color: TEXT_COLOR,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "30px",
        }}
      >
        {/* --- Left Column: Inputs --- */}
        <div>
          {error && (
            <div
              style={{
                background: "rgba(220, 53, 69, 0.15)",
                border: "1px solid #dc3545",
                color: "#ff8080",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "14px",
                lineHeight: "1.5",
                transition: "all 0.3s ease-out",
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* 1. Upload Images */}
          <div style={{ marginBottom: "20px" }}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "10px",
                color: ACCENT_COLOR,
              }}
            >
              1. Upload Images
            </h2>

            {/* 2x2 grid of upload boxes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <FileUploadCard label="Image 1" file={file1} setFile={setFile1} />
              <FileUploadCard label="Image 2" file={file2} setFile={setFile2} />
              <FileUploadCard label="Image 3" file={file3} setFile={setFile3} />
              <FileUploadCard label="Image 4" file={file4} setFile={setFile4} />
            </div>
          </div>

          {/* 2. Prompt Section */}
          <div style={{ marginBottom: "20px" }}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "10px",
                color: ACCENT_COLOR,
              }}
            >
              2. Prompt
            </h2>
            <textarea
              value={displayPrompt}
              onChange={(e) => setDisplayPrompt(e.target.value)}
              placeholder="Enter your description here..."
              style={{
                width: "100%",
                minHeight: "100px",
                border: `1px solid ${BORDER_COLOR}`,
                borderRadius: "5px",
                color: TEXT_COLOR,
                background: INPUT_BG,
                padding: "10px",
                outline: "none",
                resize: "vertical",
                transition: "background 0.2s, border-color 0.2s",
              }}
            />
          </div>

          {/* 3. Height Adjustment Section */}
          <div style={{ marginBottom: "25px" }}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "10px",
                color: ACCENT_COLOR,
              }}
            >
              3. Height Adjustment (cm)
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
              }}
            >
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                    color: TEXT_COLOR,
                  }}
                >
                  Image 1:
                </label>
                <input
                  type="number"
                  value={height1}
                  onChange={(e) => setHeight1(Number(e.target.value))}
                  min="140"
                  max="160"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "5px",
                    border: `1px solid ${BORDER_COLOR}`,
                    outline: "none",
                    background: INPUT_BG,
                    color: TEXT_COLOR,
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                    color: TEXT_COLOR,
                  }}
                >
                  Image 2:
                </label>
                <input
                  type="number"
                  value={height2}
                  onChange={(e) => setHeight2(Number(e.target.value))}
                  min="140"
                  max="160"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "5px",
                    border: `1px solid ${BORDER_COLOR}`,
                    outline: "none",
                    background: INPUT_BG,
                    color: TEXT_COLOR,
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                    color: TEXT_COLOR,
                  }}
                >
                  Image 3:
                </label>
                <input
                  type="number"
                  value={height3}
                  onChange={(e) => setHeight3(Number(e.target.value))}
                  min="140"
                  max="160"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "5px",
                    border: `1px solid ${BORDER_COLOR}`,
                    outline: "none",
                    background: INPUT_BG,
                    color: TEXT_COLOR,
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                    color: TEXT_COLOR,
                  }}
                >
                  Image 4:
                </label>
                <input
                  type="number"
                  value={height4}
                  onChange={(e) => setHeight4(Number(e.target.value))}
                  min="140"
                  max="160"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "5px",
                    border: `1px solid ${BORDER_COLOR}`,
                    outline: "none",
                    background: INPUT_BG,
                    color: TEXT_COLOR,
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleProcess}
              disabled={loading || !file1 || !file2}
              style={{
                flex: 3,
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                background:
                  loading || !file1 || !file2
                    ? "rgba(100, 100, 100, 0.6)"
                    : ACCENT_COLOR,
                color: loading || !file1 || !file2 ? "#aaa" : DARK_BG_COLOR,
                fontWeight: "700",
                fontSize: "16px",
                cursor: loading || !file1 || !file2 ? "not-allowed" : "pointer",
                transition: "0.2s",
                boxShadow:
                  loading || !file1 || !file2
                    ? "none"
                    : `0 0 15px ${ACCENT_COLOR}60`,
              }}
            >
              {loading ? "Processing..." : "Start Processing"}
            </button>
            <button
              onClick={handleClear}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #dc3545",
                background: "transparent",
                color: "#dc3545",
                fontWeight: "600",
                fontSize: "16px",
                cursor: "pointer",
                transition: "0.2s",
              }}
            >
              Clear All
            </button>
          </div>
        </div>

        {/* --- Right Column: Output and Status --- */}
        <div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "15px",
              paddingBottom: "5px",
              borderBottom: `1px solid ${BORDER_COLOR}`,
              color: ACCENT_COLOR,
            }}
          >
            Status & Output (USES DEV SERVER)
          </h2>

          <button onClick={toggleEnv} style={{ marginBottom: 12 }}>
            Switch to {env === "dev" ? "Prod" : "Dev"}
          </button>

          {/* Progress and Timings */}
          <div style={{ minHeight: "100px", marginBottom: "20px" }}>
            {progress && (
              <p
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  background: INPUT_BG,
                  borderRadius: "8px",
                  color: TEXT_COLOR,
                  border: `1px solid ${BORDER_COLOR}`,
                  transition: "all 0.3s ease-out",
                  minHeight: "40px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Status: {progress}
              </p>
            )}

            {timings.length > 0 && (
              <div
                style={{
                  marginTop: "15px",
                  border: `1px solid ${BORDER_COLOR}`,
                  padding: "10px",
                  borderRadius: "8px",
                  background: INPUT_BG,
                  transition: "all 0.3s ease-out",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "500",
                    marginBottom: "5px",
                    color: ACCENT_COLOR,
                  }}
                >
                  Step Timings:
                </h3>
                <ul
                  style={{
                    listStyleType: "none",
                    paddingLeft: "0",
                    fontSize: "14px",
                  }}
                >
                  {timings.map((t, idx) => (
                    <li key={idx} style={{ marginBottom: "3px" }}>
                      {t.step}: <span style={{ color: ACCENT_COLOR }}>{t.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Output Images */}
          {outputImages.length > 0 && (
            <div
              style={{
                marginTop: "20px",
                transition: "all 0.3s ease-out",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  marginBottom: "10px",
                  color: ACCENT_COLOR,
                }}
              >
                Generated Images
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  maxHeight: "400px",
                  overflowY: "auto",
                  paddingRight: "5px",
                }}
              >
                {outputImages.map((url, idx) => (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={idx}
                    style={{ display: "block" }}
                  >
                    <img
                      src={url}
                      alt={`output-${idx}`}
                      style={{
                        width: "100%",
                        aspectRatio: "3/4",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: `2px solid ${ACCENT_COLOR}`,
                        transition: "transform 0.2s",
                        animation: `fadeIn 0.5s ease-out`,
                        animationFillMode: "both",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                      onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
