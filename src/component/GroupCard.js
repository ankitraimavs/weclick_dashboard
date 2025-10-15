'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, X, Download } from 'lucide-react';

export default function GroupCard({ group }) {
  const [expanded, setExpanded] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const createdAt = new Date(group.created_at).toLocaleString();

  const cardStyle = {
    background: 'rgba(17, 25, 40, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    margin: '20px auto',
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

  const promptStyle = {
    fontSize: '13px',
    color: '#e2e8f0',
    background: 'rgba(255,255,255,0.05)',
    padding: '10px 14px',
    borderRadius: '10px',
    wordBreak: 'break-word',
    border: '1px solid rgba(255,255,255,0.05)',
    marginBottom:'20px',
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
display:'flex',
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
                    color: '#94a3b8',
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
                <span>Email: {group.user_email}</span>
                <span>Time: {createdAt}</span>
                <span>User Id: {group.created_by}</span>
            
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'left', gap: '12px' }}>
              <div style={statsStyle}>
                <span>Inputs: {group.input_count}</span>
                <span>Outputs: {group.output_count}</span>
              </div>
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
          {renderImages('Input Images', group.input_images)}
          {group.output_images.length > 0 && <div style={dividerStyle}></div>}
          {renderImages('Generated Images', group.output_images)}
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
              height: '90%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={modalImage}
              alt="Full view"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            />
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
            <a
              href={modalImage}
              download
              style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                background: 'rgba(37,99,235,0.8)',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '14px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backdropFilter: 'blur(6px)',
              }}
            >
              <Download size={16} />
              Download
            </a>
          </div>
        </div>
      )}
    </>
  );
}
