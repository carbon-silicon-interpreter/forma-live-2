import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Eye, Send, RefreshCw, CheckCircle2, Sparkles, Image, FileText, Brain,
    Settings, LayoutTemplate, MessageSquare, Box, Type, Palette, MonitorPlay, Save,
    Smartphone, ChevronRight, Edit3, BarChart3, Globe, Link2, FileBadge, Play, Plus,
    MoreHorizontal, Trash2, EyeOff, ChevronDown
} from 'lucide-react';
import PptViewer from '../../components/blocks/PptViewer';
import Questionnaire from '../../components/blocks/Questionnaire';

/* ═══════ MOCK COPILOT MESSAGES ═══════ */
const getCopilotMessages = (page) => {
    if (!page) return [];
    const n = page.name;
    const byType = {
        video: [
            { role: 'ai', text: `已完成「${n}」的脚本草拟。共找到 6 张相关参考图片、提取了核心文案。` },
            { role: 'user', text: '把第二段关于仲裁的口播再精简一点。' },
            { role: 'ai', text: `收到！已提炼第二段口播为核心三点，并更新了分镜配图，请在“中间产物”面板查看最新脚本。` },
            { role: 'ai', text: `最新视频片段已合成完成，可以在预览区进行播放查看。` },
        ],
        questionnaire: [
            { role: 'ai', text: `已为「${n}」生成了 3 道核心诊断题目和一套评分逻辑规则。` },
            { role: 'user', text: '能不能加一个关于社保缴纳的问题？' },
            { role: 'ai', text: '好的，已在题库的“中间产物”中加入「是否按时为全员缴纳五险一金？」，并在最终问卷预览中更新了题目顺序和评分逻辑。' },
        ],
        ppt: [
            { role: 'ai', text: `已为「${n}」抽取了文档核心观点，生成了大纲和 6 页幻灯片草稿。` },
            { role: 'user', text: '第一部分的背景分析大纲太啰嗦了' },
            { role: 'ai', text: '收到！已精简大纲结构，合并了第一部分的内容，幻灯片总数调整为 5 页。请检查中间层的大纲视图。' },
        ],
        page: [
            { role: 'ai', text: `已从多份研报和法律法规中提取了「${n}」的段落物料，初步拼接了长图文。` },
            { role: 'user', text: '帮我加一个案例分析的版块' },
            { role: 'ai', text: '好的，已加入「竞业限制违约典型案例」文本块，请在全稿预览中查看排版效果。' },
        ],
    };
    return byType[page.type] || byType.page;
};

const MODULE_VIEW_META = {
    video: {
        previewLabel: '智能课程',
    },
    questionnaire: {
        previewLabel: '智能问卷',
    },
    ppt: {
        previewLabel: '智能课件',
    },
    page: {
        previewLabel: '智能报告',
    },
};

function getModuleViewMeta(type) {
    return MODULE_VIEW_META[type] || MODULE_VIEW_META.page;
}

