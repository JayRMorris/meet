'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { encodePassphrase, generateRoomId, randomString } from '@/lib/client-utils';
import * as THREE from 'three';

export const dynamic = 'force-dynamic';

export default function Page() {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const portalGeometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const portalMaterial = new THREE.MeshBasicMaterial({
      color: 0xB91C4D,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const portal = new THREE.Mesh(portalGeometry, portalMaterial);
    scene.add(portal);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 5000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xB91C4D,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 30;

    const animate = () => {
      requestAnimationFrame(animate);
      portal.rotation.x += 0.005;
      portal.rotation.y += 0.005;
      particlesMesh.rotation.y += 0.001;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  const startMeeting = (event) => {
    event.preventDefault();
    const room = roomName.trim() || generateRoomId();
    const name = userName.trim();
    
    if (e2ee) {
      router.push(`/rooms/${room}?name=${encodeURIComponent(name)}#${encodePassphrase(sharedPassphrase)}`);
    } else {
      router.push(`/rooms/${room}?name=${encodeURIComponent(name)}`);
    }
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />
      
      <main style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 700, marginBottom: '1.5rem', background: 'linear-gradient(135deg, #B91C4D 0%, #FFFFFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
            Nova Portal
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '3rem', lineHeight: 1.6 }}>
            Sovereign video conferencing infrastructure.
            <br />
            End-to-end encrypted. Completely self-hosted.
          </p>
          
          <form onSubmit={startMeeting} style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '3rem', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' }}>
            <input 
              type="text" 
              placeholder="Your name" 
              value={userName} 
              onChange={(e) => setUserName(e.target.value)} 
              required 
              style={{ width: '100%', padding: '1rem 1.5rem', marginBottom: '1rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'all 0.3s ease' }} 
            />
            
            <input 
              type="text" 
              placeholder="Portal name (optional)" 
              value={roomName} 
              onChange={(e) => setRoomName(e.target.value)} 
              style={{ width: '100%', padding: '1rem 1.5rem', marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'all 0.3s ease' }} 
            />
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', cursor: 'pointer', fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              <input 
                type="checkbox" 
                checked={e2ee} 
                onChange={(e) => setE2ee(e.target.checked)} 
                style={{ width: '20px', height: '20px', cursor: 'pointer' }} 
              />
              Enable end-to-end encryption
            </label>

            <button 
              type="submit" 
              style={{ width: '100%', padding: '1.25rem', background: 'linear-gradient(135deg, #B91C4D 0%, #8B1538 100%)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '1.125rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 20px rgba(185, 28, 77, 0.4)' }}
            >
              Open Portal
            </button>
          </form>
        </div>
      </main>
      
      <footer style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '2rem', textAlign: 'center', zIndex: 1, background: 'linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent)', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>Powered by</span>
          <img src="/images/maga-energy-logo.png" alt="MAGA Energy" style={{ height: '50px', width: 'auto' }} />
        </div>
        <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem' }}>Soli Deo Gloria</div>
      </footer>
    </>
  );
}
