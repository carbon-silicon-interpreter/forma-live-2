import React, { useEffect, useState, useMemo, useRef } from 'react';
import PreviewView from '../PreviewView/PreviewView';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Save, RefreshCw, Sparkles, Send, Palette, Bot,
    CheckCircle2, WandSparkles, Settings2, Eye, Settings, Brain
} from 'lucide-react';

const CONFIG_META = {
    style: {
        icon: Palette,
        badge: '风格系统',
        title: '全局风格配置',
        description: '左侧只编辑 living handbook 的名称、标识和视觉系统；模块内容不在这里定义。',
        previewDescription: '中间只预览 handbook 壳层和非模块区块；模块内容会以占位态展示，不做实时重算。'
    },
    ai: {
        icon: Bot,
        badge: '助理策略',
        title: 'AI助力配置',
        description: '左侧是 AI 助理的身份、路由和洞察策略。调整后可以再更新中间预览。',
        previewDescription: '建议切到运营视图检查 AI编辑 洞察和引导链路是否合理。'
    }
};

const STYLE_THEME_TOKENS = {
    brand: {
        heroGradient: 'from-blue-600 to-indigo-600',
        accentText: 'text-blue-600',
        accentSoft: 'bg-blue-50 text-blue-600',
        auraOne: 'bg-blue-500/10',
        auraTwo: 'bg-purple-500/10'
    },
    slate: {
        heroGradient: 'from-slate-700 to-zinc-900',
        accentText: 'text-zinc-700',
        accentSoft: 'bg-zinc-100 text-zinc-700',
        auraOne: 'bg-slate-400/10',
        auraTwo: 'bg-zinc-500/10'
    },
    emerald: {
        heroGradient: 'from-emerald-600 to-teal-600',
        accentText: 'text-emerald-600',
        accentSoft: 'bg-emerald-50 text-emerald-600',
        auraOne: 'bg-emerald-500/10',
        auraTwo: 'bg-teal-500/10'
    }
};

const STYLE_SURFACE_TOKENS = {
    glass: 'bg-white/70 backdrop-blur-xl border border-white/90',
    solid: 'bg-white border border-zinc-200',
    editorial: 'bg-stone-50/95 border border-stone-200'
};

const STYLE_FONT_TOKENS = {
    modern: {
        root: 'font-sans',
        hero: 'font-sans'
    },
    editorial: {
        root: 'font-serif',
        hero: 'font-serif'
    },
    balanced: {
        root: 'font-sans',
        hero: 'font-serif'
    }
};

const STYLE_BACKGROUND_MOOD_TOKENS = {
    calm: {
        auraOne: 'opacity-30 scale-95',
        auraTwo: 'opacity-20 scale-90'
    },
    dynamic: {
        auraOne: 'opacity-55 scale-100',
        auraTwo: 'opacity-50 scale-100'
    },
    editorial: {
        auraOne: 'opacity-18 scale-90',
        auraTwo: 'opacity-15 scale-85'
    }
};

const STYLE_DENSITY_TOKENS = {
    spacious: {
        shellPadding: 'p-10',
        sectionGap: 'gap-8',
        moduleHeight: 'h-44'
    },
    balanced: {
        shellPadding: 'p-8',
        sectionGap: 'gap-6',
        moduleHeight: 'h-36'
    },
    compact: {
        shellPadding: 'p-6',
        sectionGap: 'gap-4',
        moduleHeight: 'h-28'
    }
};

const STYLE_OPTION_LABELS = {
    themeTone: {
        brand: '品牌蓝',
        slate: '专业灰',
        emerald: '增长绿'
    },
    fontFamily: {
        modern: '现代无衬线',
        editorial: '编辑部衬线',
        balanced: '理性混合'
    },
    surfaceStyle: {
        glass: '玻璃卡片',
        solid: '纯白卡片',
        editorial: '手册质感'
    },
    backgroundMood: {
        calm: '克制平稳',
        dynamic: '流动科技感',
        editorial: '安静阅读感'
    },
    layoutDensity: {
        spacious: '宽松留白',
        balanced: '均衡',
        compact: '紧凑'
    }
};

const COLOR_SWATCHES = [
    '#2563eb',
    '#4f46e5',
    '#059669',
    '#0f766e',
    '#334155',
    '#5b4636',
    '#be123c',
    '#d97706'
];

const isValidHexColor = (value) => /^#([0-9a-fA-F]{6})$/.test(value || '');
const getSafeColorValue = (value, fallback = '#2563eb') => (isValidHexColor(value) ? value : fallback);
const getStyleOptionLabel = (fieldId, value) => STYLE_OPTION_LABELS[fieldId]?.[value] || value || '未设置';