function getIntermediateSections(page) {
    if (!page) return [];

    const byType = {
        video: [
            {
                group: '输入材料',
                items: [
                    {
                        id: 'video-source',
                        icon: FileText,
                        label: '用户原文档',
                        title: '用户原文档',
                        description: `当前课程《${page.name}》的原始需求说明与参考资料。`,
                        editable: false,
                        content: {
                            kind: 'article',
                            sections: [
                                {
                                    title: '原始需求',
                                    paragraphs: [
                                        '客户希望把多份用工合规资料整理成一节适合老板和 HR 观看的讲解课程，要求语言直接、案例真实、重点突出。',
                                        `课程标题当前为《${page.name}》，目标是在 15 分钟内讲清常见败诉风险、关键证据链和落地动作。`,
                                    ],
                                },
                                {
                                    title: '重点约束',
                                    list: [
                                        '语言必须为中文，尽量避免生硬术语。',
                                        '需要兼顾“风险提醒”和“可执行动作”。',
                                        '成片节奏要适合短视频/课件混剪展示。',
                                    ],
                                },
                            ],
                        },
                    },
                    {
                        id: 'video-knowledge',
                        icon: Box,
                        label: '文档知识',
                        title: '文档知识',
                        description: '从原文档中抽取出的核心事实、案例和规则。',
                        editable: false,
                        content: {
                            kind: 'cards',
                            columns: 2,
                            cards: [
                                { title: '高频风险点', description: '未签劳动合同、违法辞退、社保断缴是资料中重复出现最多的三类风险。', meta: '自动提炼' },
                                { title: '关键案例', description: '整理出 5 个真实败诉案例，可直接用于课程中的“先吓醒、再给方案”段落。', meta: '案例提炼' },
                                { title: '证据链动作', description: '资料重点强调入职签收、考核留痕、解除通知送达这三条证据链。', meta: '动作归纳' },
                                { title: '表达风格', description: '建议保持“专业但不学究”，用业务语言解释法律后果。', meta: '风格建议' },
                            ],
                        },
                    },
                ],
            },
            {
                group: '中间产物',
                items: [
                    {
                        id: 'video-config',
                        icon: Settings,
                        label: '课程配置',
                        title: '课程配置',
                        description: '课程形式、时长、语言与节奏的生成配置。',
                        editable: true,
                        content: {
                            kind: 'table',
                            columns: ['字段', '当前值'],
                            rows: [
                                ['课程形式', '讲解视频'],
                                ['语言', '中文'],
                                ['目标时长', '12-15 分钟'],
                                ['目标人群', '老板 / HR / 管理层'],
                                ['内容风格', '案例驱动、结论前置'],
                            ],
                        },
                    },
                    {
                        id: 'video-outline',
                        icon: LayoutTemplate,
                        label: '讲解大纲',
                        title: '讲解大纲',
                        description: '课程的章节结构与每一段要讲的重点。',
                        editable: true,
                        content: {
                            kind: 'outline',
                            sections: [
                                { title: '一、开场破题', items: ['用真实赔偿案例切入，说明“没留痕比没做更危险”。'] },
                                { title: '二、三类高频败诉风险', items: ['未签合同的赔偿逻辑', '违法辞退的常见误区', '社保断缴的连锁后果'] },
                                { title: '三、证据链怎么补', items: ['入职签收', '考核记录', '解除通知送达'] },
                                { title: '四、管理动作清单', items: ['给出老板和 HR 的一页式执行清单'] },
                            ],
                        },
                    },
                    {
                        id: 'video-script',
                        icon: MessageSquare,
                        label: '讲解脚本',
                        title: '讲解脚本',
                        description: '按镜头和口播拆开的课程脚本。',
                        editable: true,
                        content: {
                            kind: 'article',
                            sections: [
                                {
                                    title: '开场口播',
                                    paragraphs: [
                                        '很多企业不是不知道有风险，而是低估了“没有证据”会带来多大赔偿。',
                                        '今天这一节课，我只讲三件事：哪些地方最容易败诉、为什么会败诉、怎样在日常管理里把证据提前补上。',
                                    ],
                                },
                                {
                                    title: '风险段落',
                                    paragraphs: [
                                        '如果员工入职超过一个月仍未签劳动合同，企业面临的不只是补签，还可能是双倍工资赔偿。',
                                        '真正棘手的是，很多败诉不是因为企业完全没做，而是做了却没有留下可被仲裁采信的证据。',
                                    ],
                                },
                            ],
                        },
                    },
                ],
            },
            {
                group: '生成附件',
                items: [
                    {
                        id: 'video-slides',
                        icon: Image,
                        label: '幻灯片',
                        title: '幻灯片',
                        description: '配合讲解视频使用的画面与字幕页。',
                        editable: true,
                        content: {
                            kind: 'slides',
                            slides: [
                                { title: '第 1 页 封面', subtitle: page.name, bullets: ['主标题突出风险感', '副标题说明目标人群'] },
                                { title: '第 2 页 风险总览', subtitle: '三类高频败诉场景', bullets: ['未签合同', '违法辞退', '社保断缴'] },
                                { title: '第 3 页 行动清单', subtitle: '证据链补齐步骤', bullets: ['入职留痕', '考核留痕', '解除留痕'] },
                            ],
                        },
                    },
                    {
                        id: 'video-voice',
                        icon: Type,
                        label: '口播语音',
                        title: '口播语音',
                        description: '根据脚本自动合成的语音信息。',
                        editable: false,
                        content: {
                            kind: 'cards',
                            columns: 2,
                            cards: [
                                { title: '音色', description: '沉稳男声，适合企业管理类课程。', meta: '自动合成' },
                                { title: '语速', description: '中速偏快，便于控制在 15 分钟以内。', meta: '参数' },
                                { title: '停顿', description: '在案例结论和动作建议处增加停顿。', meta: '节奏' },
                                { title: '字幕对齐', description: '已按句号和重点停顿切分字幕时间点。', meta: '同步完成' },
                            ],
                        },
                    },
                    {
                        id: 'video-cover',
                        icon: Palette,
                        label: '封面图',
                        title: '封面图',
                        description: '视频封面的标题与画面说明。',
                        editable: false,
                        content: {
                            kind: 'cards',
                            columns: 1,
                            cards: [
                                { title: '封面方案 A', description: '黑底 + 红色警示条，标题为“高管必看：用工合规避雷指南”。', meta: '当前采用' },
                                { title: '封面文案', description: '副标题强调“12 分钟讲清败诉风险与补救动作”。', meta: '自动生成' },
                            ],
                        },
                    },
                ],
            },
        ],
        questionnaire: [
            {
                group: '输入材料',
                items: [
                    {
                        id: 'questionnaire-source',
                        icon: FileText,
                        label: '用户原文档',
                        title: '用户原文档',
                        description: `当前问卷《${page.name}》对应的调研目标与背景资料。`,
                        editable: false,
                        content: {
                            kind: 'article',
                            sections: [
                                {
                                    title: '问卷目标',
                                    paragraphs: [
                                        '用户希望通过一套轻量问卷快速判断企业财税健康程度，并将高风险项自动映射到后续服务建议。',
                                        '整体时长控制在 1 分钟内，既要让访客愿意作答，也要保证问题足够区分风险等级。',
                                    ],
                                },
                                {
                                    title: '约束条件',
                                    list: [
                                        '题目必须通俗，避免财税黑话。',
                                        '答案数量不宜过多，优先单选题。',
                                        '结果页需要能承接后续咨询转化。',
                                    ],
                                },
                            ],
                        },
                    },
                    {
                        id: 'questionnaire-insight',
                        icon: Brain,
                        label: '提炼知识点',
                        title: '提炼知识点',
                        description: '从资料中筛出的核心诊断维度。',
                        editable: false,
                        content: {
                            kind: 'cards',
                            columns: 2,
                            cards: [
                                { title: '票据合规', description: '票据缺失、抵扣资料不全是高频问题。', meta: '风险维度' },
                                { title: '申报及时性', description: '逾期申报和零申报异常需要单独识别。', meta: '风险维度' },
                                { title: '财务流程', description: '是否有固定对账、复核、归档机制直接影响评分。', meta: '流程维度' },
                                { title: '管理动作', description: '是否有专人负责税务事项，是区分低风险和高风险的重要信号。', meta: '组织维度' },
                            ],
                        },
                    },
                ],
            },
            {
                group: '中间产物',
                items: [
                    {
                        id: 'questionnaire-outline',
                        icon: LayoutTemplate,
                        label: '问卷大纲',
                        title: '问卷大纲',
                        description: '整套问卷的分段结构与提问顺序。',
                        editable: true,
                        content: {
                            kind: 'outline',
                            sections: [
                                { title: '一、基础盘点', items: ['确认企业是否有专职财务或代理记账团队。'] },
                                { title: '二、合规检查', items: ['检查发票、申报、账实一致性。'] },
                                { title: '三、风险识别', items: ['识别历史遗留问题和近期经营变化。'] },
                                { title: '四、结果建议', items: ['输出对应的诊断等级与下一步动作。'] },
                            ],
                        },
                    },
                    {
                        id: 'questionnaire-bank',
                        icon: MessageSquare,
                        label: '题库列表',
                        title: '题库列表',
                        description: '当前问卷使用的核心题目与答案选项。',
                        editable: true,
                        content: {
                            kind: 'questions',
                            questions: [
                                {
                                    title: '问题 1',
                                    description: '贵公司是否按月完成纳税申报并留存申报记录？',
                                    options: ['A. 一直按时', 'B. 偶尔逾期', 'C. 经常依赖临时补救'],
                                    note: '用于判断基础申报稳定性。',
                                },
                                {
                                    title: '问题 2',
                                    description: '发票、合同和付款凭证是否能做到一一对应？',
                                    options: ['A. 大部分可以', 'B. 偶尔缺失', 'C. 经常对不上'],
                                    note: '用于判断票据链完整度。',
                                },
                                {
                                    title: '问题 3',
                                    description: '是否有固定人员负责财税复核与归档？',
                                    options: ['A. 有明确负责人', 'B. 偶尔有人兼管', 'C. 基本没有'],
                                    note: '用于判断财税治理能力。',
                                },
                            ],
                        },
                    },
                    {
                        id: 'questionnaire-score',
                        icon: BarChart3,
                        label: '评分逻辑',
                        title: '评分逻辑',
                        description: '每道题对风险等级的影响权重。',
                        editable: true,
                        content: {
                            kind: 'table',
                            columns: ['维度', '判分逻辑', '权重'],
                            rows: [
                                ['申报及时性', '逾期次数越多，风险分越高', '40%'],
                                ['票据完整度', '票据与业务链不一致时加分', '35%'],
                                ['治理能力', '无固定负责人时直接进入黄色预警', '25%'],
                            ],
                        },
                    },
                ],
            },
            {
                group: '生成附件',
                items: [
                    {
                        id: 'questionnaire-config',
                        icon: Settings,
                        label: '问卷配置',
                        title: '问卷配置',
                        description: '问卷展示与结果页相关设置。',
                        editable: false,
                        content: {
                            kind: 'cards',
                            columns: 2,
                            cards: [
                                { title: '展示形式', description: '单页滚动问卷，优先移动端体验。', meta: '前端配置' },
                                { title: '结果分层', description: '低风险 / 中风险 / 高风险三档输出。', meta: '结果策略' },
                                { title: '转化动作', description: '结果页附带“预约顾问”按钮。', meta: '运营承接' },
                                { title: '答题时长', description: '预计 45-60 秒完成。', meta: '体验目标' },
                            ],
                        },
                    },
                ],
            },
        ],
        ppt: [
            {
                group: '输入材料',
                items: [
                    {
                        id: 'ppt-source',
                        icon: FileText,
                        label: '用户原文档',
                        title: '用户原文档',
                        description: `当前课件《${page.name}》的原始培训资料。`,
                        editable: false,
                        content: {
                            kind: 'article',
                            sections: [
                                {
                                    title: '培训目标',
                                    paragraphs: [
                                        '把竞业限制和保密义务讲清楚，重点让主管及以上人员理解“什么不能带走、什么不能做、违约后果是什么”。',
                                        '内容既要足够正式，又要方便在内部培训场景中快速宣讲。',
                                    ],
                                },
                                {
                                    title: '展示要求',
                                    list: [
                                        '结构清晰，每页只讲一个重点。',
                                        '页面文字不宜过密，适合投屏。',
                                        '关键红线和处罚结果必须视觉突出。',
                                    ],
                                },
                            ],
                        },
                    },
                    {
                        id: 'ppt-insight',
                        icon: Box,
                        label: '核心洞察',
                        title: '核心洞察',
                        description: '从培训资料中提炼出的关键结论。',
                        editable: false,
                        content: {
                            kind: 'cards',
                            columns: 2,
                            cards: [
                                { title: '保护对象', description: '商业秘密、客户名单、技术方案是重点保护对象。', meta: '知识提炼' },
                                { title: '适用范围', description: '并非所有员工都适合签竞业协议，重点应覆盖核心岗位。', meta: '边界说明' },
                                { title: '离职风险', description: '离职后的接触竞争对手、带走资料是主要风险场景。', meta: '风险识别' },
                                { title: '管理动作', description: '企业需要同步准备补偿规则、回收流程和留痕机制。', meta: '管理建议' },
                            ],
                        },
                    },
                ],
            },
            {
                group: '中间产物',
                items: [
                    {
                        id: 'ppt-outline',
                        icon: LayoutTemplate,
                        label: '课件大纲',
                        title: '课件大纲',
                        description: '课件页序和每页要承载的信息。',
                        editable: true,
                        content: {
                            kind: 'outline',
                            sections: [
                                { title: '一、先讲清红线', items: ['什么是商业秘密', '为什么竞业限制只适用于核心岗位'] },
                                { title: '二、再讲边界', items: ['在职期间的保密义务', '离职后的竞业边界'] },
                                { title: '三、最后讲后果', items: ['违约金', '返还补偿', '内部追责'] },
                            ],
                        },
                    },
                    {
                        id: 'ppt-slides',
                        icon: Image,
                        label: '幻灯片文稿',
                        title: '幻灯片文稿',
                        description: '每一页幻灯片的标题、说明和讲述要点。',
                        editable: true,
                        content: {
                            kind: 'slides',
                            slides: [
                                { title: '第 1 页 商业秘密保护红线', subtitle: '明确保护对象', bullets: ['技术文档', '客户名单', '未公开财务数据'] },
                                { title: '第 2 页 离职后的竞业限制', subtitle: '说明行为边界', bullets: ['入职竞争对手', '自行创业', '关联交易合作'] },
                                { title: '第 3 页 违反协议的后果', subtitle: '强化处罚认知', bullets: ['返还补偿', '支付违约金', '承担损失赔偿'] },
                            ],
                        },
                    },
                    {
                        id: 'ppt-notes',
                        icon: MessageSquare,
                        label: '演讲备注',
                        title: '演讲备注',
                        description: '给主讲人使用的备注与转场提示。',
                        editable: true,
                        content: {
                            kind: 'article',
                            sections: [
                                {
                                    title: '讲法建议',
                                    paragraphs: [
                                        '第一页不要直接背法条，先从“员工最容易误解的地方”切入，再带出制度设计原因。',
                                        '讲到违约后果时，需要强调“返还补偿 + 赔偿损失”是并行关系，不是二选一。',
                                    ],
                                },
                            ],
                        },
                    },
                ],
            },
            {
                group: '生成附件',
                items: [
                    {
                        id: 'ppt-style',
                        icon: Palette,
                        label: '视觉风格',
                        title: '视觉风格',
                        description: '当前课件的排版和视觉参数。',
                        editable: false,
                        content: {
                            kind: 'cards',
                            columns: 2,
                            cards: [
                                { title: '主色', description: '深蓝 + 红色警示色，适合法规培训。', meta: '主题' },
                                { title: '字体', description: '标题加粗，正文保持高可读性。', meta: '排版' },
                                { title: '页数', description: `${page.slides?.length || 3} 页`, meta: '自动统计' },
                                { title: '展示比例', description: '16:9 投屏比例。', meta: '场景适配' },
                            ],
                        },
                    },
                ],
            },
        ],
        page: [
            {
                group: '输入材料',
                items: [
                    {
                        id: 'page-source',
                        icon: FileText,
                        label: '用户原文档',
                        title: '用户原文档',
                        description: `当前报告《${page.name}》的原始资料与目标说明。`,
                        editable: false,
                        content: {
                            kind: 'article',
                            sections: [
                                {
                                    title: '内容目标',
                                    paragraphs: [
                                        '希望把劳动合同、入职表单和解除协议整理成一套可直接交付的标准合同库。',
                                        '内容需要兼顾可读性和可下载性，既能展示价值，也能直接作为资料包使用。',
                                    ],
                                },
                                {
                                    title: '交付要求',
                                    list: [
                                        '中文表达，偏正式。',
                                        '重点突出“已根据最新口径更新”。',
                                        '适合在图文页面中长期保存和下载。',
                                    ],
                                },
                            ],
                        },
                    },
                    {
                        id: 'page-reference',
                        icon: Link2,
                        label: '参考知识',
                        title: '参考知识',
                        description: '写作时调用的法规与知识库片段。',
                        editable: false,
                        content: {
                            kind: 'cards',
                            columns: 2,
                            cards: [
                                { title: '法规依据', description: '劳动合同法及相关司法解释是主要引用来源。', meta: '法规' },
                                { title: '交付经验', description: '历史客户最常下载的是劳动合同、入职登记表、解除协议。', meta: '经验库' },
                                { title: '页面目标', description: '既要建立专业感，也要推动用户点击下载。', meta: '运营目标' },
                                { title: '关键词', description: '劳动合同、表单、入职、离职、合规。', meta: '检索词' },
                            ],
                        },
                    },
                ],
            },
            {
                group: '中间产物',
                items: [
                    {
                        id: 'page-outline',
                        icon: LayoutTemplate,
                        label: '报告大纲',
                        title: '报告大纲',
                        description: '图文页的章节结构与排序。',
                        editable: true,
                        content: {
                            kind: 'outline',
                            sections: [
                                { title: '一、开场说明', items: ['说明资料库覆盖员工全生命周期。'] },
                                { title: '二、核心模板展示', items: ['劳动合同', '入职登记表', '解除劳动关系协议'] },
                                { title: '三、更新说明', items: ['强调已根据最新司法解释调整。'] },
                                { title: '四、下载引导', items: ['引导用户获取整套资料包。'] },
                            ],
                        },
                    },
                    {
                        id: 'page-draft',
                        icon: MessageSquare,
                        label: '章节草稿',
                        title: '章节草稿',
                        description: '用于最终图文页面的正文草稿。',
                        editable: true,
                        content: {
                            kind: 'article',
                            sections: [
                                {
                                    title: '开场段落',
                                    paragraphs: [
                                        `${page.name} 不是简单把合同模板堆在一起，而是按“入职、在职、离职”三个阶段整理成可直接使用的资料库。`,
                                        '每一份模板都对应了真实管理场景，重点帮助企业减少因表述不规范、留痕不完整导致的争议风险。',
                                    ],
                                },
                                {
                                    title: '模板说明',
                                    paragraphs: [
                                        '标准劳动合同强化了岗位调整、保密义务和规章制度签收的表达。',
                                        '解除劳动关系协议重点补齐了交接、结算、配合义务等常见争议点。',
                                    ],
                                },
                            ],
                        },
                    },
                    {
                        id: 'page-chart',
                        icon: BarChart3,
                        label: '数据图表',
                        title: '数据图表',
                        description: '用于辅助说明的统计信息和展示数据。',
                        editable: false,
                        content: {
                            kind: 'table',
                            columns: ['指标', '说明'],
                            rows: [
                                ['高频下载模板', '劳动合同、入职登记表、解除协议'],
                                ['适用阶段', '入职 / 在职 / 离职'],
                                ['主要价值', '降低争议、统一口径、减少返工'],
                            ],
                        },
                    },
                ],
            },
            {
                group: '生成附件',
                items: [
                    {
                        id: 'page-seo',
                        icon: Globe,
                        label: 'SEO 信息',
                        title: 'SEO 信息',
                        description: '页面标题、摘要和关键词。',
                        editable: false,
                        content: {
                            kind: 'cards',
                            columns: 1,
                            cards: [
                                { title: '页面标题', description: page.name, meta: '当前值' },
                                { title: '页面摘要', description: '一键可用的法务审核版文档，覆盖员工全生命周期。', meta: '描述' },
                                { title: '关键词', description: '劳动合同、入职表单、解除协议、模板下载', meta: '关键词' },
                            ],
                        },
                    },
                ],
            },
        ],
    };

    return byType[page.type] || byType.page;
}

