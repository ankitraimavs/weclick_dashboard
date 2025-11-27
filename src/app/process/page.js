"use client";

import { useState, useCallback, useEffect, memo } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
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
  const [height5, setHeight5] = useState(150);
  const [height6, setHeight6] = useState(150);

  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [file3, setFile3] = useState(null);
  const [file4, setFile4] = useState(null);
  const [file5, setFile5] = useState(null);
  const [file6, setFile6] = useState(null);

  const [error, setError] = useState("");
  const [outputImages, setOutputImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [timings, setTimings] = useState([]);

  const [userEmail, setUserEmail] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [preloading, setPreloading] = useState(true);

  const [env, setEnv] = useState("dev");
  const { API_BASE, AUTH_TOKEN, USER_ID } = ENV_CONFIG[env];

  const normalizeHeight = (value, min, max) => {
    const raw = 0.4 + ((value - min) / (max - min)) * (1.0 - 0.4);
    return Math.round(raw * 10) / 10;
  };

  const handleClear = useCallback(() => {
    setPrompt("");
    setDisplayPrompt("");
    setHeight1(150);
    setHeight2(150);
    setHeight3(150);
    setHeight4(150);
    setHeight5(150);
    setHeight6(150);
    setFile1(null);
    setFile2(null);
    setFile3(null);
    setFile4(null);
    setFile5(null);
    setFile6(null);
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
    const searchParams = new URLSearchParams(window.location.search);

    const rawPrompt = searchParams.get("prompt") || "";
    const decodedPrompt = decodeURIComponent(rawPrompt);
    setPrompt(decodedPrompt);
    setDisplayPrompt(decodedPrompt);

    const incomingInput1 = searchParams.get("input1") || "";
    const incomingInput2 = searchParams.get("input2") || "";

    const fetchImage = async (url) => {
      const res = await fetch(url);
      const blob = await res.blob();
      return new File([blob], "input_from_group.jpg", { type: blob.type });
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
    const uploadedFiles = [file1, file2, file3, file4, file5, file6].filter(Boolean);
    
    if (uploadedFiles.length < 2) {
      return alert("Please upload at least 2 images.");
    }

    setError("");
    setLoading(true);
    setOutputImages([]);
    setTimings([]);
    let stepTimings = [];
    let processingStartTime = 0;

    try {
      const headers = {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      };

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

      start = performance.now();
      setProgress("Generating upload URLs...");
      const uploads = await Promise.all(
        uploadedFiles.map(async (file) => {
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

      start = performance.now();
      setProgress("Uploading images...");
      await Promise.all(
        uploads.map((u, i) =>
          fetch(u.upload_url, {
            method: "PUT",
            headers: {
              "x-ms-blob-type": "BlockBlob",
              "Content-Type": uploadedFiles[i].type,
            },
            body: uploadedFiles[i],
          })
        )
      );
      end = performance.now();
      stepTimings.push({
        step: "Upload images",
        time: ((end - start) / 1000).toFixed(2) + "s",
      });

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

      start = performance.now();
      setProgress("Starting processing...");
      
      const heights = [height1, height2, height3, height4, height5, height6];
      const normalizedHeights = heights
        .slice(0, uploadedFiles.length)
        .map(h => normalizeHeight(h, 140, 160));

      const processRes = await axios.post(
        `${API_BASE}/v2/process/groups/${groupId}`,
        {
          prompt: displayPrompt,
          mode: "full_body",
          generations: 4,
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

  const uploadedFileCount = [file1, file2, file3, file4, file5, file6].filter(Boolean).length;

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
          maxWidth: "1400px",
          padding: "30px",
          color: TEXT_COLOR,
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "30px",
        }}
      >
        {/* Left Column: Inputs */}
        <div>
          {/* Server Selection */}
          <div style={{ marginBottom: "20px" }}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "10px",
                color: ACCENT_COLOR,
              }}
            >
              Server Selection
            </h2>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              {["dev", "staging", "prod"].map((serverEnv) => (
                <label
                  key={serverEnv}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  <input
                    type="radio"
                    name="server"
                    value={serverEnv}
                    checked={env === serverEnv}
                    onChange={(e) => setEnv(e.target.value)}
                    style={{ cursor: "pointer" }}
                  />
                  <span style={{ textTransform: "capitalize" }}>{serverEnv}</span>
                </label>
              ))}
            </div>
          </div>

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

          {/* Upload Images */}
          <div style={{ marginBottom: "20px" }}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "10px",
                color: ACCENT_COLOR,
              }}
            >
              1. Upload Images ({uploadedFileCount}/6)
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
              <FileUploadCard label="Image 1" file={file1} setFile={setFile1} />
              <FileUploadCard label="Image 2" file={file2} setFile={setFile2} />
              <FileUploadCard label="Image 3" file={file3} setFile={setFile3} />
              <FileUploadCard label="Image 4" file={file4} setFile={setFile4} />
              <FileUploadCard label="Image 5" file={file5} setFile={setFile5} />
              <FileUploadCard label="Image 6" file={file6} setFile={setFile6} />
            </div>
          </div>

          {/* Prompt Section */}
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

          {/* Height Adjustment Section */}
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
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "15px",
              }}
            >
              {[
                { label: "Image 1", value: height1, setter: setHeight1 },
                { label: "Image 2", value: height2, setter: setHeight2 },
                { label: "Image 3", value: height3, setter: setHeight3 },
                { label: "Image 4", value: height4, setter: setHeight4 },
                { label: "Image 5", value: height5, setter: setHeight5 },
                { label: "Image 6", value: height6, setter: setHeight6 },
              ].map((item, idx) => (
                <div key={idx}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "14px",
                      color: TEXT_COLOR,
                    }}
                  >
                    {item.label}:
                  </label>
                  <input
                    type="number"
                    value={item.value}
                    onChange={(e) => item.setter(Number(e.target.value))}
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
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleProcess}
              disabled={loading || uploadedFileCount < 2}
              style={{
                flex: 3,
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                background:
                  loading || uploadedFileCount < 2
                    ? "rgba(100, 100, 100, 0.6)"
                    : ACCENT_COLOR,
                color:
                  loading || uploadedFileCount < 2 ? "#aaa" : DARK_BG_COLOR,
                fontWeight: "700",
                fontSize: "16px",
                cursor:
                  loading || uploadedFileCount < 2 ? "not-allowed" : "pointer",
                transition: "0.2s",
                boxShadow:
                  loading || uploadedFileCount < 2
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

        {/* Right Column: Output and Status */}
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
            Status & Output
            <div style={{ 
              fontSize: "14px", 
              color: "#94a3b8", 
              marginTop: "5px",
              textTransform: "uppercase"
            }}>
              Using {env} Server
            </div>
          </h2>

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
                      {t.step}:{" "}
                      <span style={{ color: ACCENT_COLOR }}>{t.time}</span>
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
                      onMouseOver={(e) =>
                        (e.currentTarget.style.transform = "scale(1.02)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
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
