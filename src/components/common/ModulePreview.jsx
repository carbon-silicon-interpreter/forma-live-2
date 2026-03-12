import React from 'react';
import { 
    Compass, Video, LayoutTemplate, FileText, 
    Play, ShieldCheck, DownloadCloud, FileBarChart,
    Presentation, FolderOpen, HelpCircle
} from 'lucide-react';

const ModulePreview = ({ page }) => {
    const renderPreview = () => {
        switch (page.type) {
            case 'cover':
                return (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 border border-white/20">
                            <ShieldCheck size={24} className="text-white" />
                        </div>
                        <h5 className="text-white text-sm font-bold leading-tight mb-2 line-clamp-2">
                            {page.hero?.highlight || page.name}
                        </h5>
                        <p className="text-white/60 text-[10px] line-clamp-2 px-4 italic">
                            {page.hero?.eyebrow || '智能封面导读'}
                        </p>
                    </div>
                );
            case 'video':
                return (
                    <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center relative overflow-hidden group/preview">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 z-20 group-hover/preview:scale-110 transition-transform">
                            <Play size={24} className="text-white fill-white ml-0.5" />
                        </div>
                        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5">
                            <span className="bg-blue-600 text-[8px] font-bold text-white px-1.5 py-0.5 rounded uppercase tracking-wider">Live</span>
                            <span className="text-white/80 text-[9px] font-medium truncate max-w-[100px]">{page.name}</span>
                        </div>
                        <div className="absolute bottom-3 right-3 z-20">
                            <span className="text-white/60 text-[8px] font-mono">15:00</span>
                        </div>
                    </div>
                );
            case 'ppt':
                return (
                    <div className="w-full h-full bg-zinc-50 flex flex-col p-4 border-t-4 border-blue-600">
                        <div className="flex items-center gap-2 mb-4">
                            <Presentation size={14} className="text-blue-600" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Slides Preview</span>
                        </div>
                        <div className="flex-1 bg-white rounded-xl border border-zinc-200 shadow-sm p-4 flex flex-col">
                            <div className="w-full h-2 bg-zinc-100 rounded-full mb-2" />
                            <div className="w-3/4 h-2 bg-zinc-100 rounded-full mb-4" />
                            <div className="grid grid-cols-2 gap-2 mt-auto">
                                <div className="aspect-video bg-zinc-50 rounded border border-zinc-100 flex items-center justify-center">
                                    <div className="w-4 h-0.5 bg-zinc-200" />
                                </div>
                                <div className="aspect-video bg-zinc-50 rounded border border-zinc-100 flex items-center justify-center">
                                    <div className="w-4 h-0.5 bg-zinc-200" />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'questionnaire':
                return (
                    <div className="w-full h-full bg-emerald-50 flex flex-col p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <FileBarChart size={14} className="text-emerald-600" />
                            <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">Survey Form</span>
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between">
                                    <div className="w-2/3 h-1.5 bg-emerald-100 rounded-full" />
                                    <div className="w-3 h-3 rounded-full border border-emerald-200" />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'resources':
                return (
                    <div className="w-full h-full bg-zinc-50 flex flex-col p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <FolderOpen size={14} className="text-zinc-400" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Resource Pack</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 flex-1 items-end">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-white p-2 rounded-xl border border-zinc-100 shadow-sm flex flex-col gap-2">
                                    <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <FileText size={12} />
                                    </div>
                                    <div className="w-full h-1 bg-zinc-100 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'page':
            default:
                return (
                    <div className="w-full h-full bg-white flex flex-col p-6 overflow-hidden">
                        <div className="flex items-center gap-2 mb-4">
                            <LayoutTemplate size={14} className="text-zinc-300" />
                        </div>
                        <div className="space-y-3">
                            <div className="w-full h-3 bg-zinc-100 rounded-full" />
                            <div className="w-11/12 h-3 bg-zinc-100 rounded-full" />
                            <div className="w-full h-3 bg-zinc-100 rounded-full" />
                            <div className="w-2/3 h-3 bg-zinc-100 rounded-full" />
                        </div>
                        <div className="mt-6 flex flex-col gap-3">
                            <div className="w-full h-24 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 flex items-center justify-center">
                                <FileText size={20} className="text-zinc-200" />
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="w-full h-full overflow-hidden select-none pointer-events-none">
            {renderPreview()}
        </div>
    );
};

export default ModulePreview;
