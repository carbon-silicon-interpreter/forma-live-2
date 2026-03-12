export const initialMaterials = [
    {
        id: 'm1', name: '法保网品牌介绍.pdf', type: 'pdf', visible: true,
        tags: ['品牌实力', '服务矩阵'],
        blocks: [
            { type: 'h2', text: '法保网：中小企业身边的法务部' },
            {
                type: 'grid', items: [
                    { title: '🏢 平台实力', desc: '全国领先的互联网法律服务平台，10年+行业深耕，为企业保驾护航。' },
                    { title: '⚖️ 核心服务', desc: '涵盖合同智能审核、用工合规体检、知识产权保护及股权架构设计。' },
                    { title: '💼 专业团队', desc: '500+ 全职资深法务与实战律师，7x24小时全天候响应您的法律咨询。' }
                ]
            }
        ]
    },
    {
        id: 'm2', name: '用工合规白皮书(2026).pdf', type: 'pdf', visible: true,
        tags: ['劳动合同', '辞退补偿'],
        blocks: [
            { type: 'h2', text: '企业用工风险与排雷指南' },
            { type: 'p', text: '年底仲裁案件频发，以下是企业最容易踩坑的用工雷区：' },
            {
                type: 'grid', items: [
                    { title: '⚠️ 未签劳动合同', desc: '风险极高。入职满1个月未签合同，企业需支付双倍工资（如月薪6000，额外赔付6.6万）。' },
                    { title: '⚠️ 违法辞退', desc: '无合法理由辞退员工（2N赔偿）。必须制定合理的录用条件与不胜任工作考核依据。' },
                    { title: '⚠️ 社保公积金断缴', desc: '随时面临员工补缴诉求及行政处罚，可能直接触发经济补偿金的赔付。' }
                ]
            }
        ]
    },
    {
        id: 'm3', name: '客户常见败诉案例库.txt', type: 'txt', visible: false,
        tags: ['内部机密', '攻单弹药'],
        blocks: [
            { type: 'p', text: '【销售内部视图】针对建筑、餐饮行业的客户，重点打“工伤未交社保”的痛点：案例A，某餐饮店因未交社保员工摔伤，全额赔付近15万，直接导致门店倒闭。用此案例可快速推进包年服务成单。' }
        ]
    },
    {
        id: 'm4', name: '劳动关系解除实操FAQ.docx', type: 'doc', visible: true,
        tags: ['高频问题', '实操指南'],
        blocks: [
            { type: 'h2', text: '劳动关系解除高频问题解答' },
            { type: 'p', text: '1. 试用期不符合录用条件怎么辞退？\n答：需要有明确的考核标准签字确认，并保留考核不合格的客观证据。' },
            { type: 'p', text: '2. 员工严重违纪怎么处罚？\n答：依据民主程序制定的规章制度，收集确凿证据后以书面形式通知解除。' }
        ]
    },
    {
        id: 'm5', name: '竞业限制协议(标准版).pdf', type: 'pdf', visible: true,
        tags: ['保密协议', '竞业限制'],
        blocks: [
            { type: 'h2', text: '保密及竞业限制协议' },
            { type: 'p', text: '第一条 保密义务\n乙方在职期间及离职后，均应对甲方的商业秘密承担保密义务。' }
        ]
    }
];

