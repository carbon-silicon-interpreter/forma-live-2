import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Sparkles, Video, LayoutTemplate, FileText,
    Fingerprint, Play, ArrowLeft, BarChart3, Edit3,
    Compass, FolderOpen, DownloadCloud, ShieldCheck,
    Activity, AlertCircle, Clock, MessageSquare, BookOpen
} from 'lucide-react';
import PptViewer from '../../components/blocks/PptViewer';
import RichBlockRenderer from '../../components/blocks/RichBlockRenderer';
import Questionnaire from '../../components/blocks/Questionnaire';

const THEME_TOKENS = {
    brand: {
        heroGradient: 'from-blue-600 to-indigo-600',
        heroSoft: 'bg-blue-50 text-blue-600',
        operateSpark: 'text-blue-400',
        accentSolid: 'bg-blue-600',
        accentButton: 'bg-blue-600 hover:bg-blue-700',
        accentText: 'text-blue-600',
        accentBg: 'bg-blue-50/30',
        accentBorder: 'border-blue-100',
        auraOne: 'bg-blue-500/10',
        auraTwo: 'bg-purple-500/10',
        quickActionHover: 'hover:text-blue-600 hover:border-blue-100',
        focusRing: 'focus:border-blue-400 focus:ring-blue-100/50',
        heroShadow: 'shadow-blue-600/20'
    },
    slate: {
        heroGradient: 'from-slate-700 to-zinc-900',
        heroSoft: 'bg-zinc-100 text-zinc-700',
        operateSpark: 'text-zinc-300',
        accentSolid: 'bg-zinc-900',
        accentButton: 'bg-zinc-900 hover:bg-zinc-800',
        accentText: 'text-zinc-700',
        accentBg: 'bg-zinc-100/80',
        accentBorder: 'border-zinc-200',
        auraOne: 'bg-slate-400/10',
        auraTwo: 'bg-zinc-500/10',
        quickActionHover: 'hover:text-zinc-800 hover:border-zinc-300',
        focusRing: 'focus:border-zinc-400 focus:ring-zinc-100',
        heroShadow: 'shadow-zinc-900/15'
    },
    emerald: {
        heroGradient: 'from-emerald-600 to-teal-600',
        heroSoft: 'bg-emerald-50 text-emerald-600',
        operateSpark: 'text-emerald-300',
        accentSolid: 'bg-emerald-600',
        accentButton: 'bg-emerald-600 hover:bg-emerald-700',
        accentText: 'text-emerald-600',
        accentBg: 'bg-emerald-50/40',
        accentBorder: 'border-emerald-100',
        auraOne: 'bg-emerald-500/10',
        auraTwo: 'bg-teal-500/10',
        quickActionHover: 'hover:text-emerald-600 hover:border-emerald-100',
        focusRing: 'focus:border-emerald-400 focus:ring-emerald-100/50',
        heroShadow: 'shadow-emerald-600/20'
    }
};

const SURFACE_TOKENS = {
    glass: {
        card: 'bg-white/80 backdrop-blur-xl border border-zinc-100',
        block: 'bg-white/60 backdrop-blur-xl border border-white',
        resource: 'bg-white/60 backdrop-blur-xl border border-white'
    },
    solid: {
        card: 'bg-white border border-zinc-200',
        block: 'bg-white border border-zinc-200',
        resource: 'bg-white border border-zinc-200'
    },
    editorial: {
        card: 'bg-stone-50/90 backdrop-blur-md border border-stone-200',
        block: 'bg-stone-50/95 backdrop-blur-md border border-stone-200',
        resource: 'bg-stone-50/95 backdrop-blur-md border border-stone-200'
    }
};

