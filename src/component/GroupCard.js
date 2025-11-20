'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, X, Download, Trash2 } from 'lucide-react';
import { useRouter } from "next/navigation";

export default function GroupCard({ group, onDelete }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_DEV;

  const [reprocessImage, setReprocessImage] = useState(null);

  const createdAt = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(group.created_at + 'Z'));

  // 🧹 Delete group handler
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete Group #${group.group_id}?`)) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`${API_BASE}/dashboard/api/groups/${group.group_id}/input-images`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete group');
      if (onDelete) onDelete(group.group_id);
    } catch (err) {
      alert('❌ Error deleting group: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Reprocess KL handler
  const handleReprocessKL = async (e) => {
    e.stopPropagation();

    if (!group.input_images || group.input_images.length < 2) {
      alert('❌ Need at least 2 input images to reprocess');
      return;
    }

    const prompt = group.output_images?.[0]?.enhanced_prompt ||
                  group.output_images?.[0]?.prompt ||
                  group.prompt || '';

    if (!prompt) {
      alert('❌ No prompt available for reprocessing');
      return;
    }

    if (!confirm(`Reprocess Group #${group.group_id} with KL model?`)) return;

    try {
      setIsReprocessing(true);

      // Add placeholder for loading image
      setReprocessImage({ url: null, status: 'processing' });

      const img1Response = await fetch(group.input_images[0].url);
      const img2Response = await fetch(group.input_images[1].url);
      const img1Blob = await img1Response.blob();
      const img2Blob = await img2Response.blob();

      const formData = new FormData();
      formData.append('img_1', img1Blob, 'input1.jpg');
      formData.append('img_2', img2Blob, 'input2.jpg');
      formData.append('group_id', group.group_id.toString());
      formData.append('prompt', prompt);

      const res = await fetch(`${API_BASE}/dashboard/api/reprocess/kl/group`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to reprocess group');
      }

      const result = await res.json();

      // Update loader image with real result
      setReprocessImage({ url: result.result_url, status: 'done' });

    } catch (err) {
      // Update placeholder with error message
      setReprocessImage({ url: null, status: 'error' });
      alert('❌ Error reprocessing group: ' + err.message);
    } finally {
      setIsReprocessing(false);
    }
  };

  const cardStyle = {
    background: 'rgba(17, 25, 40, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    margin: '5px auto',
    overflow: 'hidden',
    maxWidth: '95%',
    color: '#f8fafc',
    transition: 'transform 0.2s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
  };

  const headerStyle = {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    background: 'rgba(30,41,59,0.9)',
    gap: '12px',
  };

  const topRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
  };

  const titleStyle = { fontSize: '18px', fontWeight: 600, color: '#f8fafc' };
  const metaStyle = {
    fontSize: '13px',
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  };

  const statsStyle = {
    fontSize: '13px',
    color: '#cbd5e1',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '14px',
    justifyContent: 'flex-end',
    alignItems: 'center',
  };

  const deleteButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    background: 'rgba(220,38,38,0.15)',
    color: '#f87171',
    border: '1px solid rgba(220,38,38,0.4)',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: isDeleting ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
  };

  const reprocessButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    background: 'rgba(168,85,247,0.15)',
    color: '#c084fc',
    border: '1px solid rgba(168,85,247,0.4)',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: isReprocessing ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
  };

  const qualityCheckStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '6px 6px',
    background: 'rgba(13, 71, 3, 1)',
    color: '#41fe34ff',
    border: '1px solid rgba(39, 179, 11, 0.4)',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: isDeleting ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '10px',
  };

  const paidCheckStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'left',
    color: '#51f338ff',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: isDeleting ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    width: '100px'
  };

  const promptStyle = {
    fontSize: '13px',
    color: '#e2e8f0',
    background: 'rgba(255,255,255,0.05)',
    padding: '10px 14px',
    borderRadius: '10px',
    wordBreak: 'break-word',
    border: '1px solid rgba(255,255,255,0.05)',
    marginBottom: '20px',
  };

  const contentStyle = {
    maxHeight: expanded ? '1000px' : '0',
    overflow: 'hidden',
    transition: 'max-height 0.5s ease, padding 0.4s ease',
    padding: expanded ? '20px' : '0 20px',
    background: 'rgba(15,23,42,0.4)',
  };

  const dividerStyle = {
    height: '1px',
    background: 'rgba(255,255,255,0.08)',
    margin: '20px 0',
  };

  const imageGridStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'left',
    gap: '14px',
  };

  const imageItemStyle = {
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(6px)',
    transition: 'transform 0.2s ease',
  };

  const renderImages = (title, images) => (
    <div style={{ marginBottom: '20px' }}>
      <p
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#e2e8f0',
          marginBottom: '8px',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{images.length}</span>
      </p>

      {images.length === 0 ? (
        <div
          style={{
            fontSize: '13px',
            color: '#64748b',
            padding: '10px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '10px',
            textAlign: 'center',
          }}
        >
          No images available
        </div>
      ) : (
        <div style={imageGridStyle}>
        {images.map((img, idx) => (
  <div
    key={idx}
    style={imageItemStyle}
    onClick={() => img.url && setModalImage(img.url)}
    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
  >
    {img.url ? (
      <img
        src={img.url}
        alt={title}
        style={{
          height: '120px',
          objectFit: 'cover',
          borderRadius: '10px',
        }}
        onError={(e) => {
          e.currentTarget.src = '';
          e.currentTarget.parentElement.innerHTML =
            `<div style="height:120px;display:flex;align-items:center;justify-content:center;background:rgba(127,29,29,0.2);color:#f87171;font-size:13px;">⚠️ Unavailable</div>`;
        }}
      />
    ) : (
      <div
        style={{
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          color: img.status === 'error' ? '#f87171' : '#94a3b8',
          background: img.status === 'error'
            ? 'rgba(127,29,29,0.2)'
            : 'rgba(255,255,255,0.05)',
          borderRadius: '10px',
        }}
      >
        {img.status === 'error' ? '⚠️ Generation Failed' : '⏳ Processing'}
      </div>
    )}
  </div>
))}

        </div>
      )}
    </div>
  );

 const renderSingleImage = (title, imageUrl) => (
  <div style={{ marginBottom: '20px' }}>
    <p
      style={{
        fontSize: '14px',
        fontWeight: 600,
        color: '#e2e8f0',
        marginBottom: '8px',
      }}
    >
      {title}
    </p>

    {imageUrl ? (
      <div
        style={{
          height: '120px',
          width: '120px',
          borderRadius: '10px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'transform 0.2s',
        }}
        onClick={() => setModalImage(imageUrl)}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <img
          src={imageUrl}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.currentTarget.src = '';
            e.currentTarget.parentElement.innerHTML =
              `<div style="height:120px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);color:#f87171;font-size:13px;border-radius:10px;">Not Available</div>`;
          }}
        />
      </div>
    ) : (
      <div
        style={{
          height: '120px',
          width: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          color: '#f87171',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '10px',
        }}
      >
        Not Available
      </div>
    )}
  </div>
);


  const groupPrompt = group.output_images.find((img) => img.prompt)?.prompt || null;
  const enhancedGroupPrompt =
    group.output_images.find((img) => img.enhanced_prompt)?.enhanced_prompt || null;

  return (
    <>
      <div style={cardStyle}>
        <div style={headerStyle} onClick={() => setExpanded(!expanded)}>
          <div style={topRowStyle}>
            <div>
              <div style={titleStyle}>Group #{group.group_id}</div>
              <div style={metaStyle}>
                <span>Time (IST): {createdAt}</span>
                <span>User Id: {group.created_by}</span>
                <span>Email: {group.user_email}</span>
                <span style={paidCheckStyle}>
                  {group.is_paid && <p>Paid User</p>}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={statsStyle}>
                <span>Inputs: {group.input_count}</span>
                <span>Outputs: {group.output_count}</span>
              </div>

              {group.input_images && group.input_images.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    const input1 = group.input_images?.[0]?.url || '';
                    const input2 = group.input_images?.[1]?.url || '';
                    const input3 = group.input_images?.[2]?.url || '';
                    const input4 = group.input_images?.[3]?.url || '';

                    const prompt =
                      group.output_images?.[0]?.prompt ||
                      group.output_images?.[0]?.enhanced_prompt ||
                      group.prompt ||
                      '';

                    const params = new URLSearchParams({
                      prompt: prompt,
                      input1: input1,
                      input2: input2,
                      input3: input3,
                      input4: input4,
                    });

                    router.push(`/process?${params.toString()}`);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    background: 'rgba(37,99,235,0.15)',
                    color: '#60a5fa',
                    border: '1px solid rgba(37,99,235,0.4)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  Playground
                </button>
              )}

              {group.input_images && group.input_images.length > 0 ? (
                !group.kl_processed_path ? (
                  <button
                    onClick={handleReprocessKL}
                    disabled={isReprocessing}
                    style={{
                      ...reprocessButtonStyle,
                      opacity: isReprocessing ? 0.5 : 1,
                    }}
                  >
                    <Download size={14} />
                    {isReprocessing ? 'Reprocessing...' : 'Regenerate with KL'}
                  </button>
                ) : (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: 'rgba(34,197,94,0.1)',
                      color: '#4ade80',
                      border: '1px solid rgba(34,197,94,0.3)',
                      borderRadius: 8,
                      padding: '6px 10px',
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    KL version exists
                  </div>
                )
              ) : null}

              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  ...deleteButtonStyle,
                  opacity: isDeleting ? 0.5 : 1,
                }}
              >
                <Trash2 size={14} />
                {isDeleting ? 'Deleting Inputs...' : 'Delete Inputs'}
              </button>

              {expanded ? (
                <ChevronUp size={20} color="#94a3b8" />
              ) : (
                <ChevronDown size={20} color="#94a3b8" />
              )}
            </div>
          </div>

          {groupPrompt && <div style={promptStyle}>Prompt: {groupPrompt}</div>}
        </div>

        <div style={contentStyle}>
          {enhancedGroupPrompt && (
            <div style={promptStyle}>Enhanced Prompt: {enhancedGroupPrompt}</div>
          )}
          <span style={qualityCheckStyle}>
            {group.quality_summary
              ? group.quality_summary
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, c => c.toUpperCase())
              : 'No Quality Checker Data Available'}
          </span>
          {renderImages('Input Images', group.input_images)}
          {group.output_images.length > 0 && <div style={dividerStyle}></div>}
          {renderSingleImage('Masked Image', group.mask_url)}
          {group.output_images.length > 0 && <div style={dividerStyle}></div>}
          {renderImages('Generated Images', group.output_images)}


     
          <>
            {group.input_images.length > 0 && <div style={dividerStyle}></div>}
            {renderImages('Kontext Lora Generation', [
              ...(group.kl_processed_path
                ? [{ url: group.kl_processed_path, status: 'done' }]
                : []),
              ...(reprocessImage ? [reprocessImage] : [])
            ])}
          </>
        </div>
      </div>