const summarizeStyleAdjustments = (prompt, values) => {
    const nextValues = { ...values };
    const notes = [];

    if (/专业|稳重|可信|正式|克制/.test(prompt)) {
        nextValues.themeTone = 'slate';
        nextValues.fontFamily = 'balanced';
        nextValues.backgroundMood = 'calm';
        nextValues.layoutDensity = 'spacious';
        nextValues.primaryColor = '#334155';
        nextValues.secondaryColor = '#0f172a';
        nextValues.accentColor = '#475569';
        notes.push('整体切到更稳重的专业灰基调');
        notes.push('收紧了颜色组合和页面节奏');
    }

    if (/手册|handbook|附录|onboarding/.test(prompt)) {
        nextValues.fontFamily = 'editorial';
        nextValues.surfaceStyle = 'editorial';
        nextValues.backgroundMood = 'editorial';
        nextValues.primaryColor = '#5b4636';
        nextValues.secondaryColor = '#8b7355';
        nextValues.accentColor = '#2f241d';
        notes.push('站点被调整成更像 living handbook 的阅读质感');
    }

    if (/科技|年轻|清爽/.test(prompt)) {
        nextValues.themeTone = 'brand';
        nextValues.fontFamily = 'modern';
        nextValues.surfaceStyle = 'glass';
        nextValues.backgroundMood = 'dynamic';
        nextValues.primaryColor = '#2563eb';
        nextValues.secondaryColor = '#4f46e5';
        nextValues.accentColor = '#0f172a';
        notes.push('切回更轻盈的品牌蓝和现代无衬线风格');
    }

    if (/增长|陪跑|激励/.test(prompt)) {
        nextValues.themeTone = 'emerald';
        nextValues.surfaceStyle = 'solid';
        nextValues.backgroundMood = 'dynamic';
        nextValues.primaryColor = '#059669';
        nextValues.secondaryColor = '#0f766e';
        nextValues.accentColor = '#064e3b';
        notes.push('切换到更偏增长表达的绿色体系');
    }

    if (/字体|字形|排版/.test(prompt)) {
        nextValues.fontFamily = 'editorial';
        notes.push('将字体气质切换到更有内容感的衬线体系');
    }

    if (/留白|呼吸|宽松/.test(prompt)) {
        nextValues.layoutDensity = 'spacious';
        notes.push('加大了壳层页面的留白');
    }

    if (/紧凑|密度|信息量/.test(prompt)) {
        nextValues.layoutDensity = 'compact';
        notes.push('压缩了壳层页面的版面密度');
    }

    if (notes.length === 0) {
        notes.push('基于当前页面结构生成了一版风格优化草案');
    }

    nextValues.supplementalRequirements = prompt;

    return { nextValues, notes };
};

const summarizeAiAdjustments = (prompt, values, pages) => {
    const nextValues = { ...values };
    const notes = [];
    const questionnairePage = pages.find(page => page.type === 'questionnaire');
    const resourcePage = pages.find(page => page.type === 'resources');
    const videoPage = pages.find(page => page.type === 'video');

    if (/主动|转化|引导|成交/.test(prompt)) {
        nextValues.responseTone = 'proactive';
        nextValues.assistantName = '转化顾问 AI编辑';
        nextValues.welcomeMessage = '你好，我会先帮您识别风险和优先级，再把您带到最值得先看的模块。如果方便，建议先做 1 分钟诊断。';
        nextValues.quickActionAssessment = '先帮我做 1 分钟风险诊断';
        nextValues.quickActionContract = '给我一套可直接复用的标准资料';
        nextValues.quickActionRisk = '先看最容易踩坑的风险点';
        notes.push('AI编辑 已切到更主动的引导式回答');
    }

    if (/顾问|审慎|专业|稳妥/.test(prompt)) {
        nextValues.responseTone = 'advisor';
        nextValues.assistantName = '专业顾问 AI编辑';
        nextValues.welcomeMessage = '你好，我会先帮您判断问题属于诊断、资料还是风险排查，再给出最合适的下一步。';
        notes.push('AI编辑 被调整成更审慎的顾问式语气');
    }

    if (/讲解|教学|解释/.test(prompt)) {
        nextValues.responseTone = 'teaching';
        nextValues.welcomeMessage = '你好，我会先把问题和边界讲清楚，再推荐适合继续深入的模块。';
        notes.push('AI编辑 回答被调整成更偏讲解式');
    }

    if (/问卷|诊断|体检/.test(prompt) && questionnairePage) {
        nextValues.assessmentModuleId = questionnairePage.id;
        nextValues.quickActionAssessment = '带我做企业风险诊断';
        notes.push(`诊断意图会优先进入「${questionnairePage.name}」`);
    }

    if (/合同|附件|模板|资料/.test(prompt)) {
        if (resourcePage) {
            nextValues.resourcesModuleId = resourcePage.id;
        }
        notes.push('合同和资料诉求统一收束到了标准资料链路');
    }

    if (/视频|风险|避坑|仲裁/.test(prompt) && videoPage) {
        nextValues.riskVideoModuleId = videoPage.id;
        notes.push(`风险类问题会优先跳到「${videoPage.name}」`);
    }

    if (/运营|洞察|意图/.test(prompt)) {
        nextValues.insightsTitle = 'AI编辑 高意向访客洞察';
        nextValues.painPointHeadline = '高意向用户集中在追问风险边界和下一步动作';
        nextValues.painPointSummary = '运营数据说明，高意向用户不只是在问概念，而是在持续追问风险边界、资料领取和下一步落地动作。AI编辑 应优先把这些人带到诊断或标准资料模块。';
        notes.push('运营洞察口径已重写成更偏线索识别的表达');
    }

    if (notes.length === 0) {
        notes.push('基于当前模块结构生成了一版 AI 助理优化草案');
    }

    return { nextValues, notes };
};