const FONT_TOKENS = {
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

const BACKGROUND_MOOD_TOKENS = {
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

const DENSITY_TOKENS = {
    spacious: {
        sectionPadding: 'py-32',
        introGap: 'gap-8',
        shellCardPadding: 'p-10'
    },
    balanced: {
        sectionPadding: 'py-24',
        introGap: 'gap-6',
        shellCardPadding: 'p-8'
    },
    compact: {
        sectionPadding: 'py-16',
        introGap: 'gap-4',
        shellCardPadding: 'p-6'
    }
};

const RESPONSE_TONE_COPY = {
    advisor: '我会先帮您判断问题类型，再推荐最合适的资料与下一步动作。',
    proactive: '我已经先为您准备好下一步最关键的诊断和资料入口。',
    teaching: '我会先把问题解释清楚，再带您进入对应模块。'
};

const getConfigByType = (configs, type) => configs.find(config => config.type === type);

const PreviewView = ({
    materials,
    pages,
    globalConfigs,
    activeDoc,
    setActiveDoc,
    embedded = false,
    overrideMode = null,
    showStageCopilot = !embedded,
    modulePreviewMode = 'live'
}) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const mode = overrideMode || searchParams.get('mode') || 'default';
    const isOperate = mode === 'operate';
    const styleConfig = getConfigByType(globalConfigs, 'style');
    const aiConfig = getConfigByType(globalConfigs, 'ai');
    const styleValues = styleConfig?.values || {};
    const aiValues = aiConfig?.values || {};
    const theme = THEME_TOKENS[styleValues.themeTone] || THEME_TOKENS.brand;
    const surface = SURFACE_TOKENS[styleValues.surfaceStyle] || SURFACE_TOKENS.glass;
    const fonts = FONT_TOKENS[styleValues.fontFamily] || FONT_TOKENS.balanced;
    const backgroundMood = BACKGROUND_MOOD_TOKENS[styleValues.backgroundMood] || BACKGROUND_MOOD_TOKENS.dynamic;
    const density = DENSITY_TOKENS[styleValues.layoutDensity] || DENSITY_TOKENS.balanced;
    const assistantName = aiValues.assistantName || '法务 AI 顾问';
    const assistantWelcome = aiValues.welcomeMessage || '你好！我是您的法务AI顾问。咱们目前对法务这块的需求主要是哪方面呢？咨询、合同还是用工合规呀？';
    const assistantPlaceholder = aiValues.inputPlaceholder || '描述您的企业法务痛点或咨询问题...';
    const handbookName = styleValues.siteName || 'Living Handbook';
    const siteIcon = styleValues.siteIcon || 'FH';
    const quickActions = [
        { id: 'assessment', text: aiValues.quickActionAssessment || '进行企业财税健康自测', intent: 'assessment' },
        { id: 'contract', text: aiValues.quickActionContract || '有没有标准的劳动合同附件？', intent: 'contract' },
        { id: 'risk', text: aiValues.quickActionRisk || '辞退员工有哪些败诉风险？', intent: 'risk' }
    ];
    const rootClassName = embedded
        ? `relative h-full w-full flex flex-col overflow-hidden bg-[#f4f5f7] ${fonts.root}`
        : `relative h-screen w-full flex flex-col overflow-hidden bg-[#f4f5f7] ${fonts.root}`;

    // Keep activeDoc to sync scrollstate and nav, but render all pages.
    useEffect(() => {
        if (!activeDoc && pages && pages.length > 0) {
            setActiveDoc(pages[0]);
        }
    }, [activeDoc, pages, setActiveDoc]);

    useEffect(() => {
        // Scroll spy logic
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id.replace('module-', '');
                    const doc = pages.find(p => p.id === id);
                    if (doc) setActiveDoc(doc);
                }
            });
        }, {
            root: null, // use viewport or nearest scrollable ancestor
            rootMargin: '-20% 0px -60% 0px', // trigger when element is in upper-middle of viewport
            threshold: 0
        });

        pages.forEach(page => {
            const el = document.getElementById(`module-${page.id}`);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [pages, setActiveDoc]);

    // Copilot is open by default for all modes
    const [isCopilotOpen] = useState(true);
    const [chatMessages, setChatMessages] = useState([
        { role: 'ai', text: assistantWelcome }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const [activeOperateTab, setActiveOperateTab] = useState('preview'); // 'preview' | 'insights' | 'data' | 'chat'

    const navItems = pages;

    const messagesEndRef = useRef(null);

    useEffect(() => {
        setChatMessages(prev => (
            prev.length <= 1
                ? [{ role: 'ai', text: assistantWelcome }]
                : prev
        ));
    }, [assistantWelcome]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    const scrollToTarget = (targetId, fallbackId) => {
        const target = navItems.find(item => item.id === targetId)
            || navItems.find(item => item.id === fallbackId);

        if (!target) {
            return null;
        }

        setActiveDoc(target);
        document.getElementById(`module-${target.id}`)?.scrollIntoView({ behavior: 'smooth' });
        return target;
    };

    const handleChat = (e, overrideText = null, forcedIntent = null) => {
        if (e && e.preventDefault) e.preventDefault();

        const userText = overrideText || chatInput;
        if (!userText.trim()) return;

        setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
        setChatInput('');
        setIsGenerating(true);

        setTimeout(() => {
            setIsGenerating(false);
            let aiText = RESPONSE_TONE_COPY[aiValues.responseTone] || "基于您的需求，我已经为您提取并渲染了新的相关资料与视图。";
            const text = userText.trim();

            if (forcedIntent === 'assessment' || text.includes('高风险') || text.includes('问卷') || text.includes('自测') || text.includes('诊断')) {
                const doc = scrollToTarget(aiValues.assessmentModuleId || 'p1', 'p1');
                aiText = `为了帮您更快定位风险，我已经带您来到【${doc?.name || '企业财税健康自测问卷'}】。请先完成这一步，再继续看更深入的资料。`;
            } else if (forcedIntent === 'contract' || text.includes('合同') || text.includes('劳动合同附件') || text.includes('审核') || text.includes('模板')) {
                const doc = scrollToTarget(aiValues.contractModuleId || 'p4', 'p4');
                aiText = `我已经把您带到【${doc?.name || '标准合同库'}】。这里集中放了最适合当前阶段直接复用的标准资料和附件。`;
            } else if (forcedIntent === 'risk' || text.includes('辞退') || text.includes('败诉风险') || text.includes('用工') || text.includes('赔偿') || text.includes('仲裁')) {
                const doc = scrollToTarget(aiValues.riskVideoModuleId || 'p2', 'p2');
                aiText = `风险相关问题我建议先看【${doc?.name || '用工合规避雷指南'}】。我已经替您定位到对应模块，先把关键坑位看清楚。`;
            } else if (text.includes('附件') || text.includes('下载') || text.includes('资料')) {
                const doc = scrollToTarget(aiValues.resourcesModuleId || 'p_resources', 'p_resources');
                aiText = `好的，我已经为您切到【${doc?.name || '资料下载'}】。这里汇总了当前服务相关的附件和延伸资料，您可以直接按需下载。`;
            } else if (userText.includes('案例') || userText.includes('败诉')) {
                aiText = "为了帮您避坑，基于您的企业体检报告，我为您提取了一个经典的劳动争议败诉案例供参考。";
                // 动态生成一个拥有富文本结构的虚拟卡片 (The current viewport will stay as is, but context updates)
                setActiveDoc({
                    id: 'generated_insight',
                    name: '🚨 警示案例：未交社保的代价',
                    type: 'insight',
                    tags: ['AI 生成', '工伤纠纷', '真实判例'],
                    blocks: [
                        { type: 'quote', text: '很多初创企业为了省成本不按规定缴纳社保，最终却付出了极其惨痛的代价。' },
                        { type: 'p', text: '本周刚刚调取的同行业判例数据分析：' },
                        {
                            type: 'grid', items: [
                                { title: '📉 案例概览', desc: '某餐饮门店，员工入职3个月未缴纳社保。员工在后厨滑倒骨折，被认定为工伤。' },
                                { title: '💸 赔偿结果', desc: '因未缴纳工伤保险，企业依法承担全部工伤待遇，加上一次性伤残补助金等，合计赔付 14.8 万元。该门店随后因资金链断裂关闭。' }
                            ]
                        }
                    ]
                });
            }
            setChatMessages(prev => [...prev, { role: 'ai', text: aiText }]);
        }, 1200);
    };

    return (
        <div className={rootClassName}>
            {/* Row 1: Operation Management Bar (Operation Mode Only) */}
            {isOperate && (
                <div className="shrink-0 w-full h-12 bg-zinc-950 border-b border-zinc-900 z-50 flex items-center justify-between px-6 relative">
                    <div className="flex items-center gap-6">
                         <span className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] uppercase">
                            Operation Portal
                        </span>
                        <div className="w-px h-4 bg-zinc-800"></div>
                        <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/50">
                            {['preview', 'insights', 'data', 'chat'].map(tab => {
                                const labels = {
                                    'preview': '前端预览',
                                    'insights': '深度洞察',
                                    'data': '详细数据',
                                    'chat': '对话记录'
                                };
                                const icons = {
                                    'preview': <LayoutTemplate size={12} />,
                                    'insights': <Activity size={12} />,
                                    'data': <BarChart3 size={12} />,
                                    'chat': <MessageSquare size={12} />
                                };
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveOperateTab(tab)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeOperateTab === tab
                                            ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                                            }`}
                                    >
                                        {icons[tab]} {labels[tab]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {!embedded && (
                        <button onClick={() => navigate('/editor')} className="flex items-center gap-2 text-[11px] font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-all shadow-sm">
                            <Edit3 size={12} /> 返回编辑
                        </button>
                    )}
                </div>
            )}

            {/* Row 2: Handbook Brand Navigation Bar (Always Visible) */}
            <div className={`shrink-0 w-full h-16 bg-white/70 backdrop-blur-xl border-b border-zinc-100 z-50 flex items-center justify-between px-6 shadow-sm relative transition-colors duration-500`}>
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${theme.heroGradient} flex items-center justify-center text-white font-bold text-lg shadow-lg ${theme.heroShadow}`}>
                        {siteIcon}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-xl font-black tracking-tighter text-zinc-900`}>
                            企业财税合规 手册
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                   {/* Handbook context stats or secondary actions can go here */}
                   <div className={`text-[10px] font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${theme.accentSolid.replace('bg-', 'bg-')} animate-pulse`}></div>
                        @Living Handbook
                   </div>
                </div>
            </div>

            {/* Content Switcher */}
            <div className={`flex-1 relative w-full flex overflow-hidden ${isOperate && activeOperateTab !== 'preview' ? 'hidden' : ''}`}>
                {/* 左侧悬浮胶囊导航 (Fully Expanded Nav) */}
                <div className="absolute left-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col py-4 px-2 bg-white/60 backdrop-blur-3xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-[32px] w-64 transition-all duration-300 group/nav overflow-hidden">
                    <div className="w-full flex flex-col gap-2 mt-2">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveDoc(item);
                                    document.getElementById(`module-${item.id}`)?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className={`relative w-full px-2 py-3 flex items-center justify-start rounded-2xl transition-all duration-300 group ${activeDoc?.id === item.id
                                    ? 'bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] text-black border border-zinc-100'
                                    : 'text-zinc-500 hover:bg-white/60 hover:text-zinc-800 border border-transparent'
                                    }`}
                            >
                                <div className={`shrink-0 p-2 rounded-xl transition-colors ${activeDoc?.id === item.id ? 'bg-zinc-100 text-zinc-900' : 'bg-transparent text-zinc-400 group-hover:text-zinc-600'}`}>
                                    {item.type === 'cover' ? <Compass size={18} /> : item.type === 'video' ? <Video size={18} /> : item.type === 'ppt' ? <LayoutTemplate size={18} /> : item.type === 'resources' ? <FolderOpen size={18} /> : <FileText size={18} />}
                                </div>

                                <span className={`ml-3 text-sm font-medium truncate opacity-100 transition-opacity whitespace-nowrap ${activeDoc?.id === item.id ? 'font-semibold' : ''}`}>
                                    {item.name}
                                </span>

                                {activeDoc?.id === item.id && (
                                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-black rounded-r-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 中心主舞台 (The Dynamic Stage) - Full width viewport scrolling */}
                <div className={`flex-1 relative h-full w-full overflow-y-auto snap-y snap-mandatory custom-scrollbar transition-all duration-500 md:pl-72 ${(showStageCopilot && isCopilotOpen) ? 'md:pr-[380px]' : ''}`}>

                    {/* 页面级别固定徽标 */}
                    <div className="absolute top-8 right-12 z-10 flex items-center gap-2 text-xs text-zinc-400 font-medium bg-zinc-100/50 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-200/50">
                        <Fingerprint size={12} className={theme.accentText} /> {`由 ${handbookName} 引擎实时渲染`}
                    </div>

                    {/* Background decorative elements */}
                    <div className={`${embedded ? 'absolute' : 'fixed'} inset-0 pointer-events-none md:pl-80 flex justify-center -z-10 bg-[#f4f5f7]`}>
                        <div className={`w-full max-w-5xl h-[800px] absolute -top-[200px] left-1/2 -translate-x-1/2 blur-[120px] rounded-full mix-blend-multiply ${theme.auraOne} ${backgroundMood.auraOne}`}></div>
                        <div className={`w-full max-w-5xl h-[800px] absolute top-[60vh] left-1/2 -translate-x-1/3 blur-[120px] rounded-full mix-blend-multiply ${theme.auraTwo} ${backgroundMood.auraTwo}`}></div>
                    </div>

                    {navItems.map((doc) => (
                        <div key={doc.id} id={`module-${doc.id}`} className={`w-full min-h-screen snap-start flex flex-col justify-center px-12 md:pl-16 md:pr-32 ${density.sectionPadding} relative bg-transparent`}>
                            <div className="w-full max-w-6xl mx-auto flex flex-col h-full border-b border-transparent">

                                {/* Handle rendering Intro specially */}
                                {doc.type === 'cover' ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center relative max-w-4xl mx-auto">
                                        <div className={`w-20 h-20 bg-gradient-to-tr ${theme.heroGradient} rounded-3xl mb-8 flex items-center justify-center animate-in zoom-in duration-700 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] ${theme.heroShadow}`}>
                                            <ShieldCheck size={40} className="text-white relative z-10" />
                                            <div className="absolute inset-0 bg-white opacity-20 blur-md rounded-3xl"></div>
                                        </div>
                                        <h1 className={`text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 leading-tight mb-6 ${fonts.hero}`}>
                                            {doc.hero?.eyebrow || '让专业的人做专业的事'}<br /><span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.heroGradient}`}>{doc.hero?.highlight || doc.name}</span>
                                        </h1>
                                        <p className="text-xl text-zinc-500 font-medium max-w-3xl leading-relaxed mb-12">
                                            {doc.hero?.description || doc.description}
                                        </p>

                                        <div className={`grid grid-cols-1 md:grid-cols-3 w-full text-left ${density.introGap}`}>
                                            {doc.cards?.map((card, index) => (
                                                <div key={card.title} className={`${surface.card} ${density.shellCardPadding} rounded-3xl shadow-sm hover:shadow-md transition-shadow`}>
                                                    <div className={`w-12 h-12 ${theme.heroSoft} rounded-2xl flex items-center justify-center mb-6`}>
                                                        {index === 0 ? <Compass className={theme.accentText} size={24} /> : index === 1 ? <Fingerprint className={theme.accentText} size={24} /> : <Activity className={theme.accentText} size={24} />}
                                                    </div>
                                                    <h3 className="text-xl font-bold text-zinc-900 mb-3">{card.title}</h3>
                                                    <p className="text-zinc-600 leading-relaxed text-sm whitespace-pre-line">
                                                        {card.body}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : doc.type === 'resources' ? (
                                    <div className="flex-1 flex flex-col justify-center max-w-6xl w-full mx-auto">
                                        <div className="text-center mb-16">
                                            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 leading-tight">
                                                {doc.name}
                                            </h2>
                                            <p className="mt-4 text-zinc-500 text-xl font-medium">{doc.description || '请下载所有随附资料以推进下一步落地工作。'}</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {materials.filter(m => m.visible).map(material => (
                                                <div key={material.id} className={`group relative ${surface.resource} p-8 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all flex flex-col cursor-pointer`}>
                                                    <div className={`w-12 h-12 ${theme.heroSoft} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                                                        <FileText size={24} />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-zinc-900 mb-2">{material.name}</h3>
                                                    <div className="flex gap-2 mb-8 flex-wrap">
                                                        {material.tags.map(tag => (
                                                            <span key={tag} className="px-2 py-1 bg-zinc-100/80 rounded-md text-xs font-semibold text-zinc-600">{tag}</span>
                                                        ))}
                                                    </div>
                                                    <div className={`mt-auto flex items-center justify-between text-sm font-bold ${theme.accentText}`}>
                                                        <span>下载附件</span>
                                                        <DownloadCloud size={16} className="group-hover:-translate-y-1 transition-transform" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* 统一模块标题 */}
                                        <div className="mb-12">
                                            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 leading-tight">
                                                {doc.name}
                                            </h2>
                                        </div>

                                        {/* 模块主体内容区域 */}
                                        <div className="flex-1 flex flex-col justify-start">
                                            {modulePreviewMode === 'placeholder' ? (
                                                <div className={`w-full ${surface.block} p-16 rounded-[48px] shadow-[0_8px_40px_rgba(0,0,0,0.04)] flex flex-col gap-8`}>
                                                    <div className="flex items-center justify-between gap-6">
                                                        <div>
                                                            <p className={`text-xs font-bold tracking-[0.22em] uppercase ${theme.accentText}`}>Module Placeholder</p>
                                                            <h3 className="text-3xl font-black text-zinc-900 mt-3">模块内容不参与全局风格实时重算</h3>
                                                        </div>
                                                        <span className="px-3 py-1.5 rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                                                            {doc.type}
                                                        </span>
                                                    </div>
                                                    <p className="text-base text-zinc-500 max-w-3xl leading-relaxed">
                                                        这里保留模块在 handbook 中的占位和壳层包装，用来检查导航、留白、字体、卡片质感和整体页面气质。模块内部内容将在模块编辑链路中单独维护。
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="rounded-3xl bg-white/70 border border-zinc-200 h-40"></div>
                                                        <div className="rounded-3xl bg-white/70 border border-zinc-200 h-40"></div>
                                                        <div className="rounded-3xl bg-white/70 border border-zinc-200 h-40"></div>
                                                    </div>
                                                </div>
                                            ) : doc.type === 'video' ? (
                                                <div className="w-full flex flex-col">
                                                    <p className="text-zinc-500 text-xl max-w-3xl leading-relaxed mb-10">
                                                        {doc.description || '基于客户浏览行为的智能化实战拆解，教你如何有效规避用工风险。'}
                                                    </p>
                                                    <div className="w-full relative rounded-[40px] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.3)] group cursor-pointer aspect-video bg-zinc-900 flex items-center justify-center">
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity"></div>
                                                        <Play size={88} className="text-white/80 group-hover:scale-110 group-hover:text-white transition-all z-20" />
                                                        <div className="absolute bottom-8 left-8 text-white text-base font-medium z-20 flex items-center gap-3">
                                                            <span className="bg-blue-600 px-2.5 py-1 rounded text-xs font-bold tracking-wider">LIVE</span>
                                                            {doc.duration || '15:00'} · 沉浸式演播
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : doc.type === 'ppt' ? (
                                                <div className="w-full">
                                                    <p className="text-zinc-500 text-xl max-w-3xl leading-relaxed mb-10">
                                                        {doc.description || '全员必修合规课程，包含核心红线、案例分析与互动测试。'}
                                                    </p>
                                                    <div className="w-full aspect-video min-h-[600px] shadow-2xl rounded-[40px]">
                                                        <PptViewer slides={doc.slides} />
                                                    </div>
                                                </div>
                                            ) : doc.type === 'questionnaire' ? (
                                                <div className="w-full flex justify-center pb-20">
                                                    <Questionnaire />
                                                </div>
                                            ) : (
                                                <div className={`w-full ${surface.block} p-16 rounded-[48px] shadow-[0_8px_40px_rgba(0,0,0,0.04)]`}>
                                                    <RichBlockRenderer blocks={doc.blocks} />
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>))}
                </div>

                {/* 固定的法务咨询聊天窗口 (Persistent Legal Copilot) */}
                {showStageCopilot && (
                    <div className={`absolute top-6 bottom-6 right-6 w-[380px] bg-white/80 backdrop-blur-3xl border border-white/80 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.15)] rounded-[36px] flex flex-col z-40 transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isCopilotOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>

                    <div className="p-6 border-b border-white/40 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${theme.heroGradient} flex items-center justify-center shadow-lg ${theme.heroShadow} animate-pulse`}>
                                <Sparkles size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-zinc-900 tracking-tight">{assistantName}</h3>
                                <p className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase">{aiValues.assistantTagline || `Active Context: ${activeDoc?.name || 'Global'}`}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6 custom-scrollbar">
                        {chatMessages.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`px-5 py-3.5 rounded-[24px] text-[14px] leading-relaxed max-w-[90%] shadow-sm ${msg.role === 'user'
                                    ? 'bg-zinc-900 text-white rounded-br-sm'
                                    : 'bg-white border border-zinc-100/80 text-zinc-800 rounded-bl-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isGenerating && (
                            <div className="flex items-center gap-3 text-zinc-500 text-sm bg-white/50 w-max px-4 py-2.5 rounded-full backdrop-blur-sm border border-white">
                                <Sparkles size={16} className={`animate-spin ${theme.accentText}`} /> 检索法条与知识来源中...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 shrink-0 border-t border-white/40 bg-zinc-50/50 rounded-b-[36px] flex flex-col gap-3">

                        {/* 智能语境提示 (Smart Quick Actions) */}
                        <div className="flex flex-col gap-2 pb-2">
                            <span className="text-xs font-bold text-zinc-400 px-1">你可能想问：</span>
                            <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-1">
                                {quickActions.map(action => (
                                    <button
                                        key={action.id}
                                        onClick={() => {
                                            setChatInput(action.text);
                                            handleChat({ preventDefault: () => { } }, action.text, action.intent);
                                        }}
                                        className={`shrink-0 px-3 py-1.5 bg-white shadow-sm border border-zinc-100 rounded-full text-xs font-medium text-zinc-600 transition-colors whitespace-nowrap ${theme.quickActionHover}`}
                                    >
                                        {action.text}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleChat} className="relative mt-1">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder={assistantPlaceholder}
                                className={`w-full bg-white border border-zinc-200 rounded-[24px] pl-5 pr-12 py-3.5 text-[14px] transition-all outline-none text-zinc-800 placeholder-zinc-400 shadow-sm ${theme.focusRing}`}
                            />
                            <button
                                type="submit"
                                disabled={!chatInput.trim() || isGenerating}
                                className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-white rounded-full disabled:opacity-30 hover:scale-105 transition-all shadow-md ${theme.accentButton}`}
                            >
                                <ArrowLeft size={16} className="transform rotate-135" />
                            </button>
                        </form>
                    </div>
                </div>
                )}
            </div>

            {/* Insights Tab Content */}
            {isOperate && activeOperateTab === 'insights' && (
                <div className="flex-1 w-full overflow-y-auto custom-scrollbar bg-zinc-50/80">
                    <div className="max-w-4xl mx-auto py-12 px-8 flex flex-col gap-10 animate-in fade-in duration-300">

                        {/* Section 1: Top Summary Ribbon */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                                <BarChart3 className="text-blue-600" size={24} /> 核心增长总览
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-3xl border border-zinc-200/60 shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
                                    <span className="text-sm text-zinc-500 font-bold tracking-wide">累计独立访客</span>
                                    <div className="flex items-end gap-3 mt-1">
                                        <span className="text-4xl font-bold text-zinc-900 tracking-tight">1,208</span>
                                        <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-full mb-1">↑ 12% vs 上周</span>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-3xl border border-zinc-200/60 shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
                                    <span className="text-sm text-zinc-500 font-bold tracking-wide">核心转化率 (附件下载)</span>
                                    <div className="flex items-end gap-3 mt-1">
                                        <span className="text-4xl font-bold text-blue-600 tracking-tight">32.4%</span>
                                        <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-full mb-1">↑ 5.2% vs 均值</span>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-3xl border border-zinc-200/60 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
                                    <span className="text-sm text-zinc-500 font-bold tracking-wide">滞留热区排行</span>
                                    <div className="flex flex-col gap-3">
                                        {pages.slice(0, 2).map((p, i) => (
                                            <div key={i} className="flex items-center gap-3 text-xs font-medium">
                                                <span className="text-zinc-800 truncate w-24">{p.name}</span>
                                                <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${100 - (i * 20)}%` }}></div>
                                                </div>
                                                <span className="text-zinc-500 font-bold">{100 - (i * 20)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-px bg-zinc-200/60 my-2"></div>

                        {/* Section 2: Copilot Intent Deep-Dive */}
                        <div className="flex flex-col gap-5">
                            <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                                <MessageSquare className={theme.accentText} size={24} />
                                {aiValues.insightsTitle || 'Copilot 访客意图深度分析'}
                            </h3>
                            <div className="bg-white rounded-[32px] border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
                                <div className="p-10 border-b border-zinc-100 flex flex-col md:flex-row gap-10 bg-gradient-to-br from-white to-purple-50/30">
                                    <div className="flex-1 flex flex-col gap-5">
                                        <div className={`flex items-center gap-2 ${theme.accentText}`}>
                                            <AlertCircle size={18} />
                                            <h4 className="font-bold text-sm tracking-wide">刚需预警：高频痛点</h4>
                                        </div>
                                        <h5 className="text-2xl font-bold text-zinc-900 tracking-tight">{aiValues.painPointHeadline || '企业最关心：“违法解除”与“赔偿标准”'}</h5>
                                        <p className="text-base text-zinc-600 leading-relaxed font-medium">
                                            {aiValues.painPointSummary || '数据洞察表明，高达 42% 的高意向访客在与 Copilot 聊天的过程中，曾多次抛出具有强烈避险诉求的问题。'}
                                        </p>

                                        {/* Mock Chat Excerpt */}
                                        <div className="mt-2 bg-zinc-50 p-4 rounded-2xl border border-zinc-200/60">
                                            <p className="text-xs text-zinc-400 font-bold mb-3 tracking-widest uppercase">访客提问原文摘录</p>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-zinc-200 shrink-0 mt-0.5"></div>
                                                    <p className="text-sm text-zinc-700 font-mono bg-white p-2.5 rounded-lg border border-zinc-100 shadow-sm leading-snug">"如果试用期觉得不行，怎么能安全开除，需要双倍赔钱吗？"</p>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-zinc-200 shrink-0 mt-0.5"></div>
                                                    <p className="text-sm text-zinc-700 font-mono bg-white p-2.5 rounded-lg border border-zinc-100 shadow-sm leading-snug">"辞退员工如果不提前拿 N+1，合法流程是什么？重点防范哪些坑？"</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:w-72 shrink-0 flex flex-col justify-center">
                                        <div className="p-6 bg-purple-600 rounded-[28px] text-white shadow-xl shadow-purple-600/20 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                                            <div className="flex items-center gap-2 mb-3 relative z-10">
                                                <Sparkles size={18} className="text-purple-200" />
                                                <span className="text-sm font-bold tracking-wide">AI 战略建议</span>
                                            </div>
                                            <p className="text-sm text-purple-100 leading-relaxed mb-6 font-medium relative z-10">
                                                满足强痛点能极大提升转化。当前 Live Site 缺乏此方向素材。建议立即将《合法解除指南白皮书》添加为首页高优先级模块。
                                            </p>
                                            <button className="w-full py-3 rounded-2xl bg-white text-purple-700 text-sm font-bold shadow-md hover:bg-zinc-50 transition-all flex items-center justify-center gap-2 relative z-10">
                                                <LayoutTemplate size={16} /> 一键部署该模块
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-px bg-zinc-200/60 my-2"></div>

                        {/* Section 3: Video Engagement Diagnostics */}
                        <div className="flex flex-col gap-5">
                            <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                                <Clock className="text-orange-600" size={24} />
                                视听内容留存诊断
                            </h3>
                            <div className="bg-white rounded-[32px] border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col md:flex-row">
                                <div className="p-10 flex-1 border-b md:border-b-0 md:border-r border-zinc-100 bg-orange-50/30 flex flex-col gap-4 justify-center">
                                    <h5 className="text-xl font-bold text-zinc-900 tracking-tight">长视频阻力分析：首播跳出率警告</h5>
                                    <p className="text-base text-zinc-600 leading-relaxed font-medium">
                                        当前首页主打的《用工合规避雷》原版视频长达 18 分钟。监控数据显示，<strong className="text-orange-600">近 40% 的访客在播放前 2 分钟内流失</strong>，未触达核心价值点。
                                    </p>
                                    <div className="h-16 mt-2 flex items-end gap-1 px-4">
                                        {/* Fake dropoff chart */}
                                        {[100, 95, 90, 60, 55, 50, 45, 40, 35, 30].map((h, i) => (
                                            <div key={i} className={`w-1/10 flex-1 rounded-t-md ${i < 3 ? 'bg-orange-200' : 'bg-orange-400'}`} style={{ height: `${h}%` }}></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-10 md:w-80 shrink-0 flex flex-col justify-center bg-white">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles size={18} className="text-orange-500" />
                                        <span className="text-sm font-bold text-zinc-800">优化方案</span>
                                    </div>
                                    <p className="text-sm text-zinc-500 leading-relaxed mb-6 font-medium">
                                        AI 已为您自动截取视频中点赞最高、最具冲击力的片段，零成本生成了【3分钟高光快闪版预告片】，建议设为视频封面默认轮播。
                                    </p>
                                    <button className="w-full py-3.5 rounded-2xl bg-orange-500 text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 hover:-translate-y-0.5 transition-all">
                                        ✨ 自动剪辑并部署前置
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-px bg-zinc-200/60 my-2"></div>

                        {/* Section 4: Asset Conversion Funnel Diagnostics */}
                        <div className="flex flex-col gap-5 pb-10">
                            <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                                <ShieldCheck className="text-blue-600" size={24} />
                                资产转化漏斗诊断
                            </h3>
                            <div className="bg-white rounded-[32px] border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col md:flex-row">
                                <div className="p-10 flex-1 border-b md:border-b-0 md:border-r border-zinc-100 bg-blue-50/30 flex flex-col gap-4 justify-center">
                                    <h5 className="text-xl font-bold text-zinc-900 tracking-tight">商机泄漏漏洞：白嫖党防范</h5>
                                    <p className="text-base text-zinc-600 leading-relaxed font-medium">
                                        附件库中的《标准劳动合同（高管版）》点击下载量位居全站第一，然而，由于该资产当前配置为<strong className="text-blue-600">“无门槛直接下载”</strong>，导致销售漏斗在此处发生严重断层，零线索留存。
                                    </p>
                                </div>
                                <div className="p-10 md:w-80 shrink-0 flex flex-col justify-center bg-white">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles size={18} className="text-blue-500" />
                                        <span className="text-sm font-bold text-zinc-800">优化方案</span>
                                    </div>
                                    <p className="text-sm text-zinc-500 leading-relaxed mb-6 font-medium">
                                        对于此类高价值法务文件，强烈建议开启【强制留资】屏障。访客必须输入真实手机号与企业名称进行验证后，方可解锁下载。
                                    </p>
                                    <button className="w-full py-3.5 rounded-2xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
                                        🔐 立即开启阻断式留资
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {isOperate && activeOperateTab === 'data' && (
                <div className="flex-1 w-full overflow-y-auto custom-scrollbar bg-zinc-50/80">
                    <div className="max-w-6xl mx-auto py-12 px-8 flex flex-col gap-6 animate-in fade-in duration-300">
                        <h3 className="text-2xl font-black text-zinc-900 mb-2">页面访问与互动明细</h3>
                        <div className="bg-white rounded-3xl border border-zinc-200/60 shadow-sm overflow-hidden text-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 font-bold uppercase tracking-wider text-xs">
                                        <th className="py-4 px-6">页面 / 模块名称</th>
                                        <th className="py-4 px-6">累计访问 (PV)</th>
                                        <th className="py-4 px-6">独立访客 (UV)</th>
                                        <th className="py-4 px-6">平均停留时长</th>
                                        <th className="py-4 px-6">互动转化率</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 text-zinc-800 font-medium">
                                    {pages.map((p, i) => (
                                        <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="py-4 px-6 flex items-center gap-3">
                                                <FileText size={16} className="text-zinc-400" />
                                                {p.name}
                                            </td>
                                            <td className="py-4 px-6">{Math.floor(1200 / (i + 1)) + 45}</td>
                                            <td className="py-4 px-6">{Math.floor(800 / (i + 1)) + 20}</td>
                                            <td className="py-4 px-6">00:0{(i % 5) + 1}:{(i * 7 % 40) + 10}</td>
                                            <td className="py-4 px-6">
                                                <span className="inline-block bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold">
                                                    {((1 - (i * 0.15)) * 24).toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="py-4 px-6 flex items-center gap-3">
                                            <DownloadCloud size={16} className="text-zinc-400" />
                                            标准劳动合同（高管版）.docx
                                        </td>
                                        <td className="py-4 px-6">1,452</td>
                                        <td className="py-4 px-6">980</td>
                                        <td className="py-4 px-6">-</td>
                                        <td className="py-4 px-6">
                                            <span className="inline-block bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full text-xs font-bold">
                                                0.0% (零留资)
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {isOperate && activeOperateTab === 'chat' && (
                <div className="flex-1 w-full overflow-y-auto custom-scrollbar bg-zinc-50/80">
                    <div className="max-w-5xl mx-auto py-12 px-8 h-full animate-in fade-in duration-300">
                        <h3 className="text-2xl font-black text-zinc-900 mb-6">访客对话审查</h3>
                        <div className="bg-white rounded-3xl border border-zinc-200/60 shadow-sm overflow-hidden flex h-[65vh]">
                            {/* Session List */}
                            <div className="w-80 border-r border-zinc-100 flex flex-col bg-zinc-50/30">
                                <div className="flex-1 overflow-y-auto">
                                    {[
                                        { id: 'Visitor_8aB2', tag: '违法辞退', tagColor: 'purple', min: '12 min ago' },
                                        { id: 'Visitor_c9X1', tag: '年休假折算', tagColor: 'blue', min: '1 hr ago' },
                                        { id: 'Visitor_1oP8', tag: '竞业协议', tagColor: 'emerald', min: '3 hrs ago' },
                                        { id: 'Visitor_4mN5', tag: '外包风险', tagColor: 'orange', min: '5 hrs ago' },
                                    ].map((session, i) => (
                                        <div key={i} className={`p-5 border-b border-zinc-100 cursor-pointer hover:bg-white transition-colors flex flex-col gap-2 ${i === 0 ? 'bg-white border-l-4 border-l-blue-600' : ''}`}>
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-sm text-zinc-800">{session.id}</span>
                                                <span className="text-xs text-zinc-400 font-medium">{session.min}</span>
                                            </div>
                                            <span className={`text-[11px] font-bold px-2 py-1 rounded w-fit bg-${session.tagColor}-100 text-${session.tagColor}-700`}># {session.tag}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Chat Transcript */}
                            <div className="flex-1 flex flex-col bg-white">
                                    <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <MessageSquare size={18} className={theme.accentText} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-zinc-900">会话回溯: Visitor_8aB2</h4>
                                                <p className="text-xs text-zinc-500 font-medium">共 4 轮交互 • 高意向访客</p>
                                            </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-zinc-50/30">
                                    <div className={`text-white p-4 rounded-2xl rounded-tl-sm w-fit max-w-[80%] shadow-sm text-sm ${theme.accentSolid}`}>
                                        {assistantWelcome}
                                    </div>
                                    <div className="bg-white border border-zinc-200 text-zinc-800 p-4 rounded-2xl rounded-tr-sm w-fit max-w-[80%] self-end shadow-sm text-sm font-medium">
                                        如果试用期觉得不行，怎么能安全开除，需要双倍赔钱吗？
                                    </div>
                                    <div className={`text-white p-4 rounded-2xl rounded-tl-sm w-fit max-w-[80%] shadow-sm text-sm leading-relaxed ${theme.accentSolid}`}>
                                        <p className="mb-2">试用期解除合同需要满足特定条件才能避免“违法解除”带来的双倍赔偿风险。核心在于证明员工“不符合录用条件”。</p>
                                        <p>请问您在员工入职时，是否签署了包含具体【岗位录用条件】的文件呢？</p>
                                    </div>
                                    <div className="bg-white border border-zinc-200 text-zinc-800 p-4 rounded-2xl rounded-tr-sm w-fit max-w-[80%] self-end shadow-sm text-sm font-medium">
                                        就是签了个标准劳动合同，没有什么录用条件说明。
                                    </div>
                                    <div className={`text-white p-4 rounded-2xl rounded-tl-sm w-fit max-w-[80%] shadow-sm text-sm leading-relaxed ${theme.accentSolid}`}>
                                        <p className="mb-2">这属于常见的高风险操作。如果只签标准合同而无详尽录用条件作为依据，直接以“试用期不合格”辞退极易在仲裁中败诉。</p>
                                        <p>您可以现在点击查看右侧的【合规解除大纲】模块进行风险排查。</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PreviewView;
