'use client';
import { useState } from 'react';

export default function GroupCard({ group }) {
  const [expanded, setExpanded] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const createdAt = new Date(group.created_at).toLocaleString();

  const cardStyle = {
    background: 'rgba(30,41,59,0.85)',
    border: '1px solid rgba(71,85,105,0.3)',
    borderRadius: '12px',
    overflow: 'hidden',
    margin: '16px auto',
    maxWidth: '95%',
    fontFamily: 'Arial, sans-serif',
    transition: 'box-shadow 0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  };

  const headerStyle = {
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    background: 'rgba(30,41,59,0.95)',
    gap: '12px',
  };

  const topRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  };

  const titleStyle = { fontSize: '16px', fontWeight: 600, color: '#f1f5f9' };
  const metaStyle = {
    fontSize: '12px',
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginTop: '4px',
  };
  const statsStyle = {
    fontSize: '12px',
    color: '#cbd5e1',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    minWidth: '120px',
    justifyContent: 'flex-end',
  };

  const promptStyle = {
    fontSize: '12px',
    color: '#94a3b8',
    background: 'rgba(15,23,42,0.3)',
    padding: '8px',
    borderRadius: '6px',
    wordBreak: 'break-word',
  };

  const contentStyle = {
    maxHeight: expanded ? '1000px' : '0',
    overflow: 'hidden',
    transition: 'max-height 0.4s ease, padding 0.4s ease',
    padding: expanded ? '16px' : '0 16px',
    borderTop: '1px solid rgba(71,85,105,0.2)',
    background: 'rgba(15,23,42,0.3)',
  };

  const dividerStyle = { height: '1px', background: 'rgba(71,85,105,0.2)', margin: '16px 0' };

  const imageGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, auto))',
    gap: '8px',
    justifyContent: 'start',
  };

  const imageItemStyle = {
    borderRadius: '6px',
    overflow: 'hidden',
    border: '1px solid rgba(100,116,139,0.3)',
    cursor: 'pointer',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2px',
    background: 'rgba(15,23,42,0.2)',
  };

  const renderImages = (title, images) => (
    <div style={{ marginBottom: '16px' }}>
      <p
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#cbd5e1',
          marginBottom: '6px',
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
            fontSize: '12px',
            color: '#64748b',
            padding: '8px',
            background: 'rgba(15,23,42,0.2)',
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          No images available
        </div>
      ) : (
        <div style={imageGridStyle}>
          {images.map((img, idx) => (
            <div key={idx} style={imageItemStyle} onClick={() => img.url && setModalImage(img.url)}>
              {img.url ? (
                <img
                  src={img.url}
                  alt={title}
                  style={{ maxHeight: '80px', maxWidth: '80px', objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.src = '';
                    e.currentTarget.parentElement.innerHTML = `<div style="width:80px;height:80px;display:flex;align-items:center;justify-content:center;background:rgba(127,29,29,0.2);color:#b91c1c;font-size:12px;">⚠️ Unavailable</div>`;
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: '#64748b',
                    textAlign: 'center',
                  }}
                >
                  {img.status === 'error' ? '⚠️ Error' : '⏳ Processing'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Find prompt and enhanced prompt
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
                <span>Created at: {createdAt}</span>
                <span>Created by: {group.created_by}</span>
              </div>
            </div>
            <div style={statsStyle}>
              <span>Inputs: {group.input_count}</span>
              <span>Outputs: {group.output_count}</span>
            </div>
          </div>

          {/* Show prompts only once per group */}
          {groupPrompt && <div style={promptStyle}>Prompt: {groupPrompt}</div>}
          {enhancedGroupPrompt && <div style={promptStyle}>Enhanced Prompt: {enhancedGroupPrompt}</div>}
        </div>

        <div style={contentStyle}>
          {renderImages('Input Images', group.input_images)}
          {group.output_images.length > 0 && <div style={dividerStyle}></div>}
          {renderImages('Generated Images', group.output_images)}
        </div>
      </div>

      {/* Modal for full image view */}
      {modalImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
          onClick={() => setModalImage(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={modalImage}
              alt="Full view"
              style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px', objectFit: 'contain' }}
            />
            <a
              href={modalImage}
              download
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: '#2563eb',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                textDecoration: 'none',
              }}
            >
              ⬇️ Download
            </a>
          </div>
        </div>
      )}
    </>
  );
}
