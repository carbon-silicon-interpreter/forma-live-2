import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Play, Plus, FileText, Eye, HelpCircle, FileBarChart, Presentation,
    LayoutTemplate, Video, Command, Sparkles, X, Globe, CheckSquare, Square,
    Link, Image, Share2, Monitor, Shield, Upload, Smartphone, IdCard, Database,
    Palette, Bot, Settings2, Compass, FolderOpen
} from 'lucide-react';
import PptViewer from '../../components/blocks/PptViewer';
import previewCover from '../../assets/preview_cover_1773285524855.png';
import previewVideo from '../../assets/preview_video_1773285540702.png';
import previewPpt from '../../assets/preview_ppt_1773285555266.png';
import previewQuiz from '../../assets/preview_quiz_1773285570133.png';
import previewResources from '../../assets/preview_resources_1773285584650.png';
import previewPage from '../../assets/preview_page_1773285601635.png';
import ModulePreview from '../../components/common/ModulePreview';

const getRelevanceScore = (modId, matId) => {
    const hash = (modId.length * 17) + (matId.charCodeAt(0) * 11) + (matId.length * 7);
    return 75 + (hash % 24); // mock score between 75 and 98
};

const EditorView = ({
    materials,
    setMaterials,
    pages,
    setPages,
    globalConfigs,
    previewMaterial,
    setPreviewMaterial
}) => {
    const navigate = useNavigate();
    const [showDeployModal, setShowDeployModal] = useState(false);
    const [deployActiveTab, setDeployActiveTab] = useState('link');
    const [deployCardStyle, setDeployCardStyle] = useState('default');
    const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
    const [showAddModuleModal, setShowAddModuleModal] = useState(false);
    const [modalMode, setModalMode] = useState('ai'); // 'ai' or 'manual'
    const [isUploading, setIsUploading] = useState(false);
    const [rightPanelTab, setRightPanelTab] = useState('modules');

    const [selectedMaterialsPerMod, setSelectedMaterialsPerMod] = useState({});
    const [manualSelectedModTypes, setManualSelectedModTypes] = useState([]); // Now an array for bulk manual
    const [selectedAiModules, setSelectedAiModules] = useState([]); // Tracks selected AI cards for bulk

    const standardModulesList = [
        { id: 'm_cover', title: '封面导览模块', desc: '用于展示 handbook 的封面、导读和开场信息。' },
        { id: 'm_faq', title: 'FAQ页', desc: '预设常见问题及标准解答。' },
        { id: 'm_img', title: '图文案例页', desc: '用于展示案例分析等富文本内容。' },
        { id: 'm_vid', title: '讲解视频页', desc: '上传视频进行操作演示或宣讲。' },
        { id: 'm_quiz', title: '问卷调查页', desc: '收集用户反馈、测验或健康诊断。' },
        { id: 'm_ppt', title: 'PPT介绍页', desc: '嵌入式展示 PPT 文档或产品画册。' },
        { id: 'm_resources', title: '资料下载模块', desc: '用于承接资料、附件和标准交付物下载。' }
    ];

    const getModuleIcon = (id, size = 20) => {
        switch (id) {
            case 'm_cover': return <Compass size={size} />;
            case 'm_vid': return <Video size={size} />;
            case 'm_img': return <LayoutTemplate size={size} />;
            case 'm_faq': return <HelpCircle size={size} />;
            case 'm_quiz': return <FileBarChart size={size} />;
            case 'm_ppt': return <Presentation size={size} />;
            case 'm_resources': return <FolderOpen size={size} />;
            default: return <FileText size={size} />;
        }
    };

    const [createPrompt, setCreatePrompt] = useState('');

    const getConfigMeta = (config) => {
        if (config.type === 'style') {
            return {
                icon: Palette,
                accent: 'bg-blue-50 text-blue-600',
                scopeLabel: 'Handbook Shell / Visual System',
                summary: [
                    config.values.siteName,
                    config.values.fontFamily === 'modern' ? '现代无衬线' : config.values.fontFamily === 'editorial' ? '编辑部衬线' : '理性混合',
                    config.values.primaryColor
                ]
            };
        }

        return {
            icon: Bot,
            accent: 'bg-emerald-50 text-emerald-600',
            scopeLabel: 'Copilot / Insights / Routing',
            summary: [
                config.values.assistantName,
                config.values.responseTone === 'advisor' ? '顾问式回答' : config.values.responseTone === 'proactive' ? '主动引导式' : '讲解式回答',
                pages.find(page => page.id === config.values.riskVideoModuleId)?.name || '风险内容路由'
            ]
        };
    };

    const handleUploadMaterial = () => {
        setIsUploading(true);
        setTimeout(() => {
            const newMat = {
                id: `m_new_${Date.now()} `,
                name: '竞业限制解除协议模板.pdf',
                type: 'pdf',
                visible: true,
                tags: ['新增文件'],
                blocks: [
                    { type: 'h2', text: '竞业限制解除协议模板' },
                    { type: 'p', text: '本模板已由 AI 顾问预审，符合 2026 最新的劳动合同法解释。' }
                ]
            };
            setMaterials(prev => [...prev, newMat]);
        }, 1500);
    };

    const populateAiRecommendations = () => {
        const initialSelections = {};
        const recommendedIds = [];

        // Pick the top 3 most relevant modules based on current materials
        const scoredModules = standardModulesList.map(mod => {
            const mats = materials.map(m => ({ id: m.id, score: getRelevanceScore(mod.id, m.id) }));
            const highRelMats = mats.filter(m => m.score >= 85).map(m => m.id);
            const maxScore = Math.max(0, ...mats.map(m => m.score));
            return { id: mod.id, maxScore, highRelMats };
        }).sort((a, b) => b.maxScore - a.maxScore).slice(0, 3);

        scoredModules.forEach(mod => {
            recommendedIds.push(mod.id);
            initialSelections[mod.id] = mod.highRelMats.length > 0 ? mod.highRelMats : [materials[0]?.id].filter(Boolean);
        });

        setSelectedMaterialsPerMod(initialSelections);
        setSelectedAiModules(recommendedIds); // Default all recommended to be selected
        return recommendedIds; // For rendering filter if needed later
    };

    const handleAnalyze = () => {
        populateAiRecommendations();
        setModalMode('ai');
        setShowAddModuleModal(true);
    };

    const handleCreateBulkPages = (modTypesArray) => {
        if (!modTypesArray || modTypesArray.length === 0) return;

        const newPages = modTypesArray.map((modType, idx) => {
            const newPageType =
                modType === 'm_vid' ? 'video' :
                    modType === 'm_quiz' ? 'questionnaire' :
                        modType === 'm_ppt' ? 'ppt' :
                            modType === 'm_cover' ? 'cover' :
                                modType === 'm_resources' ? 'resources' :
                                    'page';
            const standard = standardModulesList.find(m => m.id === modType);

            // Both modes now use per-module material states
            const selectedMats = selectedMaterialsPerMod[modType] || [];

            return {
                id: `p_new_${Date.now()}_${idx}`,
                name: standard ? standard.title : '新建模块',
                type: newPageType,
                description: '自动生成的页面框架。',
                tags: ['AI生成', '草稿'],
                materials: selectedMats,
                hero: newPageType === 'cover' ? {
                    eyebrow: '新的 handbook 开场',
                    highlight: '请补充封面主标题',
                    description: '这里展示封面模块的开场说明。'
                } : undefined,
                blocks: [
                    { type: 'h1', text: standard ? `${standard.title} 内容` : '新建内容' },
                    { type: 'p', text: '本模块由 AI 自动排版，由于尚未配置详细属性，当前仅显示预览占位符...' }
                ]
            };
        });

        setPages(prev => [...prev, ...newPages]);

        // Instead of navigating to a single page when making multiples, we'll just stay to see the cards.
        // If it's only one, we navigate.
        if (newPages.length === 1) {
            navigate(`/editor/${newPages[0].id}`);
        } else {
            setCreatePrompt(''); // clear prompt if multiple generated
        }
    };

    return (
        <div className="min-h-screen flex flex-col pb-24 relative">
            <div className="px-8 py-6 flex items-center justify-between sticky top-0 z-40 bg-white/30 backdrop-blur-2xl border-b border-white/20">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-white/80 shadow-sm flex items-center justify-center hover:bg-white transition-colors text-zinc-600">
                        <ArrowLeft size={18} />
                    </button>
                    <span className="text-lg font-medium tracking-tight">中小企业用工合规解决方案</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => window.open('/site/default?mode=preview', '_blank')} className="flex items-center gap-2 bg-white text-zinc-700 px-5 py-2.5 rounded-full text-sm font-medium shadow-sm border border-zinc-200 hover:bg-zinc-50 hover:scale-105 transition-all">
                        <Eye size={16} /> 预览
                    </button>
                    <button onClick={() => setShowDeployModal(true)} className="flex items-center gap-2 bg-white text-zinc-700 px-5 py-2.5 rounded-full text-sm font-medium shadow-sm border border-zinc-200 hover:bg-zinc-50 hover:scale-105 transition-all">
                        <Globe size={16} /> 分发
                    </button>
                    <button onClick={() => window.open('/site/default?mode=operate', '_blank')} className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium shadow-[0_4px_14px_0_rgb(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:scale-105 transition-all">
                        <Play size={16} fill="currentColor" /> 运营
                    </button>
                </div>
            </div>

            <div className="flex-1 px-8 md:px-16 mt-8 flex flex-col md:flex-row gap-12 max-w-[1440px] mx-auto w-full">
                <div className="w-full md:w-1/3 flex flex-col gap-6">
                    <div className="flex items-center justify-between mb-2 h-8">
                        <h3 className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">知识来源</h3>
                        <button onClick={() => setShowAddMaterialModal(true)} className="text-zinc-900 hover:text-blue-600 transition-colors p-1"><Plus size={18} /></button>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        {materials.map(mat => (
                            <div key={mat.id} className="group p-3.5 bg-white/50 backdrop-blur-xl border border-white/60 rounded-[22px] shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer" onClick={() => setPreviewMaterial(mat)}>
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className={`p-3 rounded-2xl ${mat.type === 'ppt' ? 'bg-orange-100 text-orange-600' : mat.type === 'pdf' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        <FileText size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm text-zinc-800 truncate">{mat.name}</span>
                                        <span className="text-xs text-zinc-400 mt-0.5">{mat.tags[0]}</span>
                                    </div>
                                </div>
                                <button
                                    className="p-2.5 rounded-full transition-colors shadow-sm bg-white border border-zinc-100 text-zinc-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100"
                                    title="预览源文件"
                                    onClick={(e) => { e.stopPropagation(); setPreviewMaterial(mat); }}
                                >
                                    <Eye size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full md:w-2/3 flex flex-col gap-6">
                    <div className="flex items-center justify-between mb-2 min-h-8 gap-4">
                        <div className="inline-flex bg-zinc-100/80 p-1 rounded-full shadow-sm">
                            <button
                                type="button"
                                onClick={() => setRightPanelTab('modules')}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${rightPanelTab === 'modules' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
                            >
                                模块列表
                            </button>
                            <button
                                type="button"
                                onClick={() => setRightPanelTab('global')}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${rightPanelTab === 'global' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
                            >
                                全局配置
                            </button>
                        </div>
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                                {rightPanelTab === 'modules' ? `已配置 ${pages.length} 个模块` : `共 ${globalConfigs.length} 项配置`}
                            </span>
                    </div>

                    {rightPanelTab === 'modules' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {pages.map(page => (
                                <div key={page.id} onClick={() => navigate(`/editor/${page.id}`)} className="group relative bg-white border border-zinc-100 rounded-[28px] overflow-hidden hover:shadow-2xl hover:shadow-zinc-200/50 hover:-translate-y-1.5 transition-all duration-500 flex flex-col h-full shadow-sm">
                                    {/* Preview Area */}
                                    <div className="h-40 bg-zinc-100 relative overflow-hidden flex items-center justify-center transition-all duration-500">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                                        <ModulePreview page={page} />
                                        <div className="absolute top-4 left-4 z-20">
                                            <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/50 text-[10px] font-bold text-zinc-900 tracking-wider shadow-sm">
                                                {page.type === 'cover' ? '封面导览模块' :
                                                    page.type === 'resources' ? '资料下载模块' :
                                                        page.type === 'video' ? '讲解视频页' :
                                                            page.type === 'ppt' ? 'PPT介绍页' :
                                                                page.type === 'questionnaire' ? '问卷调查页' :
                                                                    '图文案例页'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="text-lg font-bold text-zinc-900 mb-1.5 leading-snug">{page.name}</h4>
                                            <div className="flex gap-1 flex-wrap justify-end">
                                                {page.tags?.slice(0, 1).map(tag => (
                                                    <span key={tag} className="text-[10px] font-medium px-2 py-1 bg-zinc-100/80 rounded-full text-zinc-500">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs text-zinc-400 font-medium mb-4 line-clamp-2">
                                            {page.description || '配置您的模块内容与交互策略'}
                                        </p>

                                        <div className="mt-auto flex items-center justify-end pt-4 border-t border-zinc-50">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/editor/${page.id}`); }}
                                                className="px-5 py-2 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 text-[11px] font-bold transition-all shadow-sm active:scale-95"
                                            >
                                                编辑
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {globalConfigs.map(config => {
                                const meta = getConfigMeta(config);
                                const Icon = meta.icon;

                                return (
                                    <div
                                        key={config.id}
                                        onClick={() => navigate(`/editor/config/${config.id}`)}
                                        className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all flex flex-col group cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="p-7 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`p-3.5 rounded-2xl ${meta.accent} group-hover:bg-zinc-900 group-hover:text-white transition-colors`}>
                                                    <Icon size={22} />
                                                </div>
                                            </div>
                                            <h4 className="text-xl font-bold text-zinc-900 mb-2">{config.name}</h4>
                                            <p className="text-sm text-zinc-500 font-medium mb-6">
                                                {config.description}
                                            </p>

                                            <div className="mt-auto flex items-center justify-end pt-5 border-t border-zinc-50">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        navigate(`/editor/config/${config.id}`);
                                                    }}
                                                    className="px-5 py-2 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-bold transition-all shadow-sm active:scale-95"
                                                >
                                                    编辑
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* 固定的底部输入框与按钮组 */}
            {rightPanelTab === 'modules' && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-40 flex items-end gap-3 justify-center">
                <div className="flex-1 max-w-2xl bg-white/90 backdrop-blur-xl border border-zinc-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-full p-2 pl-6 pr-3 flex items-center gap-3 transition-all hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] ring-1 ring-zinc-900/5">
                    <Sparkles size={20} className="text-blue-500 shrink-0" />
                    <input
                        type="text"
                        value={createPrompt}
                        onChange={e => setCreatePrompt(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleAnalyze();
                        }}
                        placeholder="一句话告诉 AI 你想加什么页面，比如“根据手册加一个FAQ”"
                        className="flex-1 bg-transparent border-none outline-none text-[15px] pb-0.5 text-zinc-800 placeholder:text-zinc-400 font-medium"
                    />
                    <button
                        onClick={handleAnalyze}
                        className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-zinc-800 hover:scale-105 transition-all shadow-sm shrink-0 whitespace-nowrap"
                    >
                        {createPrompt.trim() ? "发送" : "获取推荐"}
                    </button>
                </div>

                {/* 提出来的独立手动按钮 */}
                <button
                    onClick={() => {
                        setSelectedMaterialsPerMod({}); // Clear materials for manual mode
                        setManualSelectedModTypes([]);
                        setModalMode('manual');
                        setShowAddModuleModal(true);
                    }}
                    className="h-[52px] px-6 bg-white/90 backdrop-blur-xl text-zinc-700 border border-zinc-200/50 rounded-full text-[15px] font-bold shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.12)] hover:text-zinc-900 transition-all flex items-center shrink-0"
                >
                    手动添加
                </button>
                </div>
            )}

            {/* Add Module Modal */}
            {showAddModuleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowAddModuleModal(false)}></div>
                    <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                        {/* Modal Header & Quick Edit */}
                        <div className="flex justify-between items-center p-6 border-b border-zinc-100 shrink-0 gap-4">
                            <div className="flex bg-zinc-100/80 p-1 rounded-full shrink-0">
                                <button
                                    onClick={() => setModalMode('ai')}
                                    className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all ${modalMode === 'ai' ? 'bg-white text-blue-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                                >
                                    AI 推荐架构
                                </button>
                                <button
                                    onClick={() => setModalMode('manual')}
                                    className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all ${modalMode === 'manual' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                                >
                                    手动配置
                                </button>
                            </div>

                            {modalMode === 'ai' && (
                                <div className="flex-1 relative max-w-md">
                                    <Sparkles size={16} className="text-blue-500 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={createPrompt}
                                        onChange={e => setCreatePrompt(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleAnalyze();
                                        }}
                                        placeholder="输入想法，回车重新生成推荐..."
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-full pl-10 pr-4 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-zinc-800 placeholder:text-zinc-400"
                                    />
                                </div>
                            )}

                            <button onClick={() => setShowAddModuleModal(false)} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors ml-auto"><X size={20} /></button>
                        </div>

                        {/* Modal Scrollable Content */}
                        <div className="p-8 overflow-y-auto overflow-x-hidden custom-scrollbar">
                            {modalMode === 'ai' ? (
                                <div className="flex flex-col h-full w-full">
                                    <div className="mb-4">
                                        {createPrompt.trim() ? (
                                            <p className="text-sm text-zinc-500 mb-5 font-medium leading-relaxed">根据描述：<span className="text-zinc-800 px-1 font-bold">"{createPrompt}"</span><br />为您匹配了以下标准模块类型，并自动关联了相关度高的资料。</p>
                                        ) : (
                                            <p className="text-sm text-zinc-500 mb-5 font-medium leading-relaxed">系统已经分析了您的资料库，为您智能推荐了以下架构组合：</p>
                                        )}
                                        <div className="flex flex-col gap-6">
                                            {standardModulesList.map((mod) => (
                                                <div key={mod.id} className="flex flex-col p-5 bg-zinc-50 rounded-2xl border border-zinc-100 group shadow-sm transition-all hover:shadow-md hover:border-zinc-300">
                                                    <div className="flex items-center justify-between mb-4 border-b border-zinc-200/50 pb-4">
                                                        <div
                                                            className="flex items-center gap-4 cursor-pointer"
                                                            onClick={() => {
                                                                setSelectedAiModules(prev => prev.includes(mod.id) ? prev.filter(id => id !== mod.id) : [...prev, mod.id])
                                                            }}
                                                        >
                                                            <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${selectedAiModules.includes(mod.id) ? 'bg-blue-600 text-white' : 'bg-white border border-zinc-300 text-transparent group-hover:border-blue-400'}`}>
                                                                <CheckSquare size={16} />
                                                            </div>
                                                            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-zinc-500 group-hover:text-blue-600 transition-colors">
                                                                {getModuleIcon(mod.id, 20)}
                                                            </div>
                                                            <div>
                                                                <h5 className="font-bold text-zinc-900 text-base flex items-center gap-2">
                                                                    {mod.title}
                                                                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold tracking-wide">AI推荐</span>
                                                                </h5>
                                                                <span className="text-xs text-zinc-500 mt-0.5 font-medium">{mod.desc}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 引用资料多选区 (AI) */}
                                                    <div className="flex items-center justify-between mb-3 px-1">
                                                        <span className="text-xs font-bold text-zinc-500 tracking-wider">智能匹配引用资料</span>
                                                        <div className="flex gap-3">
                                                            <button
                                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                                                onClick={() => setSelectedMaterialsPerMod(prev => ({ ...prev, [mod.id]: materials.map(m => m.id) }))}
                                                            >
                                                                全选
                                                            </button>
                                                            <button
                                                                className="text-xs text-zinc-400 hover:text-zinc-600 font-medium transition-colors"
                                                                onClick={() => setSelectedMaterialsPerMod(prev => ({ ...prev, [mod.id]: [] }))}
                                                            >
                                                                全不选
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {materials.map(m => {
                                                            const isSelected = selectedMaterialsPerMod[mod.id]?.includes(m.id);
                                                            const score = getRelevanceScore(mod.id, m.id);
                                                            const isHighRel = score >= 85;

                                                            return (
                                                                <div
                                                                    key={m.id}
                                                                    onClick={() => {
                                                                        setSelectedMaterialsPerMod(prev => {
                                                                            const current = prev[mod.id] || [];
                                                                            const newMats = current.includes(m.id) ? current.filter(id => id !== m.id) : [...current, m.id];
                                                                            return { ...prev, [mod.id]: newMats };
                                                                        });
                                                                    }}
                                                                    className={`cursor-pointer flex items-center gap-3 p-3 rounded-xl border transition-all ${isSelected ? 'bg-blue-50/50 border-blue-200 shadow-sm' : 'bg-white border-zinc-200 hover:border-blue-300'}`}
                                                                >
                                                                    {isSelected ? <CheckSquare size={16} className="text-blue-600 shrink-0" /> : <Square size={16} className="text-zinc-300 shrink-0 group-hover:text-blue-300 transition-colors" />}
                                                                    <div className="flex-1 overflow-hidden flex flex-col pt-0.5">
                                                                        <span className={`text-xs font-bold truncate leading-none ${isSelected ? 'text-blue-900' : 'text-zinc-700'}`}>{m.name}</span>
                                                                    </div>
                                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 tracking-wide ${isHighRel ? 'text-orange-600 bg-orange-100/60' : 'text-zinc-500 bg-zinc-100'}`}>
                                                                        相关性 {score}%
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="sticky bottom-0 bg-white/90 backdrop-blur pt-6 pb-2 mt-4 border-t border-zinc-100 flex justify-end">
                                            <button
                                                disabled={selectedAiModules.length === 0}
                                                onClick={() => {
                                                    handleCreateBulkPages(selectedAiModules);
                                                    setShowAddModuleModal(false);
                                                }}
                                                className="px-10 py-3.5 bg-black text-white rounded-full text-[15px] font-bold tracking-wide hover:bg-zinc-800 transition-all shadow-md disabled:opacity-20 disabled:shadow-none hover:-translate-y-0.5"
                                            >
                                                确认添加 {selectedAiModules.length} 个模块
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl">
                                    <div className="flex flex-col gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-zinc-800 mb-3 pl-1">选择模块类型</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {standardModulesList.map(mod => {
                                                    const isSelMod = manualSelectedModTypes.includes(mod.id);
                                                    return (
                                                        <div
                                                            key={mod.id}
                                                            onClick={() => setManualSelectedModTypes(prev => prev.includes(mod.id) ? prev.filter(id => id !== mod.id) : [...prev, mod.id])}
                                                            className={`cursor-pointer border rounded-2xl p-4 flex flex-col items-center text-center gap-3 transition-all ${isSelMod ? 'bg-zinc-900 border-zinc-900 shadow-md transform scale-[1.02]' : 'bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelMod ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                                                                {getModuleIcon(mod.id, 18)}
                                                            </div>
                                                            <span className={`text-sm font-bold tracking-wide ${isSelMod ? 'text-white' : 'text-zinc-800'}`}>{mod.title}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {manualSelectedModTypes.length > 0 && (
                                            <div className="mt-4 flex flex-col gap-6 border-t border-zinc-200/50 pt-6">
                                                {manualSelectedModTypes.map(modTypeId => {
                                                    const modDef = standardModulesList.find(m => m.id === modTypeId);
                                                    if (!modDef) return null;

                                                    return (
                                                        <div key={modTypeId} className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 shadow-sm">
                                                            <div className="flex items-center gap-3 mb-4 border-b border-zinc-200/60 pb-3">
                                                                <div className="w-8 h-8 rounded shrink-0 bg-white shadow-sm flex items-center justify-center text-zinc-500">
                                                                    {getModuleIcon(modTypeId, 16)}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold text-zinc-900">{modDef.title} 资料配置</span>
                                                                    <span className="text-[10px] text-zinc-500">{modDef.desc}</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between mb-3 px-1">
                                                                <span className="text-xs font-bold text-zinc-500 tracking-wider">选择此模块的关联资料</span>
                                                                <div className="flex gap-3">
                                                                    <button
                                                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                                                        onClick={() => setSelectedMaterialsPerMod(prev => ({ ...prev, [modTypeId]: materials.map(m => m.id) }))}
                                                                    >
                                                                        全选
                                                                    </button>
                                                                    <button
                                                                        className="text-xs text-zinc-400 hover:text-zinc-600 font-medium transition-colors"
                                                                        onClick={() => setSelectedMaterialsPerMod(prev => ({ ...prev, [modTypeId]: [] }))}
                                                                    >
                                                                        全不选
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {materials.map(m => {
                                                                    const isSelected = selectedMaterialsPerMod[modTypeId]?.includes(m.id);
                                                                    const score = getRelevanceScore(modTypeId, m.id);
                                                                    const isHighRel = score >= 85;

                                                                    return (
                                                                        <div
                                                                            key={m.id}
                                                                            onClick={() => {
                                                                                setSelectedMaterialsPerMod(prev => {
                                                                                    const current = prev[modTypeId] || [];
                                                                                    const newMats = current.includes(m.id) ? current.filter(id => id !== m.id) : [...current, m.id];
                                                                                    return { ...prev, [modTypeId]: newMats };
                                                                                });
                                                                            }}
                                                                            className={`cursor-pointer flex items-center gap-3 p-3 rounded-xl border transition-all ${isSelected ? 'bg-blue-50/50 border-blue-200 shadow-sm' : 'bg-white border-zinc-200 hover:border-blue-300'}`}
                                                                        >
                                                                            {isSelected ? <CheckSquare size={16} className="text-blue-600 shrink-0" /> : <Square size={16} className="text-zinc-300 shrink-0 group-hover:text-blue-300 transition-colors" />}
                                                                            <div className="flex-1 overflow-hidden flex flex-col pt-0.5">
                                                                                <span className={`text-xs font-bold truncate leading-none ${isSelected ? 'text-blue-900' : 'text-zinc-700'}`}>{m.name}</span>
                                                                            </div>
                                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 tracking-wide ${isHighRel ? 'text-orange-600 bg-orange-100/60' : 'text-zinc-500 bg-zinc-100'}`}>
                                                                                相关性 {score}%
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        <div className="pt-6 mt-4 border-t border-zinc-100 flex justify-end">
                                            <button
                                                disabled={manualSelectedModTypes.length === 0}
                                                onClick={() => {
                                                    handleCreateBulkPages(manualSelectedModTypes);
                                                    setShowAddModuleModal(false);
                                                }}
                                                className="px-10 py-3.5 bg-black text-white rounded-full text-[15px] font-bold tracking-wide hover:bg-zinc-800 transition-all shadow-md disabled:opacity-20 disabled:shadow-none hover:-translate-y-0.5"
                                            >
                                                确认添加 {manualSelectedModTypes.length} 个模块
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                            }
                        </div >
                    </div >
                </div >
            )
            }
            {/* 源文件预览弹窗 (Modal) */}
            {
                previewMaterial && (
                    <div className="fixed inset-0 z-[100] flex animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewMaterial(null)} />
                        <div className="relative w-full h-full flex flex-col pointer-events-none">
                            <button onClick={() => setPreviewMaterial(null)} className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full pointer-events-auto bg-black/20 hover:bg-black/40 backdrop-blur-md text-white flex items-center justify-center transition-all shadow-lg hover:scale-105 border border-white/10">
                                <X size={24} />
                            </button>
                            <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-zinc-50/50 flex flex-col items-center custom-scrollbar pointer-events-auto">
                                <div className="w-full max-w-4xl bg-white p-2 md:p-10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 min-h-[500px] flex items-center justify-center">
                                    {previewMaterial.type === 'ppt' ? (
                                        <div className="w-full h-full shadow-lg rounded-2xl overflow-hidden border border-zinc-200 aspect-video">
                                            <PptViewer slides={previewMaterial.slides || [{ id: 's1', title: previewMaterial.name, subtitle: 'PPT预览', content: '此文档内容正在转码中...', bg: 'from-blue-900 to-indigo-900' }]} />
                                        </div>
                                    ) : previewMaterial.type === 'video' ? (
                                        <div className="w-full relative rounded-[40px] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.3)] group cursor-pointer aspect-video bg-zinc-900 flex items-center justify-center">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-60"></div>
                                            <Play size={88} className="text-white/80 transition-all z-20" />
                                            <div className="absolute bottom-8 left-8 text-white text-base font-medium z-20 flex items-center gap-3">
                                                <span className="bg-red-600 px-2.5 py-1 rounded text-xs font-bold tracking-wider">MP4</span>
                                                {previewMaterial.name}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex flex-col gap-6 text-zinc-800 leading-relaxed font-medium text-lg max-w-2xl mx-auto">
                                            <h1 className="text-3xl font-black mb-4">{previewMaterial.name}</h1>
                                            {previewMaterial.blocks ? previewMaterial.blocks.map((b, i) => (
                                                <div key={i}>
                                                    {b.type === 'h2' ? <h2 className="text-2xl font-bold mt-4 mb-2">{b.text}</h2> :
                                                        b.type === 'p' ? <p className="text-zinc-600">{b.text}</p> :
                                                            b.type === 'quote' ? <blockquote className="pl-4 border-l-4 border-blue-500 italic text-zinc-500 bg-blue-50/50 py-2 pr-4">{b.text}</blockquote> :
                                                                <div className="p-4 bg-zinc-50 rounded-xl my-4 text-sm text-zinc-500 border border-zinc-100">更多复杂结构内容...</div>}
                                                </div>
                                            )) : (
                                                <div className="text-zinc-400 whitespace-pre-wrap">该源文件尚未完全解析或不支持富文本预览...</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Deploy Modal */}
            {
                showDeployModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDeployModal(false)} />
                        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                            {/* Header */}
                            <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                                        <Share2 size={18} />
                                    </div>
                                    <h3 className="font-bold text-slate-800">分发与分享</h3>
                                </div>
                                <button onClick={() => setShowDeployModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 flex flex-col p-6 overflow-y-auto">

                                {/* Tabs */}
                                <div className="flex p-1 w-full overflow-x-auto bg-slate-100 rounded-lg mb-6 shrink-0 custom-scrollbar">
                                    {[
                                        { id: 'link', label: '链接分享', icon: <Link size={14} /> },
                                        { id: 'miniapp', label: '小程序', icon: <Smartphone size={14} /> },
                                        { id: 'card', label: '生成卡片', icon: <Image size={14} /> },
                                        { id: 'physical', label: '实体名片', icon: <IdCard size={14} /> },
                                        { id: 'banner', label: '易拉宝', icon: <Presentation size={14} /> }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setDeployActiveTab(tab.id)}
                                            className={`flex-none px-4 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all ${deployActiveTab === tab.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                        >
                                            {tab.icon} {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Link Content */}
                                {deployActiveTab === 'link' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase">公开访问链接</label>
                                            <div className="flex gap-2">
                                                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 font-mono truncate">
                                                    https://forma.ai/p/ap-product-faq-v2
                                                </div>
                                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm">
                                                    复制
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-400">任何拥有此链接的人都可以查看当前发布的版本。</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase">访问权限</label>
                                            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                                                <label className="flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                            <Monitor size={16} />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-700">公开访问</div>
                                                            <div className="text-xs text-slate-400">无需登录即可查看</div>
                                                        </div>
                                                    </div>
                                                    <div className="w-4 h-4 rounded-full border-4 border-blue-600 bg-white"></div>
                                                </label>
                                                <label className="flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer opacity-50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                            <Shield size={16} />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-700">仅限团队</div>
                                                            <div className="text-xs text-slate-400">需要登录 Forma 账号</div>
                                                        </div>
                                                    </div>
                                                    <div className="w-4 h-4 rounded-full border border-slate-300 bg-white"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Content for Miniapp, Card, Physical, Banner */}
                                {['miniapp', 'card', 'physical', 'banner'].includes(deployActiveTab) && (
                                    <div className="flex gap-6 h-full animate-in fade-in duration-300">
                                        {/* Preview */}
                                        <div className="w-2/3 bg-slate-100 rounded-xl p-8 flex items-center justify-center overflow-hidden relative">
                                            <div className={`${deployActiveTab === 'banner' ? 'w-48 aspect-[9/16]' : deployActiveTab === 'miniapp' ? 'w-72 aspect-[5/4] rounded-2xl' : deployActiveTab === 'card' ? 'w-64 aspect-[3/4]' : 'w-64 aspect-[3/5]'} bg-white rounded-lg shadow-xl flex flex-col overflow-hidden transition-all duration-300 ${deployCardStyle === 'dark' ? 'bg-slate-800 text-white' :
                                                deployCardStyle === 'colorful' && deployActiveTab !== 'physical' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' :
                                                    deployCardStyle === 'enterprise' && deployActiveTab === 'physical' ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-amber-400' : 'bg-white text-slate-800'
                                                }`}>

                                                {/* Common Inner Content Layouts based on ActiveTab */}
                                                <div className="flex-1 p-6 flex flex-col">
                                                    {deployActiveTab === 'miniapp' && <div className="text-xs mb-2 opacity-70 flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-current opacity-50"></div> 中小企业解决方案</div>}
                                                    {deployActiveTab !== 'miniapp' && <div className={`w-8 h-8 rounded ${deployActiveTab === 'physical' ? 'bg-current opacity-20' : 'bg-white/20'} mb-4`}></div>}

                                                    <div className={`text-xl font-bold mb-2 leading-tight ${deployActiveTab === 'banner' ? 'mt-8 text-2xl' : ''}`}>{deployActiveTab === 'miniapp' ? '推荐您看：' : ''}中小企业<br />用工合规解决方案</div>

                                                    {deployActiveTab === 'physical' ? (
                                                        <div className="text-xs mb-6 opacity-80 space-y-1">
                                                            <div className="font-bold">王大拿</div>
                                                            <div>资深用工顾问</div>
                                                            <div>138-0000-0000</div>
                                                        </div>
                                                    ) : (
                                                        <div className={`text-xs opacity-60 mb-6 ${deployActiveTab === 'banner' ? 'mt-4' : ''}`}>Forma 知识交付平台生成</div>
                                                    )}

                                                    <div className={`mt-auto bg-white p-2 rounded-lg self-center shadow-sm ${deployActiveTab === 'banner' ? 'w-24 h-24 mb-10' : deployActiveTab === 'miniapp' ? 'w-full h-32 mt-4 flex items-center justify-center' : deployActiveTab === 'physical' ? 'w-16 h-16 self-end' : 'w-20 h-20'}`}>
                                                        {deployActiveTab === 'miniapp' ? (
                                                            <div className="w-16 h-16 rounded-full bg-slate-900 shadow-inner opacity-20 flex items-center justify-center text-[8px] text-white overflow-hidden">小程序码</div>
                                                        ) : (
                                                            <div className="w-full h-full bg-slate-900 shadow-inner opacity-20 flex items-center justify-center text-[8px] text-white overflow-hidden">二维码</div>
                                                        )}
                                                    </div>
                                                    {deployActiveTab !== 'miniapp' && deployActiveTab !== 'physical' && <div className={`text-[10px] text-center mt-2 opacity-50 ${deployActiveTab === 'banner' ? 'mb-8' : ''}`}>长按/扫描识别二维码</div>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Settings panel logic for each type */}
                                        <div className="flex-1 flex flex-col gap-6">
                                            {deployActiveTab === 'miniapp' && (
                                                <div className="space-y-4">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">转发样式配置</label>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="text-xs text-slate-500 mb-1 block">封面标题</label>
                                                            <input type="text" className="w-full border border-slate-200 rounded-lg p-2 text-sm" placeholder="推荐您看：中小企业..." defaultValue="推荐您看：中小企业..." />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-slate-500 mb-1 block">展示配图</label>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <button onClick={() => setDeployCardStyle('default')} className={`p-2 border rounded text-xs ${deployCardStyle === 'default' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200'}`}>封面截图</button>
                                                                <button onClick={() => setDeployCardStyle('dark')} className={`p-2 border rounded text-xs ${deployCardStyle === 'dark' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200'}`}>主题色渐变</button>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-slate-500 mb-1 block">嵌入路径</label>
                                                            <div className="text-xs bg-slate-50 p-2 border border-slate-200 rounded font-mono truncate">pages/index/index?id=fw9x</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {deployActiveTab === 'card' && (
                                                <div className="space-y-4">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">社交卡片配置</label>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="text-xs text-slate-500 mb-1 block">卡片样式</label>
                                                            <div className="grid grid-cols-1 gap-2">
                                                                <button onClick={() => setDeployCardStyle('default')} className={`p-2 rounded-lg border text-left flex items-center gap-3 transition-all ${deployCardStyle === 'default' ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                                                                    <div className="w-6 h-6 rounded bg-white border border-slate-200 shadow-sm"></div><span className="text-sm font-medium text-slate-700">简约白</span>
                                                                </button>
                                                                <button onClick={() => setDeployCardStyle('dark')} className={`p-2 rounded-lg border text-left flex items-center gap-3 transition-all ${deployCardStyle === 'dark' ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                                                                    <div className="w-6 h-6 rounded bg-slate-800 shadow-sm"></div><span className="text-sm font-medium text-slate-700">深邃黑</span>
                                                                </button>
                                                                <button onClick={() => setDeployCardStyle('colorful')} className={`p-2 rounded-lg border text-left flex items-center gap-3 transition-all ${deployCardStyle === 'colorful' ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                                                                    <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm"></div><span className="text-sm font-medium text-slate-700">品牌色</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <input type="checkbox" id="showDate" defaultChecked className="rounded border-slate-300" />
                                                            <label htmlFor="showDate" className="text-sm text-slate-600">显示生成日期</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {deployActiveTab === 'physical' && (
                                                <div className="space-y-4">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">名片排版配置</label>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="text-xs text-slate-500 mb-1 block">关联名片人</label>
                                                            <select className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-700">
                                                                <option>王大拿 (资深用工顾问)</option>
                                                                <option>李经理 (客户代表)</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-slate-500 mb-1 block">材质预览</label>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <button onClick={() => setDeployCardStyle('default')} className={`p-2 border rounded text-xs ${deployCardStyle === 'default' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200'}`}>标准白卡</button>
                                                                <button onClick={() => setDeployCardStyle('enterprise')} className={`p-2 border rounded text-xs ${deployCardStyle === 'enterprise' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200'}`}>黑金特种纸</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {deployActiveTab === 'banner' && (
                                                <div className="space-y-4">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">易拉宝展具配置</label>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="text-xs text-slate-500 mb-1 block">常用尺寸规范</label>
                                                            <select className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-700">
                                                                <option>80cm × 200cm (推荐)</option>
                                                                <option>60cm × 160cm</option>
                                                                <option>120cm × 200cm</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-slate-500 mb-1 block">辅助标语</label>
                                                            <textarea className="w-full border border-slate-200 rounded-lg p-2 text-sm" rows={2} placeholder="让合规管理更简单..." defaultValue="扫码轻松获取完整方案\n在线专属客服解答"></textarea>
                                                        </div>
                                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                                                            <div className="text-amber-500 mt-0.5"><Presentation size={16} /></div>
                                                            <p className="text-xs text-amber-800 leading-relaxed">导出的 PDF 已包含出血位(3mm)，颜色模式已自动转为 CMYK 以确保印刷无色差。</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-auto">
                                                <button onClick={() => setShowDeployModal(false)} className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                                                    <Upload size={16} />
                                                    {deployActiveTab === 'miniapp' ? '同步至微信' :
                                                        deployActiveTab === 'banner' ? '下载印刷级 PDF' : '导出高清图片'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                )
            }

            {/* Add Material Modal */}
            {
                showAddMaterialModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowAddMaterialModal(false)}></div>
                        <div className="relative bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-zinc-100">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-900 tracking-tight">添加培训物料或业务系统数据至知识库</h3>
                                    <p className="text-sm text-zinc-500 mt-1">Living Handbook 引擎会自动将素材切片分析，以便用于模块推荐及内容智能填充。</p>
                                </div>
                                <button onClick={() => setShowAddMaterialModal(false)} className="p-2.5 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors bg-zinc-50"><X size={20} /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {/* Local File */}
                                <div onClick={isUploading ? undefined : handleUploadMaterial} className={`border border-zinc-200 rounded-2xl p-6 flex flex-col items-start gap-4 transition-all group ${isUploading ? 'bg-zinc-50 opacity-70 cursor-not-allowed' : 'bg-white hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30 cursor-pointer'}`}>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 ${isUploading ? 'bg-blue-100 text-blue-500' : 'bg-zinc-100 text-zinc-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                                        {isUploading ? <Sparkles size={24} className="animate-spin" /> : <Plus size={24} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-800 text-base">添加本地文件</p>
                                        <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">支持 PDF, PPT, Word 等主流格式文档上传。{isUploading && <span className="text-blue-600 font-medium block mt-1">正在智能解析中...</span>}</p>
                                    </div>
                                </div>

                                {/* URL */}
                                <div className="border border-zinc-200 rounded-2xl p-6 flex flex-col items-start gap-4 transition-all group bg-white hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30 cursor-pointer">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white">
                                        <Globe size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-800 text-base">导入网络链接</p>
                                        <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">输入公网可访问的文章、页面或视频链接进行抓取解析。</p>
                                    </div>
                                </div>

                                {/* Manual Text */}
                                <div className="border border-zinc-200 rounded-2xl p-6 flex flex-col items-start gap-4 transition-all group bg-white hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30 cursor-pointer">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-800 text-base">手动输入文本</p>
                                        <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">直接粘贴或键入长篇文本内容，例如会议纪要或非公开规定。</p>
                                    </div>
                                </div>

                                {/* Third Platform */}
                                <div className="border border-zinc-200 rounded-2xl p-6 flex flex-col items-start gap-4 transition-all group bg-white hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30 cursor-pointer relative overflow-hidden">
                                    <div className="absolute top-4 right-4 bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-md tracking-wider">开发中</div>
                                    <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white">
                                        <Database size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-800 text-base">连接第三方知识库</p>
                                        <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">接入企业微信文档、飞书文档、Notion 等现有业务系统的数据流。</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default EditorView;