{modalImage && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.3s ease',
    }}
    onClick={() => setModalImage(null)}
  >
    <div
      style={{
        position: 'relative',
        width: '90%',
        height: '80%',
        display: 'flex',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'rgba(0,0,0,0.9)',
      }}
      onClick={(e) => e.stopPropagation()}
    >

      <div
        style={{
          width: '320px',
          display: 'flex',
          gap: '10px',
          padding: '10px',
          background: 'rgba(15,23,42,0.8)',
          overflowY: 'auto',
          maxHeight: '100%',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {/* Inputs */}
          {group.input_images.length > 0 && (
            <>
              <p style={{ color: '#e2e8f0', fontWeight: 600, textAlign: 'center', fontSize: '16px', marginBottom: '6px' }}>
                Inputs
              </p>
              {group.input_images.map((img, idx) => (
                <div
                  key={`input-${idx}`}
                  style={{
                    width: '100%',
                    height: '80px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: img.url === modalImage ? '2px solid #2563eb' : '1px solid rgba(255,255,255,0.2)',
                  }}
                  onClick={() => setModalImage(img.url)}
                >
                  <img src={img.url} alt={`Input ${idx + 1}`} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
              ))}
            </>
          )}

          {/* Masked */}
          {group.mask_url && (
            <>
              <p style={{ color: '#e2e8f0', fontWeight: 600, textAlign: 'center', fontSize: '16px', marginTop: '12px', marginBottom: '6px' }}>
                Masked
              </p>
              <div
                style={{
                  width: '100%',
                  height: '80px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: group.mask_url === modalImage ? '2px solid #2563eb' : '1px solid rgba(255,255,255,0.2)',
                  marginBottom: '6px',
                }}
                onClick={() => setModalImage(group.mask_url)}
              >
                <img
                  src={group.mask_url}
                  alt="Masked Image"
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.src = '';
                    e.currentTarget.parentElement.innerHTML =
                      `<div style="height:100%;display:flex;align-items:center;justify-content:center;background:rgba(127,29,29,0.2);color:#f87171;font-size:12px;">⚠️ Unavailable</div>`;
                  }}
                />
              </div>
            </>
          )}
        </div>


        <div
  style={{
    width: '1px',
    background: 'rgba(255,255,255,0.15)',
    margin: '0 6px',
  }}