function getProcessSteps(page) {
    if (!page) return [];

    const byType = {
        video: [
            {
                title: '整理媒体素材',
                expert: '媒体素材整理专家',
                input: '文档知识',
                action: '媒体素材整理',
                output: '媒体素材',
                paragraphs: [
                    '我仔细扫描了提供的文档知识，并从中提取了适合做课程案例、镜头提示和字幕强调的内容。',
                    '我优先保留了“败诉风险”“赔偿后果”“证据链补齐动作”三类信息，便于后续脚本直接调用。',
                ],
            },
            {
                title: '设定课程配置',
                expert: '课程配置分析专家',
                input: '文档知识',
                action: '课程配置分析',
                output: '课程配置',
                paragraphs: [
                    '我根据用户需求确认课程形态为讲解视频，语言为中文，目标受众是老板和 HR。',
                    '同时我把节奏定为“结论前置 + 案例解释 + 动作清单”，保证课程更像交付物而不是泛泛科普。',
                ],
            },
            {
                title: '生成讲解大纲',
                expert: '课程结构规划专家',
                input: '课程配置',
                action: '课程结构规划',
                output: '讲解视频大纲',
                paragraphs: [
                    '我按照先破题、再解释风险、最后给解决动作的顺序组织结构，避免信息发散。',
                    '大纲被拆成开场、三类风险、证据链补齐、落地清单四个部分，便于继续展开脚本。',
                ],
            },
            {
                title: '撰写讲解脚本',
                expert: '讲解视频脚本专家',
                input: '讲解视频大纲',
                action: '脚本撰写',
                output: '讲解视频脚本',
                paragraphs: [
                    '我把每一段大纲进一步展开成口播文案和画面提示，确保脚本既能读、也能拍。',
                    '重点段落已经加入结论句，方便后续生成字幕、语音和幻灯片。',
                ],
            },
        ],
        questionnaire: [
            {
                title: '识别诊断维度',
                expert: '问卷分析专家',
                input: '用户原文档',
                action: '诊断维度识别',
                output: '提炼知识点',
                paragraphs: [
                    '我把资料中的风险点整理成可问卷化的诊断维度，避免出现只适合报告、不适合问卷的长句表达。',
                    '当前保留了申报及时性、票据完整度和财税治理能力三个主维度。',
                ],
            },
            {
                title: '设计问卷结构',
                expert: '问卷结构规划专家',
                input: '提炼知识点',
                action: '问卷结构规划',
                output: '问卷大纲',
                paragraphs: [
                    '我把问题顺序设计成“先易后难”，让用户先完成基础盘点，再进入风险识别。',
                    '这样可以减少中途流失，也方便结果页做分层承接。',
                ],
            },
            {
                title: '生成题库列表',
                expert: '题库生成专家',
                input: '问卷大纲',
                action: '题库生成',
                output: '题库列表',
                paragraphs: [
                    '每一道题都采用短句单选设计，保证移动端也能快速作答。',
                    '题目和选项已经对齐评分逻辑，可直接进入问卷渲染。',
                ],
            },
            {
                title: '配置评分逻辑',
                expert: '评分策略专家',
                input: '题库列表',
                action: '评分策略生成',
                output: '评分逻辑',
                paragraphs: [
                    '我为每个诊断维度设置了权重，并将高风险答案映射到更高的风险等级。',
                    '后续结果页会根据总分直接生成对应的建议文案。',
                ],
            },
        ],
        ppt: [
            {
                title: '提炼培训重点',
                expert: '培训内容分析专家',
                input: '用户原文档',
                action: '培训重点提炼',
                output: '核心洞察',
                paragraphs: [
                    '我先把原始资料中的法条、案例和制度要求拆开，只保留适合在培训场景里直接讲清的重点。',
                    '这样可以避免课件变成“法条堆砌”，让听众更容易抓住边界和后果。',
                ],
            },
            {
                title: '规划课件结构',
                expert: '课件结构规划专家',
                input: '核心洞察',
                action: '课件结构规划',
                output: '课件大纲',
                paragraphs: [
                    '我把课件结构拆成红线、边界、后果三个部分，每一页只承载一个核心信息。',
                    '这种结构适合内训投屏，也便于主讲人控制节奏。',
                ],
            },
            {
                title: '生成幻灯片文稿',
                expert: '演示文稿生成专家',
                input: '课件大纲',
                action: '幻灯片生成',
                output: '幻灯片文稿',
                paragraphs: [
                    '每一页幻灯片都已经补齐标题、要点和视觉提示，避免后续排版反复修改。',
                    '关键处罚结果使用更强的警示语气，以提升培训记忆点。',
                ],
            },
            {
                title: '补充演讲备注',
                expert: '讲师辅助专家',
                input: '幻灯片文稿',
                action: '演讲备注生成',
                output: '演讲备注',
                paragraphs: [
                    '我给主讲人补充了转场提示和重点强调句，方便直接照着讲。',
                    '备注里会提醒哪些页面不宜展开太多，哪些页面需要重点停顿。',
                ],
            },
        ],
        page: [
            {
                title: '整理参考知识',
                expert: '知识整理专家',
                input: '用户原文档',
                action: '参考知识整理',
                output: '参考知识',
                paragraphs: [
                    '我先把法规依据、模板经验和下载诉求拆成几个维度，避免正文既想讲价值又想讲规则时失焦。',
                    '最终保留了适合直接放进页面说明和资料引导里的内容片段。',
                ],
            },
            {
                title: '规划图文结构',
                expert: '报告结构规划专家',
                input: '参考知识',
                action: '图文结构规划',
                output: '报告大纲',
                paragraphs: [
                    '我把页面结构定为“说明价值 - 展示模板 - 强调更新 - 引导下载”四段式。',
                    '这样既能让用户快速理解资料包价值，也便于承接下载动作。',
                ],
            },
            {
                title: '撰写章节草稿',
                expert: '图文写作专家',
                input: '报告大纲',
                action: '章节写作',
                output: '章节草稿',
                paragraphs: [
                    '我将每个模板的作用和适用场景写成短段落，保持专业但不冗长。',
                    '重点把“为什么这份模板值得下载”说清楚，而不只是罗列文件名。',
                ],
            },
            {
                title: '补充页面信息',
                expert: '页面发布专家',
                input: '章节草稿',
                action: '页面信息补充',
                output: 'SEO 信息',
                paragraphs: [
                    '我补齐了页面标题、摘要和关键词，方便后续作为长期交付页面使用。',
                    '同时确保页面文案和资料包名称保持一致，减少用户理解成本。',
                ],
            },
        ],
    };

    return byType[page.type] || byType.page;
}

