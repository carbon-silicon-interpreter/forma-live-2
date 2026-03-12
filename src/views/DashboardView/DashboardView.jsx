import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    Eye,
    MessageSquare,
    Plus,
    Sparkles
} from 'lucide-react';
import {
    initialGlobalConfigs,
    initialMaterials,
    initialPages
} from '../../config/mockData';

const STORAGE_KEYS = {
    materials: 'forma-live/materials',
    pages: 'forma-live/pages',
    globalConfigs: 'forma-live/globalConfigs'
};

const STATUS_STYLES = {
    distributed: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    draft: 'border-zinc-200 bg-zinc-100 text-zinc-600'
};

const readPersistedState = (key, fallback) => {
    if (typeof window === 'undefined') {
        return fallback;
    }

    try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
        console.warn(`Failed to read persisted state for ${key}`, error);
        return fallback;
    }
};

const buildProjects = () => {
    const pages = readPersistedState(STORAGE_KEYS.pages, initialPages);
    const materials = readPersistedState(STORAGE_KEYS.materials, initialMaterials);
    const globalConfigs = readPersistedState(STORAGE_KEYS.globalConfigs, initialGlobalConfigs);
    const visibleMaterials = materials.filter(material => material.visible !== false);
    const styleConfig = globalConfigs.find(config => config.type === 'style');
    const liveProjectName = styleConfig?.values?.siteName || 'Living Handbook';

    return [
        {
            id: 'live-default',
            title: liveProjectName,
            status: 'distributed',
            updatedAt: '刚刚更新',
            views: '1.3k',
            copilotInteractions: '86',
            modules: pages.length,
            materials: visibleMaterials.length,
            configurePath: '/editor',
            previewPath: '/site/default?mode=operate'
        },
        {
            id: 'tax-onboarding',
            title: '财税代理 onboarding',
            status: 'distributed',
            updatedAt: '今天 09:20',
            views: '842',
            copilotInteractions: '57',
            modules: 6,
            materials: 8,
            configurePath: '/editor',
            previewPath: '/site/default?mode=operate'
        },
        {
            id: 'audit-delivery',
            title: '年度审计交付',
            status: 'distributed',
            updatedAt: '昨天 18:40',
            views: '516',
            copilotInteractions: '23',
            modules: 5,
            materials: 12,
            configurePath: '/editor',
            previewPath: '/site/default?mode=operate'
        },
        {
            id: 'hr-training',
            title: 'HR 合规培训',
            status: 'draft',
            updatedAt: '昨天 11:05',
            views: '128',
            copilotInteractions: '9',
            modules: 4,
            materials: 6,
            configurePath: '/editor'
        }
    ];
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return '早上好，小步';
    if (hour >= 12 && hour < 18) return '下午好，小步';
    return '晚上好，小步';
};

const getSubtitle = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return '新的一天，看看你的项目有什么进展。';
    if (hour >= 12 && hour < 18) return '下午也要继续，项目数据等你来看。';
    return '忙了一天了，最后看看今天的数据吧。';
};

const getTodayLabel = () => {
    const d = new Date();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${d.getMonth() + 1} 月 ${d.getDate()} 日 · ${weekdays[d.getDay()]}`;
};

const DashboardView = () => {
    const navigate = useNavigate();
    const projects = buildProjects();

    const handleCreateHandbook = () => navigate('/editor');
    const handleConfigure = (project) => {
        if (project.configurePath) {
            navigate(project.configurePath);
        }
    };
    const handlePreview = (project) => {
        if (project.previewPath) {
            window.open(project.previewPath, '_blank');
        }
    };

    return (
        <div className="min-h-screen px-6 pb-14 pt-14 md:px-12 xl:px-20">
            <div className="mb-12 flex items-center justify-between">
                <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tighter text-zinc-900">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black">
                        <Sparkles size={12} className="text-white" />
                    </div>
                    Living Handbook
                </h1>

                <button
                    type="button"
                    aria-label="账号头像"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-sm font-semibold text-white shadow-[0_10px_24px_rgb(15,23,42,0.12)]"
                >
                    FM
                </button>
            </div>

            <div className="max-w-6xl">
                <div className="mb-10">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
                        {getTodayLabel()}
                    </p>
                    <h2
                        className="mb-3 text-5xl leading-[1.15] tracking-tight text-zinc-900 md:text-7xl"
                        style={{ fontFamily: "'Lora', Georgia, serif", fontWeight: 500 }}
                    >
                        {getGreeting()}
                    </h2>
                    <p className="text-base text-zinc-500">{getSubtitle()}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <button
                        type="button"
                        onClick={handleCreateHandbook}
                        className="flex min-h-[228px] flex-col justify-between rounded-[26px] border border-dashed border-zinc-200 bg-white/55 p-5 text-left transition-colors hover:bg-white/75"
                    >
                        <div>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
                                <Plus size={20} />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold tracking-tight text-zinc-900">
                                创建 living handbook
                            </h3>
                            <p className="text-sm leading-6 text-zinc-500">
                                从空白项目或已有模板快速开始。
                            </p>
                        </div>
                    </button>

                    {projects.map((project) => (
                        <article
                            key={project.id}
                            onClick={() => handleConfigure(project)}
                            className="flex min-h-[228px] cursor-pointer flex-col rounded-[26px] border border-white/80 bg-white/82 p-5 shadow-[0_10px_28px_rgb(15,23,42,0.05)] backdrop-blur-xl transition-shadow hover:shadow-[0_14px_36px_rgb(15,23,42,0.10)]"
                        >
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <h3 className="truncate text-lg font-semibold tracking-tight text-zinc-900">
                                        {project.title}
                                    </h3>
                                    <p className="mt-1 text-xs text-zinc-400">
                                        更新于 {project.updatedAt}
                                    </p>
                                </div>
                                <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLES[project.status]}`}>
                                    {project.status === 'distributed' ? '已分发' : '草稿'}
                                </span>
                            </div>

                            <div className="mb-4 grid grid-cols-2 gap-3 rounded-[22px] bg-zinc-50/85 p-4">
                                <div>
                                    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                                        <Eye size={13} />
                                        浏览量
                                    </div>
                                    <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
                                        {project.views}
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                                        <MessageSquare size={13} />
                                        对话量
                                    </div>
                                    <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
                                        {project.copilotInteractions}
                                    </p>
                                </div>
                            </div>

                            <p className="mb-5 text-sm text-zinc-500">
                                {project.modules} 个模块
                                <span className="mx-2 text-zinc-300">/</span>
                                {project.materials} 份资料
                            </p>

                            <div className="mt-auto flex gap-2">
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleConfigure(project); }}
                                    className="flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                                >
                                    配置
                                </button>
                                <button
                                    type="button"
                                    disabled={!project.previewPath}
                                    onClick={(e) => { e.stopPropagation(); handlePreview(project); }}
                                    className={`flex flex-1 items-center justify-center gap-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                                        project.previewPath
                                            ? 'bg-black text-white hover:bg-zinc-800'
                                            : 'cursor-not-allowed bg-zinc-200 text-zinc-500'
                                    }`}
                                >
                                    {project.previewPath ? '运营' : '待分发'} <ChevronRight size={14} />
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
