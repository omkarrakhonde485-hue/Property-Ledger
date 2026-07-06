import { MeshGradient } from '@paper-design/shaders-react';

export default function MeshGradientBackground({ className = '', style = {} }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} style={style}>
      <MeshGradient
        colors={['#0a1834', '#1e3a8a', '#2563eb', '#3b82f6', '#7dd3fc']}
        speed={0.3}
        distortion={0.5}
        swirl={0.15}
        grainMixer={0.05}
        style={{ width: '100%', height: '100%' }}
      />
      {/* Subtle vignette for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50/30" />
    </div>
  );
}