export const initialPages = [
    {
        id: 'p_cover',
        name: '封面导览',
        type: 'cover',
        description: 'Living handbook 的开场模块，用来承接品牌概览、阅读路径和第一屏信息。',
        hero: {
            eyebrow: '让专业的人做专业的事',
            highlight: '一站式财务代理服务',
            description: '福马财税深耕行业十余年，为您提供记账报税、工商注册、财税咨询等全方位服务。'
        },
        cards: [
            {
                title: '公司实力',
                body: '专业的会计师团队，精通各行业税收优惠政策，累计服务超过 5000+ 中小微企业，帮助企业合法合规降本增效。'
            },
            {
                title: '权威认证',
                body: '本地财政局批准设立的专业代账机构，拥有代理记账许可证书。核心团队成员均具有 CPA、中级会计师等专业资格认证。'
            },
            {
                title: '联系方式',
                body: '电话：400-888-9999\n微信：fuma-caiwu\n地址：科技园创新大厦 18 楼'
            }
        ],
        blocks: []
    },
    {
        id: 'p1',
        name: '企业财税健康自测问卷',
        type: 'questionnaire',
        description: '请花 1 分钟时间完成以下核心自测，我们将基于您的选项，由 AI 即刻出具一份专属的《企业财税健康诊断方案》。',
        blocks: []
    },
    {
        id: 'p2',
        name: '高管必看：用工合规避雷指南',
        type: 'video',
        duration: '18:45',
        description: '资深劳动法律师实操分享，带你识别并规避招录、在职、离职全流程的用工“深水炸弹”。',
        blocks: []
    },
    {
        id: 'p3',
        name: '2026 核心员工保密及竞业限制',
        type: 'ppt',
        description: '针对主管及以上涉密人员的专项培训课件。建议搭配《竞业协议》同步下发学习。',
        slides: [
            { id: 's1', title: '商业秘密保护红线', subtitle: '—— 核心技术与客户名单', content: '所有的技术文档、未公开的财务数据及客户CRM联系方式，均为企业最高机密。', bg: 'from-blue-900 to-indigo-900' },
            { id: 's2', title: '离职后的竞业限制', subtitle: '跳槽的法律边界', content: '签署竞业协议的员工，在离职后 2 年内不得入职竞争对手公司，也不得自行创立对标企业。企业将按月支付补偿金。', bg: 'from-slate-900 to-zinc-800' },
            { id: 's3', title: '违反竞业协议的代价', subtitle: '违约金与法律责任', content: '一经查实违反协议，企业有权要求员工返还所有补偿金，并按协议约定支付高额违约金（通常为年薪的 3-5 倍）。', bg: 'from-red-900 to-rose-900' }
        ]
    },
    {
        id: 'p4',
        name: '标准合同库：劳动合同与表单',
        type: 'page',
        description: '一键可用的法务审核版文档，覆盖员工全生命周期。',
        blocks: [
            { type: 'quote', text: '模板已根据 2026 最新劳动法司法解释及当地裁审口径完成动态更新。' },
            {
                type: 'grid',
                hasActions: true,
                items: [
                    { title: '📑 标准劳动合同 (V2.1)', desc: '增加了对调岗降薪、末位淘汰、保密要求的合法表述。' },
                    { title: '📝 员工入职登记表', desc: '加入了对过往病史、竞业限制情况的承诺声明，为后续合规辞退打下基础。' },
                    { title: '📄 解除劳动关系协议', desc: '明确了经济补偿金结算及后续配合义务，实现“好聚好散”。' }
                ]
            }
        ]
    },
    {
        id: 'p_resources',
        name: '资料下载',
        type: 'resources',
        description: 'handbook 的资料下载模块，承接附件、模板和标准交付物。',
        blocks: []
    }
];