/* ═══════════════ MAIN COMPONENT ═══════════════ */
const ModuleEditorView = ({ pages, setPages }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const page = pages.find(p => p.id === id);

    const assistantWelcome = '你好！我是你的 AI 助理，有什么可以帮你的吗？';
    const [chatMessagesByPageId, setChatMessagesByPageId] = useState({});
    const [chatInput, setChatInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const messagesEndRef = useRef(null);

    const isDraft = page?.tags?.includes('草稿');

    const [activeTab, setActiveTab] = useState('preview'); // preview | materials | thinking
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [previewDevice, setPreviewDevice] = useState('desktop'); // desktop | mobile
    const [selectedMaterialByPageId, setSelectedMaterialByPageId] = useState({});
    const [chatMessages, setChatMessages] = useState(() => {
        const initial = chatMessagesByPageId[id] ?? getCopilotMessages(page);
        return initial.length === 0 ? [{ role: 'ai', text: assistantWelcome }] : initial;
    });

    useEffect(() => {
        const currentMessages = chatMessagesByPageId[id] ?? getCopilotMessages(page);
        if (currentMessages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessagesByPageId, id, page]);

    if (!page) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 text-zinc-400">找不到该模块</h2>
                    <button onClick={() => navigate('/editor')} className="text-blue-600 hover:underline font-bold">返回列表</button>
                </div>
            </div>
        );
    }

    const viewMeta = getModuleViewMeta(page.type);
    const materialSections = getIntermediateSections(page);
    const allMaterials = materialSections.flatMap(section => section.items);
    const selectedMaterialId = selectedMaterialByPageId[id] ?? allMaterials[0]?.id ?? '';
    const selectedMaterial = allMaterials.find(item => item.id === selectedMaterialId) || allMaterials[0];
    const plainWorkspace = activeTab !== 'preview';

    const updateCurrentChat = (updater) => {
        setChatMessagesByPageId(prev => {
            const currentMessages = prev[id] ?? getCopilotMessages(page);
            const nextMessages = typeof updater === 'function' ? updater(currentMessages) : updater;
            return {
                ...prev,
                [id]: nextMessages,
            };
        });
    };


    const handleChat = (e) => {
        if (e) e.preventDefault();
        const nextInput = chatInput.trim();
        if (!nextInput) return;
        updateCurrentChat(prev => [...prev, { role: 'user', text: nextInput }]);
        setChatInput('');
        setIsGenerating(true);

        // Simulate AI actually changing the page content
        setTimeout(() => {
            setIsGenerating(false);
            updateCurrentChat(prev => [...prev, {
                role: 'ai',
                text: `收到！已根据指示全盘梳理了「${page?.name}」的构建逻辑，由于您要求“全盘重新生成”，我已经优化了中间层脚本并同步刷新了最终产物。您可以点击左侧 Tab 实时确认变化。`
            }]);

            // If it's a page type, simulate adding a block
            if (page.type === 'page') {
                setPages(prev => prev.map(p => p.id === id ? {
                    ...p,
                    blocks: [
                        ...(p.blocks || []),
                        { type: 'AI Generated', text: '新增合规风险提示：根据最新司法解释，试用期内的业绩考核必须有明确、公示的书入考核文件作为依据。' }
                    ]
                } : p));
            }
        }, 2000);
    };

    const handleUpdateVisibility = (visible) => {
        setPages(prev => prev.map(p => p.id === id ? { ...p, visible } : p));
    };

    const handleDeleteModule = () => {
        setPages(prev => prev.filter(p => p.id !== id));
        navigate('/editor');
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 800);
    };

    const handlePublishUpdate = () => {
        setIsPublishing(true);
        setTimeout(() => {
            if (isDraft) {
                setPages(prev => prev.map(p => p.id === id ? { ...p, tags: p.tags.filter(t => t !== '草稿') } : p));
            }
            setIsPublishing(false);
        }, 1200);
    };

    return (
        <div className="h-screen w-full flex flex-col overflow-hidden bg-white selection:bg-indigo-100/50">
            {/* ─── Header ─── */}
            <div className="shrink-0 h-16 bg-white flex items-center justify-between px-6 z-50 border-b border-zinc-100">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/editor')} className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-all border border-zinc-200/50">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-px h-6 bg-zinc-200" />
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="px-2 py-1 rounded bg-zinc-100 text-zinc-500 text-[11px] font-bold">
                                {viewMeta.previewLabel}
                            </div>
                        </div>
                        <input
                            type="text"
                            value={page.name}
                            onChange={(e) => {
                                const newName = e.target.value;
                                setPages(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
                                handleSave(); // Trigger auto-save feedback
                            }}
                            className="bg-transparent border-none p-0 text-[18px] font-black tracking-tight text-zinc-900 focus:outline-none focus:ring-0 w-full"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4 relative mr-4">
                    {/* Status Indicators */}
                    <div className="flex items-center gap-3 pr-2 border-r border-zinc-100 mr-1">
                        {/* Visibility Status */}
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold ${page.visible === false ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                            {page.visible === false ? <EyeOff size={12} /> : <Eye size={12} />}
                            {page.visible === false ? '已隐藏' : '展示中'}
                        </div>

                        {/* Save Status */}
                        <div className="flex items-center gap-1.5 h-6">
                            {isSaving ? (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-50 border border-zinc-100 animate-in fade-in slide-in-from-right-2 duration-300">
                                    <RefreshCw size={12} className="animate-spin text-zinc-400" />
                                    <span className="text-[11px] font-bold text-zinc-500 whitespace-nowrap">自动保存中</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 px-2 py-1 opacity-40">
                                    <CheckCircle2 size={12} className="text-zinc-400" />
                                    <span className="text-[11px] font-medium text-zinc-400 whitespace-nowrap">已保存</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handlePublishUpdate}
                        disabled={isPublishing}
                        className="text-[13px] bg-zinc-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-zinc-800 shadow-lg shadow-zinc-200 transition-all active:scale-95 flex items-center gap-2 min-w-[120px] justify-center"
                    >
                        {isPublishing ? (
                            <RefreshCw size={16} className="animate-spin" />
                        ) : (
                            <>
                                <Send size={16} />
                                {isDraft ? '发布模块' : '更新模块'}
                            </>
                        )}
                    </button>

                    <div className="relative ml-2">
                        <button
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className={`w-10 h-10 px-0 rounded-xl border transition-all flex items-center justify-center ${showMoreMenu ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300'}`}
                        >
                            <MoreHorizontal size={20} />
                        </button>

                        {showMoreMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                                <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-2xl border border-zinc-100 shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                    <button
                                        onClick={() => {
                                            handleUpdateVisibility(!page.visible);
                                            setShowMoreMenu(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
                                    >
                                        {page.visible === false ? <Eye size={16} className="text-zinc-500" /> : <EyeOff size={16} className="text-zinc-500" />}
                                        {page.visible === false ? '显示模块' : '隐藏模块'}
                                    </button>
                                    <div className="h-px bg-zinc-100 my-1 mx-2" />
                                    <button
                                        onClick={() => {
                                            if (confirm('确定要删除这个模块吗？')) {
                                                handleDeleteModule();
                                            }
                                            setShowMoreMenu(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                        删除
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Main Content Area ─── */}
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex flex-col overflow-hidden border-r border-zinc-100">
                    {/* ─── Global View Tabs ─── */}
                    <div className="shrink-0 flex items-end px-8 pt-4 pb-0 bg-white border-b border-zinc-100 z-40 gap-8">
                        <div className="flex items-center gap-8">
                            {[
                                { id: 'preview', label: viewMeta.previewLabel },
                                { id: 'materials', label: '中间产物' },
                                { id: 'thinking', label: '过程' }
                            ].map(t => (
                                <button key={t.id} onClick={() => setActiveTab(t.id)}
                                    className={`pb-4 text-[16px] transition-all flex items-center border-b-2 ${activeTab === t.id
                                        ? 'text-zinc-900 font-extrabold border-zinc-900'
                                        : 'text-zinc-400 font-bold hover:text-zinc-600 border-transparent'
                                        }`}>
                                    <span>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        {activeTab === 'materials' && (
                            <MaterialTreePanel
                                sections={materialSections}
                                selectedId={selectedMaterial?.id}
                                onSelect={nextId => setSelectedMaterialByPageId(prev => ({ ...prev, [id]: nextId }))}
                            />
                        )}

                        <div className={`flex-1 overflow-hidden relative flex flex-col ${plainWorkspace ? 'bg-[#f6f7fb]' : 'bg-[#fafafa]'}`}>
                            <div className={`flex-1 overflow-y-auto custom-scrollbar relative ${plainWorkspace ? 'p-6 bg-[#f6f7fb]' : 'p-10 bg-gradient-to-b from-white to-zinc-50/50'}`}>
                                <div className="max-w-6xl mx-auto h-full flex flex-col">
                                    {activeTab === 'preview' && (
                                        <div className="animate-in fade-in duration-500 h-full flex flex-col">
                                            <div className="flex justify-center mb-10 shrink-0 z-10">
                                                <div className="bg-white border border-zinc-200/60 p-1.5 rounded-full flex gap-1 shadow-sm">
                                                    <button onClick={() => setPreviewDevice('desktop')} className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all flex items-center gap-2 ${previewDevice === 'desktop' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}>
                                                        <MonitorPlay size={16} /> 电脑端全屏效果
                                                    </button>
                                                    <button onClick={() => setPreviewDevice('mobile')} className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all flex items-center gap-2 ${previewDevice === 'mobile' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}>
                                                        <Smartphone size={16} /> 手机端沉浸效果
                                                    </button>
                                                </div>
                                            </div>

                                            <div className={`mx-auto transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex-1 overflow-visible ${previewDevice === 'mobile' ? 'w-[390px]' : 'w-full max-w-6xl'}`}>
                                                <div className={`w-full h-full bg-white relative transition-all duration-700 ${previewDevice === 'mobile' ? 'shadow-[0_32px_80px_-16px_rgba(0,0,0,0.1)] overflow-y-auto custom-scrollbar overflow-x-hidden' : 'rounded-none shadow-none bg-transparent'}`}>
                                                    <div className={`${previewDevice === 'mobile' ? 'pt-8 pb-10 origin-top' : ''}`}>
                                                        {page.type === 'video' ? <VideoPreview /> :
                                                            page.type === 'ppt' ? <PptPreview page={page} /> :
                                                                page.type === 'questionnaire' ? <QuestionnairePreview inGenericMobileFrame={previewDevice === 'mobile'} /> :
                                                                    <PagePreview page={page} />}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'materials' && <IntermediateMaterialDetail item={selectedMaterial} />}
                                    {activeTab === 'thinking' && <ThinkingProcess page={page} isGenerating={isGenerating} />}
                                </div>

                                {/* AI Processing Overlay */}
                                {isGenerating && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
                                        <div className="w-[400px] bg-white p-8 rounded-[3rem] shadow-[0_32px_80px_-16px_rgba(79,70,229,0.2)] border border-indigo-100 flex flex-col items-center text-center">
                                            <div className="w-20 h-20 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center mb-6">
                                                <RefreshCw size={32} className="text-indigo-600 animate-spin" />
                                            </div>
                                            <h3 className="text-xl font-black text-zinc-900 mb-2">正在重组内容</h3>
                                            <p className="text-zinc-500 font-bold text-xs tracking-widest mb-6">AI 正在根据指令对当前模块进行整体更新</p>
                                            <div className="w-48 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-600 animate-[progress_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <CopilotPanel
                    page={page} chatMessages={chatMessages} chatInput={chatInput}
                    setChatInput={setChatInput} isGenerating={isGenerating}
                    handleChat={handleChat} messagesEndRef={messagesEndRef}
                />
            </div>
        </div>
    );
};

/* ═══════════════ MATERIAL TREE PANEL ═══════════════ */
function MaterialTreePanel({ sections, selectedId, onSelect }) {
    const items = sections.flatMap(section => section.items);

    return (
        <div className="w-64 shrink-0 bg-white border-r border-zinc-200 flex flex-col overflow-y-auto custom-scrollbar py-6 z-10">
            <div className="px-3 flex flex-col gap-1">
                {items.map(item => (
                    <button
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${selectedId === item.id
                            ? 'bg-zinc-100 text-zinc-900'
                            : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                            }`}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <item.icon size={16} className={selectedId === item.id ? 'text-zinc-800' : 'text-zinc-400'} />
                            <span className="truncate text-[14px] font-medium">{item.label}</span>
                        </div>
                        <ChevronRight size={14} className={selectedId === item.id ? 'text-zinc-500' : 'text-zinc-300'} />
                    </button>
                ))}
            </div>
        </div>
    );
}

function IntermediateMaterialDetail({ item }) {
    if (!item) {
        return (
            <div className="flex-1 rounded-2xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500">
                当前没有可展示的中间产物。
            </div>
        );
    }

    return (
        <div className="flex-1 rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-start justify-between gap-6 border-b border-zinc-100 px-8 py-6">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900">{item.title}</h2>
                </div>
                {item.editable && (
                    <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
                        <Edit3 size={14} />
                        手动修改
                    </button>
                )}
            </div>
            <div className="px-8 py-6">
                {renderMaterialContent(item.content)}
            </div>
        </div>
    );
}

function renderMaterialContent(content) {
    if (!content) {
        return <div className="text-sm text-zinc-500">暂无内容。</div>;
    }

    switch (content.kind) {
        case 'article':
            return (
                <div className="space-y-6">
                    {content.sections?.map(section => (
                        <section key={section.title} className="space-y-3">
                            <h3 className="text-base font-semibold text-zinc-900">{section.title}</h3>
                            {section.paragraphs?.map(paragraph => (
                                <p key={paragraph} className="text-[15px] leading-8 text-zinc-700">
                                    {paragraph}
                                </p>
                            ))}
                            {section.list?.length > 0 && (
                                <ul className="space-y-2 pl-5 text-[15px] leading-7 text-zinc-700 list-disc">
                                    {section.list.map(item => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    ))}
                </div>
            );
        case 'outline':
            return (
                <div className="space-y-4">
                    {content.sections?.map((section, index) => (
                        <div key={section.title} className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-zinc-200 text-sm font-semibold text-zinc-700">
                                    {index + 1}
                                </div>
                                <h3 className="text-base font-semibold text-zinc-900">{section.title}</h3>
                            </div>
                            <ul className="space-y-2 pl-10 list-disc text-[15px] leading-7 text-zinc-700">
                                {section.items?.map(item => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            );
        case 'cards':
            return (
                <div className={`grid gap-4 ${content.columns === 1 ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'}`}>
                    {content.cards?.map(card => (
                        <div key={card.title} className="rounded-xl border border-zinc-200 p-5">
                            <div className="flex items-center justify-between gap-4">
                                <h3 className="text-base font-semibold text-zinc-900">{card.title}</h3>
                                {card.meta && <span className="text-xs text-zinc-400">{card.meta}</span>}
                            </div>
                            <p className="mt-3 text-[15px] leading-7 text-zinc-700">{card.description}</p>
                        </div>
                    ))}
                </div>
            );
        case 'table':
            return (
                <div className="overflow-hidden rounded-xl border border-zinc-200">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50">
                            <tr>
                                {content.columns?.map(column => (
                                    <th key={column} className="px-4 py-3 font-medium text-zinc-500">{column}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {content.rows?.map((row, index) => (
                                <tr key={index} className="border-t border-zinc-100">
                                    {row.map(cell => (
                                        <td key={cell} className="px-4 py-3 text-zinc-700">{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        case 'questions':
            return (
                <div className="space-y-4">
                    {content.questions?.map(question => (
                        <div key={question.title} className="rounded-xl border border-zinc-200 p-5">
                            <div className="flex items-center justify-between gap-4">
                                <h3 className="text-base font-semibold text-zinc-900">{question.title}</h3>
                                {question.note && <span className="text-xs text-zinc-400">{question.note}</span>}
                            </div>
                            <p className="mt-3 text-[15px] leading-7 text-zinc-700">{question.description}</p>
                            <div className="mt-4 space-y-2">
                                {question.options?.map(option => (
                                    <div key={option} className="rounded-lg bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
                                        {option}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            );
        case 'slides':
            return (
                <div className="space-y-4">
                    {content.slides?.map(slide => (
                        <div key={slide.title} className="rounded-xl border border-zinc-200 p-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-semibold text-zinc-900">{slide.title}</h3>
                                    <p className="mt-1 text-sm text-zinc-500">{slide.subtitle}</p>
                                </div>
                            </div>
                            <ul className="mt-4 space-y-2 pl-5 list-disc text-[15px] leading-7 text-zinc-700">
                                {slide.bullets?.map(bullet => (
                                    <li key={bullet}>{bullet}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            );
        default:
            return <div className="text-sm text-zinc-500">当前内容类型暂不支持展示。</div>;
    }
}

/* ═══════════════ COPILOT PANEL ═══════════════ */
function CopilotPanel({ page, chatMessages, chatInput, setChatInput, isGenerating, handleChat, messagesEndRef }) {
    return (
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6 custom-scrollbar bg-white">
                {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                        {msg.role === 'ai' && (
                            <div className="mb-2" />
                        )}
                        <div className={`px-5 py-4 rounded-[1.5rem] text-[14px] leading-relaxed max-w-[90%] shadow-sm ${msg.role === 'user'
                            ? 'bg-zinc-900 text-white rounded-br-none shadow-xl'
                            : 'bg-zinc-50 border border-zinc-100 text-zinc-800 rounded-bl-none'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isGenerating && (
                    <div className="flex items-center gap-3 text-indigo-600 text-sm bg-indigo-50/50 border border-indigo-100/50 w-full px-5 py-4 rounded-2xl rounded-bl-none shadow-sm animate-pulse">
                        <RefreshCw size={18} className="animate-spin" />
                        <span className="font-bold">正在根据您的指令刷新内容...</span>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Form */}
            <div className="p-6 border-t border-zinc-100 bg-white shrink-0">
                <form onSubmit={handleChat} className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-0 group-focus-within:opacity-20 transition-opacity duration-300" />
                    <textarea
                        value={chatInput} onChange={e => setChatInput(e.target.value)}
                        placeholder="告诉我你想对「中间产物」或「最终产物」做哪些调整..."
                        rows={3}
                        className="relative w-full bg-zinc-50 border border-zinc-200 rounded-[1.75rem] pl-5 pr-14 py-4 text-[14px] focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 transition-all outline-none text-zinc-800 placeholder-zinc-400 resize-none shadow-inner leading-relaxed"
                    />
                    <button type="submit" disabled={!chatInput.trim() || isGenerating}
                        className="absolute right-3 bottom-3 w-10 h-10 flex items-center justify-center bg-zinc-900 text-white rounded-2xl disabled:opacity-20 hover:bg-indigo-600 transition-all shadow-xl active:scale-90 scale-100">
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}

/* ═══════════════ COMMON THINKING PROCESS ═══════════════ */
function ThinkingProcess({ page, isGenerating }) {
    const steps = getProcessSteps(page);

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in duration-300 pb-20">

            <div className="relative pl-6">
                <div className="absolute left-[22px] top-4 bottom-4 w-px bg-zinc-200" />
                <div className="space-y-6">
                    {steps.map((step, index) => {
                        const isLastStep = index === steps.length - 1;
                        const stepRunning = isGenerating && isLastStep;

                        return (
                            <div key={step.title} className="relative pl-10">
                                <div className={`absolute left-0 top-6 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white ${stepRunning ? 'border-amber-400 text-amber-600' : 'border-violet-500 text-violet-600'}`}>
                                    {stepRunning ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                </div>
                                <div className="rounded-2xl border border-zinc-200 bg-white px-7 py-6 shadow-sm">
                                    <h3 className="text-2xl font-bold text-zinc-900">{step.title}</h3>
                                    <p className="mt-3 text-[15px] leading-8 text-zinc-500">
                                        根据《{step.input}》，由
                                        <span className="mx-1 font-semibold text-violet-600">{step.expert}</span>
                                        进行{step.action}，它将生成《{step.output}》。
                                    </p>

                                    <div className="mt-6 space-y-3 text-[15px] leading-8 text-zinc-700">
                                        {step.paragraphs.map(paragraph => (
                                            <p key={paragraph}>{paragraph}</p>
                                        ))}
                                    </div>

                                    <div className="mt-6 border-t border-zinc-100 pt-4">
                                        <button className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700">
                                            <FileBadge size={16} />
                                            {step.output}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════ VIDEO SUB-VIEWS ═══════════════ */
function VideoPreview() {
    return (
        <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="w-full relative rounded-[40px] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.3)] group cursor-pointer aspect-video bg-zinc-900 flex items-center justify-center">
                <div className="absolute inset-0 bg-cover bg-center brightness-50 contrast-125" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1288&auto=format&fit=crop")' }} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />

                <div className="absolute inset-x-12 bottom-12 z-20">
                    <p className="text-white text-3xl font-black mb-4 leading-[1.1] tracking-tighter drop-shadow-2xl">高管必看：中小企业法律合规与风险兜底指南</p>
                    <div className="flex items-center gap-6">
                        <div className="flex-1 bg-white/20 h-2 rounded-full overflow-hidden backdrop-blur-3xl border border-white/10 shadow-inner">
                            <div className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 w-1/3 h-full rounded-full shadow-[0_0_12px_rgba(129,140,248,0.5)]" />
                        </div>
                        <span className="text-white/60 font-black font-mono text-xs tracking-widest">04:22 / 12:45</span>
                    </div>
                </div>

                <button className="absolute inset-0 w-full h-full flex items-center justify-center group z-30">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-2xl border border-white/30 rounded-full flex items-center justify-center group-hover:bg-indigo-600/90 transition-all shadow-[0_0_64px_rgba(0,0,0,0.4)] group-hover:scale-110 active:scale-95 duration-500">
                        <Play size={40} className="text-white fill-white ml-2" />
                    </div>
                </button>
            </div>
        </div>
    );
}

function VideoMaterials() {
    return (
        <div className="max-w-6xl mx-auto w-full flex gap-12 animate-in fade-in slide-in-from-bottom-6 duration-500 h-full pb-20 mt-4">
            <div className="flex-1">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight">制作脚本</h2>
                    <span className="bg-zinc-100 text-zinc-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-zinc-200/50">已生成 1,248 字</span>
                </div>
                <div className="bg-white rounded-[2.5rem] border border-zinc-200 p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
                    {[
                        { time: 'T-00:00', label: 'Hook Segment', content: '核心导语：最近不少后台粉丝在问，公司没签合同被判赔了15万，这钱能不能不交？我的回答是：不仅要交，你可能还要交更多。', visual: '大面积红色警示图层覆盖，伴随低音重击采样效果音。' },
                        { time: 'T-00:45', label: 'Problem analysis', content: '深度解析：很多老板觉得“没落笔”就没关系。但在法律上，事实劳动关系的认定往往比纸面合同更严苛。三大赔偿陷阱解析。', visual: '三维立体柱状图升起，显示败诉率。' },
                        { time: 'T-02:15', label: 'Solution model', content: '行动指南：HR必须掌握的入职五件套。从签收手册到社保核验，每一个动作都要形成像素级的证据链。', visual: '流程化图标连线动画。' }
                    ].map((s, i) => (
                        <div key={i} className="group relative flex gap-6 pb-6 border-b border-zinc-100 last:border-0 last:pb-0">
                            <div className="w-16 shrink-0 pt-1">
                                <span className="text-[11px] font-black font-mono text-zinc-400 group-hover:text-indigo-500 transition-colors uppercase tracking-widest">{s.time}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">{s.label}</span>
                                </div>
                                <p className="text-[15px] text-zinc-800 font-bold mb-3 leading-relaxed group-hover:text-indigo-900 transition-colors">{s.content}</p>
                                <div className="bg-zinc-50 border border-zinc-200/60 p-4 rounded-2xl flex items-start gap-3 transform group-hover:translate-x-1 transition-transform">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-200/50 flex items-center justify-center shrink-0"><Image size={16} className="text-zinc-400" /></div>
                                    <p className="text-[12px] text-zinc-500 font-medium leading-relaxed italic m-0 pt-0.5">{s.visual}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-80 shrink-0">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight">视觉素材</h2>
                    <button className="p-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors"><Plus size={16} /></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="group bg-white rounded-[1.5rem] border border-zinc-200/60 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:scale-105">
                            <div className="aspect-square bg-gradient-to-br from-zinc-50 to-zinc-200 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-10"><Eye size={20} className="text-white" /></div>
                                <Image size={28} className="text-zinc-300 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="p-3 bg-white">
                                <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest truncate block">asset_vx_0{i}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════ PPT SUB-VIEWS ═══════════════ */
function PptPreview({ page }) {
    return (
        <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-500 pb-20">
            <div className="w-full aspect-video min-h-[600px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.1)] rounded-[40px] overflow-hidden bg-zinc-900 border border-zinc-200/50">
                <PptViewer slides={page?.slides || []} />
            </div>
        </div>
    );
}

function PptMaterials() {
    return (
        <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-500 h-full pb-20 mt-4">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-zinc-900 tracking-tight">结构化大纲</h2>
                <div className="flex gap-2">
                    <button className="p-2 px-4 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Export JSON</button>
                    <button className="p-2 px-4 bg-white border border-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-widest">Copy Text</button>
                </div>
            </div>
            <div className="bg-white rounded-[3rem] border border-zinc-200 p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-px h-full bg-zinc-100 ml-16" />
                <div className="flex flex-col gap-10">
                    {[
                        { title: 'The Modern Compliance Gap', points: ['现状：法律条款理解滞后与监管力度增强之间的博弈。', '数据：中小企业用工法律诉讼年增长率统计分析图。', '结论：事后纠偏成本高于事前预防成本 20 倍。'] },
                        { title: 'Strategic SOP Implementation', points: ['入职场景：入职登记表、简历真实性承诺书、背景调查。', '管理场景：加班申请制、远程办公考核记录、工资条签收。', '退出场景：解除通知书准确投递证据、工作交接单与承诺函。'] }
                    ].map((s, i) => (
                        <div key={i} className="relative group pl-12 flex gap-12">
                            <div className="absolute left-[-2rem] top-1.5 w-12 h-12 bg-white border-4 border-zinc-900 rounded-[1.25rem] flex items-center justify-center text-sm font-black text-zinc-900 z-10 group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all duration-500 shadow-xl group-hover:rotate-[15deg]">
                                L-{i + 1}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight mb-4 group-hover:text-indigo-600 transition-colors">{s.title}</h3>
                                <div className="space-y-4">
                                    {s.points.map((p, j) => (
                                        <div key={j} className="flex items-start gap-4 p-5 bg-zinc-50 border border-zinc-200/50 rounded-2xl group-hover:bg-white group-hover:shadow-xl transition-all duration-500 border-l-4 border-l-zinc-300 group-hover:border-l-indigo-500">
                                            <div className="w-5 h-5 rounded bg-zinc-200/80 mt-0.5 shrink-0 flex items-center justify-center text-[10px] font-black text-zinc-400 group-hover:bg-indigo-500 group-hover:text-white">{j + 1}</div>
                                            <p className="text-[14px] text-zinc-600 font-bold leading-relaxed">{p}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════ QUESTIONNAIRE SUB-VIEWS ═══════════════ */
function QuestionnairePreview() {
    return (
        <div className="w-full flex justify-center pb-20 pt-10">
            <Questionnaire />
        </div>
    );
}

function QuestionnaireMaterials() {
    return (
        <div className="max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-500 h-full pb-20 mt-4">
            <h2 className="text-2xl font-black text-zinc-900 mb-8 tracking-tight">逻辑权重表</h2>
            <div className="bg-white rounded-[3rem] border border-zinc-200 px-8 py-4 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-zinc-100">
                            <th className="py-6 font-black text-[10px] text-zinc-400 uppercase tracking-[0.3em] pl-4">Matrix ID</th>
                            <th className="py-6 font-black text-[10px] text-zinc-400 uppercase tracking-[0.3em] w-1/2">Audit Material Fragment</th>
                            <th className="py-6 font-black text-[10px] text-zinc-400 uppercase tracking-[0.3em]">Compliance Pole</th>
                            <th className="py-6 font-black text-[10px] text-zinc-400 uppercase tracking-[0.3em] text-right pr-4">Risk Weight</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {[
                            { id: 'MTX-A1', q: '劳动合同书面化比例及签署节点溯源', tag: 'CONTRACT_CORE', w: 'CRITICAL (50%)' },
                            { id: 'MTX-B2', q: '社会保险金账户开立及全员基数申报实录', tag: 'SOCIAL_EXPENSE', w: 'HIGH (30%)' },
                            { id: 'MTX-C3', q: '绩效考核标准(KPI)的公示与书面确认记录', tag: 'KPI_LEGALITY', w: 'MODERATE (15%)' },
                            { id: 'MTX-D4', q: '离职会谈笔录与非竞争协议解除回执', tag: 'EXIT_SECURITY', w: 'LOW (5%)' },
                        ].map((row, i) => (
                            <tr key={i} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-all cursor-default group">
                                <td className="py-6 font-mono text-zinc-400 font-black text-[10px] pl-4 group-hover:text-zinc-900">{row.id}</td>
                                <td className="py-6 font-black text-zinc-800 pr-10 leading-snug uppercase text-[15px] italic">{row.q}</td>
                                <td className="py-6 py-6"><span className="bg-white border-2 border-zinc-100 text-zinc-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest group-hover:border-indigo-500 group-hover:text-indigo-600 transition-all">{row.tag}</span></td>
                                <td className="py-6 text-right font-black text-rose-600 pr-4 group-hover:scale-110 transition-transform origin-right italic text-[14px]">{row.w}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ═══════════════ PAGE SUB-VIEWS ═══════════════ */
function PagePreview({ page }) {
    return (
        <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-500 pb-20">
            <div className="w-full bg-white/60 backdrop-blur-xl p-16 rounded-[48px] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-white min-h-[800px] prose prose-zinc max-w-none">
                <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 mb-8">{page.name}</h1>
                <p className="text-xl text-zinc-500 leading-relaxed mb-12">
                    {page.description}
                </p>
                <div className="relative aspect-[21/9] w-full overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1554224155-1696413575b9?q=80&w=1282&auto=format&fit=crop")' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-black/30" />
                    <div className="absolute inset-x-16 bottom-16">
                        <span className="bg-zinc-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl mb-6 inline-block">Issue #041</span>
                        <h1 className="text-6xl font-black text-zinc-900 leading-[0.95] tracking-tighter uppercase pr-20 drop-shadow-sm italic italic mb-4">{page.name}</h1>
                        <p className="text-zinc-600 font-bold uppercase tracking-[0.4em] text-xs">A comprehensive legal framework by Forma AI</p>
                    </div>
                </div>

                <div className="p-16 px-20 flex flex-col gap-12">
                    <div className="flex gap-16">
                        <div className="flex-1 prose prose-zinc max-w-none">
                            <p className="text-2xl font-black text-zinc-900 leading-normal mb-10 tracking-tight italic italic">
                                面对动态变化的法律环境，静态的规章制度已不再适用。你需要的是一套能够自我感知、自主进化的用工风险防御系统。
                            </p>
                            <div className="grid grid-cols-2 gap-10 mt-16 pt-10 border-t border-zinc-100">
                                <div>
                                    <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">Phase 01</h3>
                                    <h4 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase">全员书面化契约</h4>
                                    <p className="text-zinc-500 text-sm leading-loose">
                                        基于区块链审计的合同签署流。每个入职节点自动触发合同生成、签章及电子取证存储，确保从源头掐灭双倍工资赔偿的苗头。
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">Phase 02</h3>
                                    <h4 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight uppercase">SOP 证据链闭环</h4>
                                    <p className="text-zinc-500 text-sm leading-loose">
                                        将企业规章制度解构为可追踪的数字化 SOP。每一个确认点击、每一份手册下载都形成不可篡改的法律证据，为解除合同提供坚实盾牌。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function PageMaterials({ page }) {
    const defaultMaterials = [
        { type: 'LEG_QUO', source: '《劳动合同法》第 23、24 条', content: '关于竞业限制协议（Non-compete Agreement）的生效要件与补偿金支付标准的最新裁标。' },
        { type: 'INS_REP', source: '2025 AI 劳动法审判实务白皮书', content: '统计显示 74% 的中小企业败诉源于“录用条件”在招聘与入职环节的一致性断裂。' },
        { type: 'SOP_MOD', source: 'Forma 标准化入职流 A1', content: '从候选人录用通知书(Offer) 到 劳动合同、知识产权协议、保密协议的自动串联装配逻辑。' },
        { type: 'SEO_STR', source: 'Metadata Engine', content: '自动化生成的 SEO 标签池，包含：劳动纠纷、合规、企业法务、避雷。' }
    ];

    const materialsToRender = page.blocks?.filter(b => b.type !== 'AI Generated').map(b => ({
        type: 'DOC_EXT',
        source: '知识库导入',
        content: b.text || (b.items?.[0]?.title) || '内容片段'
    })) || [];

    return (
        <div className="max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-500 h-full pb-20 mt-4">
            <h2 className="text-2xl font-black text-zinc-900 mb-10 tracking-tight">知识片段库</h2>
            <div className="grid grid-cols-2 gap-8">
                {[...defaultMaterials, ...materialsToRender].map((m, i) => (
                    <div key={i} className="group bg-white border-2 border-zinc-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 hover:scale-[1.02] hover:border-indigo-400 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-50 rounded-bl-full group-hover:bg-indigo-50 transition-colors" />
                        <div>
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <span className="bg-zinc-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-md group-hover:bg-indigo-600 transition-colors">{m.type}</span>
                                <div className="h-px w-8 bg-zinc-200" />
                            </div>
                            <p className="text-zinc-800 text-[15px] font-black leading-relaxed mb-10 group-hover:text-zinc-950 transition-colors uppercase tracking-tight italic">{m.content}</p>
                        </div>
                        <div className="flex items-center gap-2 pt-6 border-t border-zinc-100">
                            <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-200 group-hover:bg-white group-hover:border-indigo-200 transition-all"><Link2 size={12} className="text-zinc-400 group-hover:text-indigo-500" /></div>
                            <span className="text-[10px] font-black text-zinc-400 font-mono uppercase tracking-widest truncate max-w-[200px] group-hover:text-zinc-600">{m.source}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ═══════════════ STYLES ═══════════════ */
const style = document.createElement('style');
style.textContent = `
@keyframes progress {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(0); }
    100% { transform: translateX(100%); }
}
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e4e4e7;
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #d4d4d8;
}
`;
document.head.appendChild(style);

export default ModuleEditorView;
