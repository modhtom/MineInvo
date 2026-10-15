import React from 'react';

interface LoadingScreenProps {
  progress?: number;
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress = 75,
  message = 'Loading Minecraft 26.2 Items...'
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#1b120c',
        backgroundImage:
          'radial-gradient(circle at center, rgba(40, 25, 15, 0.8) 0%, rgba(15, 8, 5, 0.95) 100%), repeating-linear-gradient(45deg, #23160e 0px, #23160e 16px, #1c110b 16px, #1c110b 32px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        zIndex: 999999,
        padding: '20px',
        textAlign: 'center'
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <h1
          style={{
            fontSize: '22px',
            color: '#ffffff',
            textShadow: '2px 2px 0px #000000',
            marginBottom: '8px'
          }}
        >
          Minecraft Collection Tracker
        </h1>
        <div style={{ fontSize: '13px', color: '#7df53b', textShadow: '1px 1px 0px #000' }}>
          Java Edition 26.2 "Chaos Cubed"
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '320px', marginBottom: '14px' }}>
        <div
          style={{
            height: '14px',
            backgroundColor: '#000000',
            border: '2px solid #555555',
            borderRightColor: '#ffffff',
            borderBottomColor: '#ffffff',
            padding: '1px'
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, Math.max(0, progress))}%`,
              background: 'linear-gradient(to bottom, #7df53b 0%, #469620 100%)',
              transition: 'width 0.2s ease-out'
            }}
          />
        </div>
      </div>

      <div style={{ fontSize: '12px', color: '#aaaaaa' }}>{message}</div>
    </div>
  );
};
