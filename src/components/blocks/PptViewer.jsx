import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PptViewer = ({ slides }) => {
    const [current, setCurrent] = useState(0);

    const next = () => setCurrent(p => (p < slides.length - 1 ? p + 1 : p));
    const prev = () => setCurrent(p => (p > 0 ? p - 1 : p));

    if (!slides || slides.length === 0) return null;

    const slide = slides[current];

    return (
        <div className="w-full flex-1 flex flex-col items-center justify-center relative group animate-in fade-in duration-700 h-full">
            <div className={`w-full h-full min-h-[400px] bg-gradient-to-br ${slide.bg} rounded-[32px] shadow-2xl flex flex-col items-center justify-center p-12 text-center text-white relative overflow-hidden transition-all duration-700`}>
                <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />

                {/* 使用 key 强制触发切换动画 */}
                <div key={current} className="relative z-10 flex flex-col items-center gap-6 animate-in slide-in-from-right-8 fade-in duration-500">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight drop-shadow-lg">{slide.title}</h1>
                    <h2 className="text-xl md:text-2xl font-light text-white/90">{slide.subtitle}</h2>
                    <div className="w-16 h-1 bg-white/30 rounded-full my-2" />
                    <p className="text-lg text-white/70 max-w-xl leading-relaxed">{slide.content}</p>
                </div>
            </div>

            {/* 悬浮播放控制条 */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/60 backdrop-blur-xl px-6 py-3.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-xl border border-white/10">
                <button onClick={prev} disabled={current === 0} className="disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 hover:text-blue-400 transition-all p-1">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex items-center gap-2.5">
                    {slides.map((_, idx) => (
                        <div key={idx} className={`rounded-full transition-all ${idx === current ? 'bg-white w-3 h-3 shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-white/30 w-2 h-2'}`} />
                    ))}
                </div>
                <button onClick={next} disabled={current === slides.length - 1} className="disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 hover:text-blue-400 transition-all p-1">
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
};

export default PptViewer;