/>


        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>

          {group.output_images.length > 0 && (
            <>
              <p style={{ color: '#e2e8f0', fontWeight: 600, textAlign: 'center', fontSize: '16px', marginBottom: '6px' }}>Outputs</p>
              {group.output_images.map((img, idx) => (
                <div
                  key={`output-${idx}`}
                  style={{
                    width: '100%',
                    height: '100px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: img.url === modalImage ? '2px solid #2563eb' : '1px solid rgba(255,255,255,0.2)',
                  }}
                  onClick={() => setModalImage(img.url)}
                >
                  <img src={img.url} alt={`Output ${idx + 1}`} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
              ))}
            </>
          )}

          {(group.kl_processed_path || reprocessImage) && (
            <>
              <p style={{ color: '#e2e8f0', fontWeight: 600, textAlign: 'center', fontSize: '16px', marginTop: '12px', marginBottom: '6px' }}>Kontext</p>
              {[...(group.kl_processed_path ? [{ url: group.kl_processed_path, status: 'done' }] : []),
                 ...(reprocessImage ? [reprocessImage] : [])].map((img, idx) => (
                <div
                  key={`kontext-${idx}`}
                  style={{
                    width: '100%',
                    height: '80px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: img.url === modalImage ? '2px solid #2563eb' : '1px solid rgba(255,255,255,0.2)',
                    marginBottom: '6px',
                  }}
                  onClick={() => setModalImage(img.url)}
                >
                  {img.url ? (
                    <img src={img.url} alt={`Kontext ${idx + 1}`} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div
                      style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        rightMargin: '66px',
                        color: img.status === 'error' ? '#f87171' : '#94a3b8',
                        background: img.status === 'error' ? 'rgba(127,29,29,0.2)' : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      {img.status === 'error' ? '⚠️ Failed' : '⏳ Processing'}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <img
          src={modalImage}
          alt="Main view"
          style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
        />

        {/* Close Button */}
        <button
          onClick={() => setModalImage(null)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: '50%',
            padding: '10px',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          <X size={20} color="#fff" />
        </button>

        <button
          onClick={() => {
            if (!modalImage) return;
            const link = document.createElement('a');
            link.href = modalImage;
            link.download = `image_${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            background: 'rgba(37,99,235,0.8)',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: '10px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backdropFilter: 'blur(6px)',
            cursor: 'pointer',
          }}
        >
          <Download size={16} />
          Download
        </button>
      </div>
    </div>
  </div>
)}





    </>
  );
}