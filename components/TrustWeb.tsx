'use client';

import { useEffect, useRef } from 'react';

interface Profile {
  id: number;
  role: string;
  x: number;
  y: number;
  layer: 'front' | 'mid' | 'back';
  label: string;
  refs: number[];
}

export default function TrustWeb() {
  const connectionsRef = useRef<SVGGElement>(null);
  const peerConnectionsRef = useRef<SVGGElement>(null);
  const profilesRef = useRef<SVGGElement>(null);
  const particlesRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!connectionsRef.current || !peerConnectionsRef.current || !profilesRef.current || !particlesRef.current) {
      return;
    }

    const profiles: Profile[] = [
      // Front layer (closest) - highly scattered
      { id: 0, role: 'DEV', x: 640, y: 260, layer: 'front', label: 'Core Dev', refs: [4, 10] },
      { id: 1, role: 'MKT', x: 270, y: 220, layer: 'front', label: 'Community Lead', refs: [9] },
      { id: 2, role: 'MKR', x: 720, y: 440, layer: 'front', label: 'Market Maker', refs: [8, 15] },
      { id: 3, role: 'DEV', x: 210, y: 480, layer: 'front', label: 'Smart Contract', refs: [0] },
      { id: 4, role: 'MOD', x: 580, y: 160, layer: 'front', label: 'Moderator', refs: [1, 9] },
      
      // Mid layer - irregular clustering
      { id: 5, role: 'DEV', x: 750, y: 320, layer: 'mid', label: 'Builder', refs: [11] },
      { id: 6, role: 'MKT', x: 160, y: 340, layer: 'mid', label: 'Growth', refs: [1, 12] },
      { id: 7, role: 'DEV', x: 360, y: 540, layer: 'mid', label: 'Frontend', refs: [3, 14] },
      { id: 8, role: 'MKR', x: 610, y: 530, layer: 'mid', label: 'Liquidity', refs: [2] },
      { id: 9, role: 'MOD', x: 320, y: 140, layer: 'mid', label: 'Support', refs: [13] },
      { id: 10, role: 'MKT', x: 790, y: 230, layer: 'mid', label: 'Content', refs: [5] },
      { id: 11, role: 'DEV', x: 140, y: 420, layer: 'mid', label: 'DevOps', refs: [7] },
      
      // Back layer (furthest) - more dispersed
      { id: 12, role: 'DEV', x: 810, y: 370, layer: 'back', label: 'Engineer', refs: [5, 17] },
      { id: 13, role: 'MKT', x: 120, y: 260, layer: 'back', label: 'Marketer', refs: [6] },
      { id: 14, role: 'DEV', x: 440, y: 600, layer: 'back', label: 'Backend', refs: [7, 18] },
      { id: 15, role: 'MKR', x: 700, y: 520, layer: 'back', label: 'Trading', refs: [8] },
      { id: 16, role: 'MOD', x: 260, y: 160, layer: 'back', label: 'Community', refs: [9, 13] },
      { id: 17, role: 'MKT', x: 850, y: 300, layer: 'back', label: 'Social', refs: [10] },
      { id: 18, role: 'DEV', x: 540, y: 120, layer: 'back', label: 'Auditor', refs: [0, 3] },
      { id: 19, role: 'MKR', x: 100, y: 380, layer: 'back', label: 'Analytics', refs: [2, 15] },
      { id: 20, role: 'DEV', x: 380, y: 90, layer: 'back', label: 'Protocol', refs: [18] },
      { id: 21, role: 'MKT', x: 180, y: 550, layer: 'back', label: 'Partnership', refs: [6, 13] },
    ];

    const center = { x: 450, y: 350 };
    const peerConnectionsG = peerConnectionsRef.current;
    const connectionsG = connectionsRef.current;
    const profilesG = profilesRef.current;
    const particlesG = particlesRef.current;

    // Sort by layer for proper rendering order
    const layerOrder: Record<'back' | 'mid' | 'front', number> = { 'back': 0, 'mid': 1, 'front': 2 };
    profiles.sort((a, b) => layerOrder[a.layer] - layerOrder[b.layer]);

    // Create peer-to-peer connections first
    profiles.forEach((profile) => {
      if (profile.refs && profile.refs.length > 0) {
        profile.refs.forEach(refId => {
          const refProfile = profiles.find(p => p.id === refId);
          if (refProfile) {
            const peerLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            peerLine.setAttribute('x1', String(profile.x));
            peerLine.setAttribute('y1', String(profile.y));
            peerLine.setAttribute('x2', String(refProfile.x));
            peerLine.setAttribute('y2', String(refProfile.y));
            
            const layer = layerOrder[profile.layer] >= layerOrder[refProfile.layer] 
              ? profile.layer : refProfile.layer;
            peerLine.classList.add('peer-connection', `layer-${layer}`);
            peerLine.style.animationDelay = `${Math.random() * 2}s`;
            peerLine.dataset.from = String(profile.id);
            peerLine.dataset.to = String(refProfile.id);
            
            peerConnectionsG.appendChild(peerLine);
          }
        });
      }
    });

    // Create profile nodes with depth
    profiles.forEach((profile, i) => {
      // Connection line to center
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(center.x));
      line.setAttribute('y1', String(center.y));
      line.setAttribute('x2', String(profile.x));
      line.setAttribute('y2', String(profile.y));
      line.classList.add('connection', `layer-${profile.layer}`);
      line.style.animationDelay = `${i * 0.15}s`;
      line.dataset.profileId = String(profile.id);
      connectionsG.appendChild(line);

      // Profile node group
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('profile-node', `layer-${profile.layer}`);
      g.dataset.profileId = String(profile.id);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(profile.x));
      circle.setAttribute('cy', String(profile.y));
      
      // Set radius based on layer
      let radius = 11;
      if (profile.layer === 'front') radius = 14;
      else if (profile.layer === 'back') radius = 9;
      circle.setAttribute('r', String(radius));

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(profile.x));
      text.setAttribute('y', String(profile.y - 18));
      text.textContent = profile.label;

      g.appendChild(circle);
      g.appendChild(text);
      
      g.addEventListener('mouseenter', () => {
        line.classList.add('active');
        
        const peerLines = peerConnectionsG.querySelectorAll(
          `[data-from="${profile.id}"], [data-to="${profile.id}"]`
        );
        peerLines.forEach(pl => pl.classList.add('active'));
      });
      
      g.addEventListener('mouseleave', () => {
        line.classList.remove('active');
        
        const peerLines = peerConnectionsG.querySelectorAll('.peer-connection');
        peerLines.forEach(pl => pl.classList.remove('active'));
      });

      profilesG.appendChild(g);
    });

    // Create floating particles with depth
    const particleCount = 40;
    const layers = ['back', 'mid', 'front'] as const;
    
    for (let i = 0; i < particleCount; i++) {
      const layer = layers[Math.floor(Math.random() * layers.length)];
      const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      particle.classList.add('particle', `layer-${layer}`);
      
      let size: number;
      if (layer === 'front') size = Math.random() * 2.5 + 1.5;
      else if (layer === 'mid') size = Math.random() * 1.8 + 1;
      else size = Math.random() * 1.2 + 0.5;
      
      particle.setAttribute('r', String(size));
      particle.setAttribute('cx', String(Math.random() * 900));
      particle.setAttribute('cy', String(Math.random() * 700));
      particle.style.animationDelay = `${Math.random() * 4}s`;
      particle.style.animationDuration = `${Math.random() * 3 + 4}s`;
      particlesG.appendChild(particle);
    }
  }, []);

  return (
    <div className="trust-web-wrapper">
      <svg viewBox="0 0 900 700" xmlns="http://www.w3.org/2000/svg" className="trust-web-svg">
        <defs>
          <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: 'rgba(56, 189, 248, 1)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'rgba(129, 140, 248, 0.8)', stopOpacity: 1 }} />
          </radialGradient>
          
          <radialGradient id="profileGradientFront" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: 'rgba(56, 189, 248, 0.9)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'rgba(30, 64, 175, 0.85)', stopOpacity: 1 }} />
          </radialGradient>
          
          <radialGradient id="profileGradientMid" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: 'rgba(30, 64, 175, 0.8)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'rgba(15, 23, 42, 0.9)', stopOpacity: 1 }} />
          </radialGradient>
          
          <radialGradient id="profileGradientBack" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: 'rgba(30, 64, 175, 0.6)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'rgba(15, 23, 42, 0.95)', stopOpacity: 1 }} />
          </radialGradient>
          
          <radialGradient id="profileHoverGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: 'rgba(56, 189, 248, 1)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'rgba(30, 64, 175, 0.9)', stopOpacity: 1 }} />
          </radialGradient>
        </defs>

        <ellipse cx="480" cy="380" rx="320" ry="190" className="depth-glow-back"/>
        <ellipse cx="420" cy="340" rx="240" ry="140" className="depth-glow-front"/>

        <g opacity="0.08">
          <circle cx="450" cy="350" r="180" fill="none" stroke="rgba(129, 140, 248, 0.3)" strokeWidth="1"/>
          <circle cx="450" cy="350" r="320" fill="none" stroke="rgba(129, 140, 248, 0.2)" strokeWidth="1"/>
          <ellipse cx="450" cy="370" rx="420" ry="250" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1"/>
        </g>

        <g ref={peerConnectionsRef}></g>
        <g ref={connectionsRef}></g>
        <g ref={particlesRef}></g>
        <g ref={profilesRef}></g>

        <g className="center-node">
          <circle className="center-ring-outer" cx="450" cy="350" r="55" />
          <circle className="center-ring" cx="450" cy="350" r="42" />
          <circle className="center-core" cx="450" cy="350" r="32" />
          <circle cx="450" cy="350" r="22" fill="rgba(2, 6, 23, 0.85)" />
          
          <polygon points="450,337 460,342.5 460,357.5 450,363 440,357.5 440,342.5" 
                   fill="none" stroke="rgba(56, 189, 248, 0.9)" strokeWidth="2.5"/>
          <circle cx="450" cy="350" r="8" fill="rgba(56, 189, 248, 0.6)"/>
        </g>
      </svg>

      <style jsx>{`
        .trust-web-wrapper {
          width: 100%;
          max-width: 500px;
          aspect-ratio: 9 / 7;
          perspective: 1200px;
          transform-style: preserve-3d;
        }

        .trust-web-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5));
          animation: breathe 8s ease-in-out infinite;
        }

        @keyframes breathe {
          0%, 100% { transform: rotateX(5deg) rotateY(-3deg) scale(1); }
          50% { transform: rotateX(8deg) rotateY(3deg) scale(1.01); }
        }

        :global(.connection) {
          stroke-width: 1.5;
          fill: none;
          animation: pulse 3s ease-in-out infinite;
          transition: all 0.4s ease;
        }

        :global(.connection.layer-front) {
          stroke: rgba(56, 189, 248, 0.5);
          stroke-width: 2.5;
        }

        :global(.connection.layer-mid) {
          stroke: rgba(56, 189, 248, 0.35);
          stroke-width: 1.8;
        }

        :global(.connection.layer-back) {
          stroke: rgba(30, 64, 175, 0.25);
          stroke-width: 1.2;
        }

        :global(.connection.active) {
          stroke: rgba(56, 189, 248, 0.9);
          stroke-width: 3;
          filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.8));
        }

        :global(.peer-connection) {
          stroke-width: 1;
          fill: none;
          stroke-dasharray: 4 6;
          animation: peerPulse 4s ease-in-out infinite;
        }

        :global(.peer-connection.layer-front) {
          stroke: rgba(129, 140, 248, 0.4);
          stroke-width: 1.5;
        }

        :global(.peer-connection.layer-mid) {
          stroke: rgba(129, 140, 248, 0.3);
          stroke-width: 1.2;
        }

        :global(.peer-connection.layer-back) {
          stroke: rgba(99, 102, 241, 0.2);
          stroke-width: 1;
        }

        :global(.peer-connection.active) {
          stroke: rgba(129, 140, 248, 0.8);
          stroke-width: 2;
          filter: drop-shadow(0 0 6px rgba(129, 140, 248, 0.6));
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        @keyframes peerPulse {
          0%, 100% { opacity: 0.3; stroke-dashoffset: 0; }
          50% { opacity: 0.6; stroke-dashoffset: 10; }
        }

        :global(.center-node) {
          animation: glow 2s ease-in-out infinite;
          transform-origin: center;
        }

        :global(.center-core) {
          fill: url(#centerGradient);
          filter: drop-shadow(0 0 25px rgba(56, 189, 248, 0.9));
        }

        :global(.center-ring) {
          fill: none;
          stroke: rgba(129, 140, 248, 0.6);
          stroke-width: 2.5;
          animation: rotate 25s linear infinite;
          transform-origin: center;
        }

        :global(.center-ring-outer) {
          fill: none;
          stroke: rgba(56, 189, 248, 0.3);
          stroke-width: 1.5;
          animation: rotate 35s linear reverse infinite;
          transform-origin: center;
        }

        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 25px rgba(56, 189, 248, 0.7)); }
          50% { filter: drop-shadow(0 0 40px rgba(56, 189, 248, 1)); }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        :global(.profile-node) {
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center;
        }

        :global(.profile-node.layer-front circle) {
          fill: url(#profileGradientFront);
          stroke: rgba(56, 189, 248, 0.7);
          stroke-width: 2.5;
        }

        :global(.profile-node.layer-mid circle) {
          fill: url(#profileGradientMid);
          stroke: rgba(30, 64, 175, 0.6);
          stroke-width: 2;
        }

        :global(.profile-node.layer-back circle) {
          fill: url(#profileGradientBack);
          stroke: rgba(30, 64, 175, 0.4);
          stroke-width: 1.5;
        }

        :global(.profile-node:hover) {
          transform: scale(1.3);
        }

        :global(.profile-node:hover circle) {
          fill: url(#profileHoverGradient);
          stroke: rgba(56, 189, 248, 1);
          stroke-width: 3;
          filter: drop-shadow(0 0 20px rgba(56, 189, 248, 0.9));
        }

        :global(.profile-node text) {
          fill: rgba(226, 232, 240, 0.95);
          font-size: 11px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Courier New', monospace;
          text-anchor: middle;
          dominant-baseline: text-after-edge;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
          font-weight: 600;
        }

        :global(.profile-node:hover text) {
          opacity: 1;
        }

        :global(.particle) {
          animation: float 4s ease-in-out infinite;
        }

        :global(.particle.layer-front) {
          fill: rgba(56, 189, 248, 0.7);
        }

        :global(.particle.layer-mid) {
          fill: rgba(56, 189, 248, 0.4);
        }

        :global(.particle.layer-back) {
          fill: rgba(30, 64, 175, 0.3);
        }

        @keyframes float {
          0%, 100% { opacity: 0.2; transform: translateY(0) translateX(0); }
          50% { opacity: 0.9; transform: translateY(-15px) translateX(5px); }
        }

        :global(.depth-glow-front) {
          fill: rgba(56, 189, 248, 0.15);
          filter: blur(20px);
        }

        :global(.depth-glow-back) {
          fill: rgba(30, 64, 175, 0.1);
          filter: blur(30px);
        }
      `}</style>
    </div>
  );
}