function GlobalConfigEditorView({ globalConfigs, setGlobalConfigs, pages, materials }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const config = globalConfigs.find(item => item.id === id);
    const meta = config ? CONFIG_META[config.type] : null;
    const MetaIcon = meta?.icon;

    const [localName, setLocalName] = useState('');
    const [draftValues, setDraftValues] = useState({});
    const [previewValues, setPreviewValues] = useState({});
    const [previewMode, setPreviewMode] = useState('preview');
    const [previewActiveDoc, setPreviewActiveDoc] = useState(null);
    const [leftTab, setLeftTab] = useState('config');
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastAiRun, setLastAiRun] = useState(null);
    // Per-section edit state
    const [sectionEditing, setSectionEditing] = useState({}); // { [sectionId]: boolean }
    const [sectionDrafts, setSectionDrafts] = useState({});   // { [sectionId]: partial values snapshot }
    const messagesEndRef = useRef(null);

    const startEditSection = (sectionId, fieldIds) => {
        const snapshot = {};
        fieldIds.forEach(fid => { snapshot[fid] = draftValues[fid]; });
        setSectionDrafts(prev => ({ ...prev, [sectionId]: snapshot }));
        setSectionEditing(prev => ({ ...prev, [sectionId]: true }));
    };
    const cancelEditSection = (sectionId, fieldIds) => {
        const snapshot = sectionDrafts[sectionId] || {};
        setDraftValues(prev => ({ ...prev, ...snapshot }));
        setSectionEditing(prev => ({ ...prev, [sectionId]: false }));
    };
    const saveSection = (sectionId) => {
        setIsSaving(true);
        setTimeout(() => {
            setGlobalConfigs(prev => prev.map(item =>
                item.id === id ? { ...item, name: localName.trim(), values: draftValues } : item
            ));
            setIsSaving(false);
        }, 400);
        setSectionEditing(prev => ({ ...prev, [sectionId]: false }));
    };

    useEffect(() => {
        if (!config) {
            return;
        }

        setLocalName(config.name);
        setDraftValues(config.values);
        setPreviewValues(config.values);
        setPreviewMode(config.type === 'ai' ? 'operate' : 'preview');
        setPreviewActiveDoc(pages[0] || null);
        setLeftTab('config');
        setLastAiRun(null);
        setChatMessages([
            {
                role: 'ai',
                text: config.type === 'style'
                    ? '我已经基于当前业务场景生成了一版站点风格草案。你可以直接改左侧参数，或者让我继续往更专业、更像 handbook 的方向收敛。'
                    : '我已经接管 AI编辑 的身份、快捷问题、路由策略和运营洞察口径。你可以告诉我应该把用户先引到哪里。'
            }
        ]);
    }, [config?.id, pages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, isGenerating]);

    const previewConfigs = useMemo(() => (
        globalConfigs.map(item => (
            item.id === id ? { ...item, name: localName, values: previewValues } : item
        ))
    ), [globalConfigs, id, localName, previewValues]);

    if (!config || !meta) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 text-zinc-400">找不到该配置项</h2>
                    <button onClick={() => navigate('/editor')} className="text-blue-600 hover:underline font-bold">返回编辑页</button>
                </div>
            </div>
        );
    }

    const isPreviewDirty = JSON.stringify(draftValues) !== JSON.stringify(previewValues);
    const isDraftDirty = localName !== config.name || JSON.stringify(draftValues) !== JSON.stringify(config.values);

    const applyAiChanges = (prompt) => (
        config.type === 'style'
            ? summarizeStyleAdjustments(prompt, draftValues)
            : summarizeAiAdjustments(prompt, draftValues, pages)
    );

    const handleSave = () => {
        if (!localName.trim()) {
            return;
        }

        setIsSaving(true);
        setTimeout(() => {
            setGlobalConfigs(prev => prev.map(item => (
                item.id === id ? { ...item, name: localName.trim(), values: draftValues } : item
            )));
            setIsSaving(false);
        }, 500);
    };

    const handleRefreshPreview = () => {
        setPreviewValues(draftValues);
        setPreviewActiveDoc(pages[0] || null);
    };

    const handleCopilotSubmit = (event) => {
        event.preventDefault();
        if (!chatInput.trim()) {
            return;
        }

        const prompt = chatInput.trim();
        const result = applyAiChanges(prompt);

        setChatMessages(prev => [...prev, { role: 'user', text: prompt }]);
        setChatInput('');
        setIsGenerating(true);

        setTimeout(() => {
            setDraftValues(result.nextValues);
            setLastAiRun({ prompt, notes: result.notes });
            setChatMessages(prev => [...prev, { role: 'ai', text: `我已经更新草稿：${result.notes.join('；')}。现在可以点左侧的“更新预览”，看看真实页面效果。` }]);
            setIsGenerating(false);
        }, 900);
    };

    const renderCopilotPanel = () => (
        <div className="w-[420px] shrink-0 bg-white border-l border-zinc-200 flex flex-col shadow-[-16px_0_48px_-24px_rgba(0,0,0,0.12)] z-10">
            <div className="p-6 border-b border-zinc-100 bg-white">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
                        <Brain size={20} />
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-bold text-base text-zinc-900 truncate">AI编辑</h4>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 border-b border-zinc-100 bg-white flex flex-wrap gap-2">
                {config.aiSuggestions.map(suggestion => (
                    <button
                        key={suggestion}
                        type="button"
                        onClick={() => setChatInput(suggestion)}
                        className="px-3 py-1.5 rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700 hover:bg-zinc-900 hover:text-white transition-colors"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6 custom-scrollbar bg-white">
                {chatMessages.map((message, index) => (
                    <div key={index} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                        {message.role === 'ai' && (
                            <div className="mb-2" />
                        )}
                        <div className={`px-5 py-4 rounded-[1.5rem] text-[14px] leading-relaxed max-w-[90%] shadow-sm ${message.role === 'user'
                            ? 'bg-zinc-900 text-white rounded-br-none shadow-xl'
                            : 'bg-zinc-50 border border-zinc-100 text-zinc-800 rounded-bl-none'
                            }`}>
                            {message.text}
                        </div>
                    </div>
                ))}
                {isGenerating && (
                    <div className="flex items-center gap-3 text-indigo-600 text-sm bg-indigo-50/50 border border-indigo-100/50 w-full px-5 py-4 rounded-2xl rounded-bl-none shadow-sm animate-pulse">
                        <RefreshCw size={18} className="animate-spin" />
                        <span className="font-bold">正在根据您的指令刷新内容...</span>
                    </div>
                )}
                {lastAiRun && !isGenerating && (
                    <div className="rounded-[28px] border border-zinc-200 bg-zinc-50/80 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <WandSparkles size={16} className="text-zinc-600" />
                            <span className="text-sm font-black text-zinc-900">最近一次 AI 变更</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            {lastAiRun.notes.map(note => (
                                <div key={note} className="flex items-start gap-3">
                                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-zinc-700 font-medium leading-relaxed">{note}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            <div className="p-6 border-t border-zinc-100 bg-white shrink-0">
                <form onSubmit={handleCopilotSubmit} className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-0 group-focus-within:opacity-20 transition-opacity duration-300" />
                    <textarea
                        value={chatInput}
                        onChange={(event) => setChatInput(event.target.value)}
                        placeholder={config.type === 'style' ? '比如：把页面做得更像一本专业 handbook，减少销售感。' : '比如：先引导用户做诊断，再推荐资料。'}
                        rows={4}
                        className="relative w-full bg-zinc-50 border border-zinc-200 rounded-[1.75rem] pl-5 pr-14 py-4 text-[14px] focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 transition-all outline-none text-zinc-800 placeholder-zinc-400 resize-none shadow-inner leading-relaxed"
                    />
                    <button
                        type="submit"
                        disabled={!chatInput.trim() || isGenerating}
                        className="absolute right-3 bottom-3 w-10 h-10 flex items-center justify-center bg-zinc-900 text-white rounded-2xl disabled:opacity-20 hover:bg-indigo-600 transition-all shadow-xl active:scale-90 scale-100"
                    >
                        <Send size={18} />
                    </button>
                </form>
                <div className="mt-4 px-2 h-4" />
            </div>
        </div>
    );

    if (config.type === 'style') {
        return (
            <div className="h-screen flex flex-col bg-[#ececf0] font-sans">
                {/* Top Nav */}
                <div className="h-16 bg-white border-b border-zinc-200/80 flex items-center justify-between px-6 shrink-0 relative z-30 shadow-sm">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/editor')} className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-200/50 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 transition-all">
                            <ArrowLeft size={18} />
                        </button>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-px h-6 bg-zinc-200" />
                            <input
                                type="text"
                                value={localName}
                                onChange={(e) => setLocalName(e.target.value)}
                                className="bg-transparent border-none p-0 text-[18px] font-black tracking-tight text-zinc-900 focus:outline-none focus:ring-0 w-full"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {leftTab === 'config' && (
                            <button
                                type="button"
                                onClick={() => { handleRefreshPreview(); setLeftTab('preview'); }}
                                disabled={!isPreviewDirty}
                                className={`px-5 py-2.5 rounded-xl font-bold text-[14px] flex items-center gap-2 transition-transform ${isPreviewDirty ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 hover:scale-105 active:scale-95' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                            >
                                <Sparkles size={16} />
                                更新预览
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="text-[13px] bg-zinc-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-zinc-800 shadow-lg shadow-zinc-200 transition-all flex items-center gap-2 disabled:opacity-60 active:scale-95"
                        >
                            {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            保存配置
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden relative z-10">
                    {/* Main config/preview area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-gradient-to-b from-[#f5f5f7] to-[#ececf0] relative">
                        <div className="max-w-5xl mx-auto pb-32">
                            {/* Tab Header */}
                            <div className="flex items-center justify-between mb-8 border-b border-zinc-200">
                                <div className="flex items-center gap-8">
                                    <button
                                        onClick={() => setLeftTab('config')}
                                        className={`pb-4 text-[16px] font-black transition-all flex items-center gap-2 ${leftTab === 'config' ? 'border-b-2 border-zinc-900 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                                    >
                                        <Settings2 size={18} />
                                        配置属性
                                    </button>
                                    <button
                                        onClick={() => { handleRefreshPreview(); setLeftTab('preview'); }}
                                        className={`pb-4 text-[16px] font-black transition-all flex items-center gap-2 ${leftTab === 'preview' ? 'border-b-2 border-zinc-900 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                                    >
                                        <Eye size={18} />
                                        效果预览
                                        {leftTab === 'config' && <span className="ml-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                                    </button>
                                </div>
                                <button
                                    onClick={() => { handleRefreshPreview(); setLeftTab('preview'); }}
                                    disabled={!isPreviewDirty}
                                    className={`mb-3 px-5 py-2 rounded-xl font-bold text-[13px] flex items-center gap-2 transition-all ${isPreviewDirty ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 hover:scale-105 active:scale-95' : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}`}
                                >
                                    <Sparkles size={14} />
                                    更新预览
                                </button>
                            </div>

                            {leftTab === 'config' ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    {config.sections.map(section => {
                                        const isEditing = !!sectionEditing[section.id];
                                        const fieldIds = section.fields.map(f => f.id);
                                        return (
                                            <div key={section.id} className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
                                                <div className="flex items-center justify-between p-6 bg-zinc-50/50 border-b border-zinc-100">
                                                    <div className="flex items-center gap-3">
                                                        <Palette size={20} className="text-zinc-600" />
                                                        <div>
                                                            <h3 className="text-[16px] font-black text-zinc-900">{section.title}</h3>
                                                            <p className="text-[12px] text-zinc-500 mt-0.5">{section.description}</p>
                                                        </div>
                                                    </div>
                                                    {isEditing ? (
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => cancelEditSection(section.id, fieldIds)} className="px-4 py-2 rounded-xl text-[13px] font-bold text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 transition-all">取消</button>
                                                            <button onClick={() => saveSection(section.id)} className="px-4 py-2 rounded-xl text-[13px] font-bold bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm transition-all">✓ 保存</button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => startEditSection(section.id, fieldIds)} className="px-4 py-2 rounded-xl text-[13px] font-bold flex items-center gap-2 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 shadow-sm transition-all">
                                                            编辑
                                                        </button>
                                                    )}
                                                </div>
                                                <div className={`p-8 grid grid-cols-1 xl:grid-cols-2 gap-6 transition-opacity ${!isEditing ? 'opacity-60 pointer-events-none select-none' : ''}`}>
                                                    {section.fields.map(field => (
                                                        <ConfigFieldEditor
                                                            key={field.id}
                                                            field={field}
                                                            value={draftValues[field.id] ?? ''}
                                                            options={field.kind === 'pageSelect' ? getPageOptions(pages, field.includeResources) : field.options}
                                                            onChange={(nextValue) => setDraftValues(prev => ({ ...prev, [field.id]: nextValue }))}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}

                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <StyleShellPreview values={previewValues} pages={pages} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Copilot Panel */}
                    {renderCopilotPanel()}
                </div>
            </div>
        );
    }

    // AI config type — same aesthetic as style but with AI-themed header
    return (
        <div className="h-screen flex flex-col bg-[#ececf0] font-sans">
            {/* Top Nav */}
            <div className="h-16 bg-white border-b border-zinc-200/80 flex items-center justify-between px-6 shrink-0 relative z-30 shadow-sm">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/editor')} className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-200/50 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 transition-all">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-px h-6 bg-zinc-200" />
                        <input
                            type="text"
                            value={localName}
                            onChange={(e) => setLocalName(e.target.value)}
                            className="bg-transparent border-none p-0 text-[18px] font-black tracking-tight text-zinc-900 focus:outline-none focus:ring-0 w-full"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {leftTab === 'config' && (
                        <button
                            type="button"
                            onClick={() => { handleRefreshPreview(); setLeftTab('preview'); }}
                            disabled={!isPreviewDirty}
                            className={`px-5 py-2.5 rounded-xl font-bold text-[14px] flex items-center gap-2 transition-transform ${isPreviewDirty ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20 hover:scale-105 active:scale-95' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                        >
                            <Sparkles size={16} />
                            更新预览
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="text-[13px] bg-zinc-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-zinc-800 shadow-lg shadow-zinc-200 transition-all flex items-center gap-2 disabled:opacity-60 active:scale-95"
                    >
                        {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        保存配置
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative z-10">
                {/* Main config/preview area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-gradient-to-b from-[#f5f5f7] to-[#ececf0] relative">
                    <div className="max-w-4xl mx-auto pb-32">
                        {/* Tab Header */}
                        <div className="flex items-center justify-between mb-8 border-b border-zinc-200">
                            <div className="flex items-center gap-8">
                                <button
                                    onClick={() => setLeftTab('config')}
                                    className={`pb-4 text-[16px] font-black transition-all flex items-center gap-2 ${leftTab === 'config' ? 'border-b-2 border-zinc-900 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                                >
                                    <Settings2 size={18} />
                                    功能设定
                                </button>
                                <button
                                    onClick={() => { handleRefreshPreview(); setLeftTab('preview'); }}
                                    className={`pb-4 text-[16px] font-black transition-all flex items-center gap-2 ${leftTab === 'preview' ? 'border-b-2 border-zinc-900 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                                >
                                    <Eye size={18} />
                                    效果预览
                                    {leftTab === 'config' && <span className="ml-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                                </button>
                            </div>
                            <button
                                onClick={() => { handleRefreshPreview(); setLeftTab('preview'); }}
                                disabled={!isPreviewDirty}
                                className={`mb-3 px-5 py-2 rounded-xl font-bold text-[13px] flex items-center gap-2 transition-all ${isPreviewDirty ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20 hover:scale-105 active:scale-95' : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}`}
                            >
                                <Sparkles size={14} />
                                更新预览
                            </button>
                        </div>

                        {leftTab === 'config' ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {config.sections.map(section => {
                                    const isEditing = !!sectionEditing[section.id];
                                    const fieldIds = section.fields.map(f => f.id);
                                    return (
                                        <div key={section.id} className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
                                            <div className="flex items-center justify-between p-6 bg-zinc-50/50 border-b border-zinc-100">
                                                <div className="flex items-center gap-3">
                                                    <Settings size={20} className="text-zinc-600" />
                                                    <div>
                                                        <h3 className="text-[16px] font-black text-zinc-900">{section.title}</h3>
                                                        <p className="text-[12px] text-zinc-500 mt-0.5">{section.description}</p>
                                                    </div>
                                                </div>
                                                {isEditing ? (
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => cancelEditSection(section.id, fieldIds)} className="px-4 py-2 rounded-xl text-[13px] font-bold text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 transition-all">取消</button>
                                                        <button onClick={() => saveSection(section.id)} className="px-4 py-2 rounded-xl text-[13px] font-bold bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm transition-all">✓ 保存</button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => startEditSection(section.id, fieldIds)} className="px-4 py-2 rounded-xl text-[13px] font-bold flex items-center gap-2 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 shadow-sm transition-all">
                                                        编辑
                                                    </button>
                                                )}
                                            </div>
                                            <div className={`p-8 grid grid-cols-1 xl:grid-cols-2 gap-6 transition-opacity ${!isEditing ? 'opacity-60 pointer-events-none select-none' : ''}`}>
                                                {section.fields.map(field => (
                                                    <ConfigFieldEditor
                                                        key={field.id}
                                                        field={field}
                                                        value={draftValues[field.id] ?? ''}
                                                        options={field.kind === 'pageSelect' ? getPageOptions(pages, field.includeResources) : field.options}
                                                        onChange={(nextValue) => setDraftValues(prev => ({ ...prev, [field.id]: nextValue }))}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}

                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 h-[800px] flex items-center justify-center">
                                <div className="w-full h-full bg-white rounded-3xl overflow-hidden shadow-sm border border-zinc-200 relative animate-in fade-in zoom-in-95 duration-500">
                                    <PreviewView
                                        embedded
                                        overrideMode="operate"
                                        showStageCopilot={false}
                                        modulePreviewMode="live"
                                        materials={materials}
                                        pages={pages}
                                        globalConfigs={previewConfigs}
                                        activeDoc={previewActiveDoc}
                                        setActiveDoc={setPreviewActiveDoc}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Copilot Panel */}
                {renderCopilotPanel()}
            </div>
        </div>
    );
}

function StyleShellPreview({ values, pages }) {
    const theme = STYLE_THEME_TOKENS[values.themeTone] || STYLE_THEME_TOKENS.brand;
    const surface = STYLE_SURFACE_TOKENS[values.surfaceStyle] || STYLE_SURFACE_TOKENS.glass;
    const fonts = STYLE_FONT_TOKENS[values.fontFamily] || STYLE_FONT_TOKENS.balanced;
    const backgroundMood = STYLE_BACKGROUND_MOOD_TOKENS[values.backgroundMood] || STYLE_BACKGROUND_MOOD_TOKENS.dynamic;
    const density = STYLE_DENSITY_TOKENS[values.layoutDensity] || STYLE_DENSITY_TOKENS.balanced;
    const placeholderModules = pages.slice(0, 4);
    const palette = {
        primary: values.primaryColor || '#2563eb',
        secondary: values.secondaryColor || '#4f46e5',
        accent: values.accentColor || '#0f172a'
    };
    const styleSummaryCards = [
        {
            title: '颜色系统',
            body: `${getStyleOptionLabel('themeTone', values.themeTone)} · ${palette.primary} / ${palette.secondary} / ${palette.accent}`
        },
        {
            title: '字体与气质',
            body: `${getStyleOptionLabel('fontFamily', values.fontFamily)} · ${getStyleOptionLabel('surfaceStyle', values.surfaceStyle)}`
        },
        {
            title: '页面氛围',
            body: `${getStyleOptionLabel('backgroundMood', values.backgroundMood)} · ${getStyleOptionLabel('layoutDensity', values.layoutDensity)}`
        },
        {
            title: '补充要求',
            body: values.supplementalRequirements || '暂无补充约束'
        }
    ];

    return (
        <div className={`relative min-h-full overflow-hidden rounded-[32px] border border-zinc-200 bg-[#f4f5f7] shadow-[0_20px_60px_-24px_rgba(0,0,0,0.16)] ${fonts.root}`}>
            <div className={`absolute w-[520px] h-[520px] -top-24 left-1/2 -translate-x-1/2 blur-[120px] rounded-full ${theme.auraOne} ${backgroundMood.auraOne}`} />
            <div className={`absolute w-[480px] h-[480px] bottom-0 left-1/2 -translate-x-1/3 blur-[120px] rounded-full ${theme.auraTwo} ${backgroundMood.auraTwo}`} />

            <div className="relative z-10 p-8 md:p-10 flex flex-col gap-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black shadow-lg" style={{ background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})` }}>
                            {values.siteIcon || 'FH'}
                        </div>
                        <div>
                            <div className="text-sm font-black text-zinc-900">{values.siteName || 'Living Handbook'}</div>
                            <div className="text-xs text-zinc-500 font-medium">Handbook Shell Preview</div>
                        </div>
                    </div>
                    <div className="text-xs font-medium bg-white/70 border border-zinc-200 rounded-full px-3 py-1.5" style={{ color: palette.accent }}>
                        Visual System Preview
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {['导航外壳', '模块占位', 'AI 助手', '附录入口'].map(item => (
                        <span key={item} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${surface}`}>
                            {item}
                        </span>
                    ))}
                </div>

                <div className={`${surface} ${density.shellPadding} rounded-[32px]`}>
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-wrap items-start justify-between gap-6">
                            <div className="max-w-3xl">
                                <p className="text-sm font-semibold" style={{ color: palette.primary }}>Handbook Visual Language</p>
                                <h2 className={`text-4xl md:text-5xl font-black tracking-tight text-zinc-900 mt-3 ${fonts.hero}`}>
                                    用视觉系统定义整个 handbook 的外壳气质
                                </h2>
                                <p className="text-base text-zinc-500 leading-relaxed mt-5">
                                    这里不展示首屏模块、下载模块或任何模块内容，只用固定壳层和占位块帮助你判断色彩、字体、卡片质感与页面节奏。
                                </p>
                            </div>
                            <div className="w-full max-w-sm rounded-[28px] border border-zinc-200 bg-white/70 p-5">
                                <div className="text-xs font-bold tracking-[0.22em] uppercase text-zinc-400">Shell Only</div>
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-2xl shadow-md" style={{ background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})` }} />
                                    <div>
                                        <div className="text-sm font-black text-zinc-900">{values.siteName || 'Living Handbook'}</div>
                                        <div className="text-xs text-zinc-500">图标 {values.siteIcon || 'FH'} · 不包含模块内部内容</div>
                                    </div>
                                </div>
                                <div className="mt-5 flex gap-2">
                                    <div className="h-9 flex-1 rounded-2xl" style={{ backgroundColor: palette.primary }} />
                                    <div className="h-9 flex-1 rounded-2xl" style={{ backgroundColor: palette.secondary }} />
                                    <div className="h-9 flex-1 rounded-2xl" style={{ backgroundColor: palette.accent }} />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-zinc-200 bg-white/72 p-5">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black" style={{ backgroundColor: palette.primary }}>
                                        {values.siteIcon || 'FH'}
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-zinc-900">{values.siteName || 'Living Handbook'}</div>
                                        <div className="text-xs text-zinc-500">living handbook shell</div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {['Overview', 'Modules', 'Resources', 'AI编辑'].map(item => (
                                        <span key={item} className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 ${density.sectionGap}`}>
                    {styleSummaryCards.map(card => (
                        <div key={card.title} className={`${surface} ${density.shellPadding} rounded-[28px]`}>
                            <div className="w-10 h-10 rounded-2xl mb-5" style={{ backgroundColor: `${palette.primary}20` }} />
                            <h3 className="text-lg font-black text-zinc-900">{card.title}</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed mt-3">{card.body}</p>
                        </div>
                    ))}
                </div>

                <div className={`${surface} ${density.shellPadding} rounded-[32px]`}>
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div>
                            <h3 className="text-xl font-black text-zinc-900">模块占位预览</h3>
                            <p className="text-sm text-zinc-500 mt-2">这里只展示模块在整体 handbook 中的包装效果，不展示实时模块内容。</p>
                        </div>
                        <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${palette.primary}18`, color: palette.primary }}>
                            占位模式
                        </span>
                    </div>
                    <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 ${density.sectionGap}`}>
                        {placeholderModules.map((page, index) => (
                            <div key={page.id} className={`rounded-[28px] border border-zinc-200 bg-white/70 ${density.shellPadding} flex flex-col`}>
                                <div className="w-12 h-12 rounded-2xl mb-5" style={{ backgroundColor: `${palette.secondary}22` }} />
                                <div className="text-xs font-bold tracking-[0.22em] uppercase text-zinc-400">Module Placeholder {index + 1}</div>
                                <h4 className="text-lg font-black text-zinc-900 mt-3">{page.name}</h4>
                                <div className="mt-3 text-sm text-zinc-500">这里只看包装样式，不看模块内容。</div>
                                <div className={`mt-6 rounded-[24px] bg-zinc-100/80 border border-zinc-200 ${density.moduleHeight}`} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`${surface} ${density.shellPadding} rounded-[32px]`}>
                    <h3 className="text-xl font-black text-zinc-900">色彩落点示意</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed mt-3 max-w-3xl">用一组固定占位块快速判断按钮、标签、面片和辅助区域的颜色关系是否稳定。</p>
                    <div className={`grid grid-cols-1 md:grid-cols-3 mt-6 ${density.sectionGap}`}>
                        {[
                            { label: '主按钮', color: palette.primary },
                            { label: '辅助高亮', color: palette.secondary },
                            { label: '强调元素', color: palette.accent }
                        ].map(item => (
                            <div key={item} className="rounded-[24px] border border-zinc-200 bg-white/70 p-5">
                                <div className="w-10 h-10 rounded-2xl mb-4" style={{ backgroundColor: item.color }} />
                                <div className="text-sm font-black text-zinc-900">{item.label}</div>
                                <div className="mt-4 h-12 rounded-2xl border border-zinc-200" style={{ backgroundColor: `${item.color}22` }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function getPageOptions(pages, includeResources = false) {
    return pages.map(page => ({ value: page.id, label: page.name }));
}

function ConfigFieldEditor({ field, value, onChange, options = [] }) {
    const label = (
        <div className="mb-2">
            <label className="block text-sm font-bold text-zinc-800">{field.label}</label>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{field.description}</p>
        </div>
    );

    if (field.kind === 'textarea') {
        return (
            <div>
                {label}
                <textarea
                    rows={4}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 transition-all resize-none"
                />
            </div>
        );
    }

    if (field.kind === 'select' || field.kind === 'pageSelect') {
        return (
            <div>
                {label}
                <select
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 transition-all"
                >
                    {options.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
        );
    }

    if (field.kind === 'color') {
        return (
            <div>
                {label}
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        value={getSafeColorValue(value)}
                        onChange={(event) => onChange(event.target.value)}
                        className="h-12 w-16 rounded-xl border border-zinc-200 bg-white p-1 cursor-pointer"
                    />
                    <input
                        type="text"
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                        className="flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 transition-all"
                    />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    {COLOR_SWATCHES.map(swatch => (
                        <button
                            key={swatch}
                            type="button"
                            onClick={() => onChange(swatch)}
                            className={`h-8 w-8 rounded-full border transition-transform hover:scale-105 ${value === swatch ? 'border-zinc-900 ring-2 ring-zinc-900/10' : 'border-zinc-200'}`}
                            style={{ backgroundColor: swatch }}
                            aria-label={`选择颜色 ${swatch}`}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            {label}
            <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 transition-all"
            />
        </div>
    );
}

export default GlobalConfigEditorView;
