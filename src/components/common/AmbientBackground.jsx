import React from 'react';

const AmbientBackground = () => (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#f4f5f7] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-pink-200/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDuration: '12s' }} />
    </div>
);

export default AmbientBackground;
