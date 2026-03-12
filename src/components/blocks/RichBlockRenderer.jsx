import React from 'react';
import { Quote, Fingerprint, Network, LayoutTemplate, Eye, DownloadCloud } from 'lucide-react';

const RichBlockRenderer = ({ blocks }) => {
    if (!blocks) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {blocks.map((block, index) => {
                switch (block.type) {
                    case 'h2':
                        return <h2 key={index} className="text-2xl font-bold text-zinc-900 tracking-tight mt-4">{block.text}</h2>;
                    case 'p':
                        return <p key={index} className="text-lg text-zinc-600 leading-relaxed font-medium">{block.text}</p>;
                    case 'quote':
                        return (
                            <div key={index} className="relative p-8 rounded-3xl bg-zinc-900 text-white my-6 shadow-xl">
                                <Quote size={32} className="absolute text-zinc-700/50 -top-2 -left-2 rotate-180" />
                                <p className="text-xl font-serif italic text-zinc-100 relative z-10 leading-relaxed">{block.text}</p>
                            </div>
                        );
                    case 'grid':
                        return (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
                                {block.items?.map((item, i) => (
                                    <div key={i} className="p-6 rounded-3xl bg-white/60 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow backdrop-blur-sm">
                                        {item.title.includes('意图') ? <Fingerprint className="mb-4 text-blue-500" size={24} /> :
                                            item.title.includes('无界') ? <Network className="mb-4 text-purple-500" size={24} /> :
                                                item.title.includes('活态') ? <LayoutTemplate className="mb-4 text-orange-500" size={24} /> : null}
                                        <h3 className="text-lg font-semibold text-zinc-800 mb-2">{item.title}</h3>
                                        <p className="text-sm text-zinc-500 leading-relaxed mb-6">{item.desc}</p>

                                        {block.hasActions && (
                                            <div className="mt-auto pt-6 border-t border-zinc-100/50 flex items-center gap-3">
                                                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-white border border-zinc-200/60 text-sm font-bold text-zinc-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all shadow-sm">
                                                    <Eye size={16} /> 预览
                                                </button>
                                                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 hover:scale-[1.02] transition-all shadow-md shadow-blue-500/20">
                                                    <DownloadCloud size={16} /> 下载
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        );
                    default:
                        return null;
                }
            })}
        </div>
    );
};

export default RichBlockRenderer;