export const initialGlobalConfigs = [
    {
        id: 'gc_style',
        type: 'style',
        name: '全局风格配置',
        description: '统一控制 living handbook 的名称、标识和视觉系统，不承载模块内容。',
        scopes: ['Visual System', 'Shell'],
        sections: [
            {
                id: 'identity',
                title: '名称与标识',
                description: '只定义 handbook 的基础标识，不承载模块内容。',
                fields: [
                    { id: 'siteName', label: 'Handbook 名称', kind: 'text', description: '用于全局品牌识别。' },
                    { id: 'siteIcon', label: '图标字符', kind: 'text', description: '用于顶部和预览中的品牌符号，例如 FH。' }
                ]
            },
            {
                id: 'visualStyle',
                title: '视觉系统',
                description: '这些参数只定义 handbook 壳层风格，不负责重算模块内容。',
                fields: [
                    {
                        id: 'themeTone',
                        label: '主色基调',
                        kind: 'select',
                        description: '切换站点核心强调色与整体氛围。',
                        options: [
                            { value: 'brand', label: '品牌蓝' },
                            { value: 'slate', label: '专业灰' },
                            { value: 'emerald', label: '增长绿' }
                        ]
                    },
                    { id: 'primaryColor', label: '主色', kind: 'color', description: '主要强调色，用于按钮、高亮和品牌重点。' },
                    { id: 'secondaryColor', label: '辅助色', kind: 'color', description: '用于渐变、氛围层和辅助高亮。' },
                    { id: 'accentColor', label: '强调色', kind: 'color', description: '用于标签、选中态和局部点缀。' },
                    {
                        id: 'fontFamily',
                        label: '字体气质',
                        kind: 'select',
                        description: '控制整个 preview 页的字形气质。',
                        options: [
                            { value: 'modern', label: '现代无衬线' },
                            { value: 'editorial', label: '编辑部衬线' },
                            { value: 'balanced', label: '理性混合' }
                        ]
                    },
                    {
                        id: 'surfaceStyle',
                        label: '页面质感',
                        kind: 'select',
                        description: '控制模块区块和资料卡片的表面质感。',
                        options: [
                            { value: 'glass', label: '玻璃卡片' },
                            { value: 'solid', label: '纯白卡片' },
                            { value: 'editorial', label: '手册质感' }
                        ]
                    },
                    {
                        id: 'backgroundMood',
                        label: '背景氛围',
                        kind: 'select',
                        description: '控制背景光晕和页面空气感。',
                        options: [
                            { value: 'calm', label: '克制平稳' },
                            { value: 'dynamic', label: '流动科技感' },
                            { value: 'editorial', label: '安静阅读感' }
                        ]
                    },
                    {
                        id: 'layoutDensity',
                        label: '版面密度',
                        kind: 'select',
                        description: '控制壳层页面的留白和模块占位节奏。',
                        options: [
                            { value: 'spacious', label: '宽松留白' },
                            { value: 'balanced', label: '均衡' },
                            { value: 'compact', label: '紧凑' }
                        ]
                    },
                    { id: 'supplementalRequirements', label: '补充要求', kind: 'textarea', description: '额外风格约束，供 AI 生成 handbook 壳层时参考。' }
                ]
            }
        ],
        aiSuggestions: [
            '把整个 handbook 调成更稳重、更像专业交付手册的风格。',
            '弱化销售感，让字体和卡片质感更像客户 onboarding 手册。',
            '把整体色彩做得更克制，留白更松一点。'
        ],
        values: {
            siteName: 'Living Handbook',
            siteIcon: 'FH',
            themeTone: 'brand',
            primaryColor: '#2563eb',
            secondaryColor: '#4f46e5',
            accentColor: '#0f172a',
            fontFamily: 'balanced',
            surfaceStyle: 'glass',
            backgroundMood: 'dynamic',
            layoutDensity: 'balanced',
            supplementalRequirements: '整体保持专业、克制、可信的 living handbook 质感，避免太强的营销叫卖感。'
        }
    },
    {
        id: 'gc_ai',
        type: 'ai',
        name: 'AI助理配置',
        description: '配置 Copilot 的身份、欢迎语、推荐提问、路由策略与运营洞察口径。',
        scopes: ['Copilot', 'Operate', 'Routing'],
        sections: [
            {
                id: 'identity',
                title: 'Copilot 身份',
                description: '定义预览页右侧 AI 助手的基础设定。',
                fields: [
                    { id: 'assistantName', label: '助手名称', kind: 'text', description: 'Copilot 面板标题。' },
                    { id: 'assistantTagline', label: '助手副标题', kind: 'text', description: '助手定位说明。' },
                    { id: 'welcomeMessage', label: '欢迎语', kind: 'textarea', description: '首次打开时的第一条欢迎消息。' },
                    { id: 'inputPlaceholder', label: '输入框占位文案', kind: 'text', description: '访客输入框提示文案。' },
                    {
                        id: 'responseTone',
                        label: '回答策略',
                        kind: 'select',
                        description: '决定 Copilot 默认的回应风格。',
                        options: [
                            { value: 'advisor', label: '顾问式' },
                            { value: 'proactive', label: '主动引导式' },
                            { value: 'teaching', label: '讲解式' }
                        ]
                    }
                ]
            },
            {
                id: 'actions',
                title: '推荐提问',
                description: '定义 Copilot 面板底部的快捷提问按钮。',
                fields: [
                    { id: 'quickActionAssessment', label: '快捷问题 1', kind: 'text', description: '默认用于引导到诊断问卷。' },
                    { id: 'quickActionContract', label: '快捷问题 2', kind: 'text', description: '默认用于引导到合同/资料模块。' },
                    { id: 'quickActionRisk', label: '快捷问题 3', kind: 'text', description: '默认用于引导到风险视频模块。' }
                ]
            }
        ],
        aiSuggestions: [
            '让 Copilot 更主动一点，优先引导用户做诊断并进入高价值模块。',
            '把欢迎语改成更专业、审慎、顾问式的表达。',
            '强化运营洞察口径，让团队一眼看出高意向用户在问什么。'
        ],
        values: {
            assistantName: '法务 AI 顾问',
            assistantTagline: '主动识别访客意图并引导到最合适的模块',
            welcomeMessage: '你好！我是您的法务AI顾问。咱们目前对法务这块的需求主要是哪方面呢？咨询、合同还是用工合规呀？',
            inputPlaceholder: '描述您的企业法务痛点或咨询问题...',
            responseTone: 'advisor',
            quickActionAssessment: '进行企业财税健康自测',
            quickActionContract: '有没有标准的劳动合同附件？',
            quickActionRisk: '辞退员工有哪些败诉风险？',
            assessmentModuleId: 'p1',
            contractModuleId: 'p4',
            riskVideoModuleId: 'p2',
            resourcesModuleId: 'p_resources',
            insightsTitle: 'Copilot 访客意图深度分析',
            painPointHeadline: '企业最关心：“违法解除”与“赔偿标准”',
            painPointSummary: '数据洞察表明，高达 42% 的高意向访客在与 Copilot 聊天的过程中，曾多次抛出具有强烈避险诉求的问题。'
        }
    }
];
