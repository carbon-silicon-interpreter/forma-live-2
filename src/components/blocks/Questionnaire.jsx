import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, DownloadCloud, Activity, LayoutTemplate } from 'lucide-react';

const Questionnaire = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [showResult, setShowResult] = useState(false);

    const questions = [
        {
            id: 'q1',
            title: '发票处理情况',
            desc: '您的企业日常支出中，获取正规发票的情况是怎样的？',
            options: [
                { id: 'a', label: '基本都有正规发票，且抬头信息完整准确' },
                { id: 'b', label: '部分支出无法取得发票，或有时使用白条入账' },
                { id: 'c', label: '经常存在大量无票支出，报销发票较乱' }
            ]
        },
        {
            id: 'q2',
            title: '公私账户往来',
            desc: '企业日常经营款项收付，是否存在使用个人账户的情况？',
            options: [
                { id: 'a', label: '严格公私分明，所有业务往来均通过对公账户' },
                { id: 'b', label: '偶尔为了方便，会用法人或股东个人账户收付款' },
                { id: 'c', label: '为了避税或方便，经常使用私人微信/支付宝/银行卡收款' }
            ]
        },
        {
            id: 'q3',
            title: '社保缴纳基数',
            desc: '员工社保和公积金的申报缴纳基数是怎样的？',
            options: [
                { id: 'a', label: '完全按照员工实际发放工资标准足额缴纳' },
                { id: 'b', label: '部分按实际缴纳，部分按最低基数缴纳' },
                { id: 'c', label: '全员或大部分员工都按当地最低基数缴纳' }
            ]
        }
    ];

    const handleAnswer = (optionId) => {
        setAnswers({ ...answers, [questions[currentStep].id]: optionId });

        if (currentStep < questions.length - 1) {
            setTimeout(() => setCurrentStep(prev => prev + 1), 300);
        } else {
            generateReport();
        }
    };

    const generateReport = () => {
        setIsGenerating(true);
        // Simulate AI generation time
        setTimeout(() => {
            setIsGenerating(false);
            setShowResult(true);
            if (onComplete) onComplete(answers);
        }, 1500);
    };

    if (showResult) {
        return (
            <div className="w-full bg-white/80 backdrop-blur-xl p-10 md:p-16 rounded-[48px] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-white flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <CheckCircle2 size={40} />
                </div>
                <h3 className="text-3xl font-black text-zinc-900 mb-4">企业财税健康诊断报告已生成</h3>
                <p className="text-zinc-500 mb-8 max-w-lg">
                    基于您的作答，AI 已为您出具专属的财税内控优化方案。报告中详细指出了潜在的税务风险点及合规路径。
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                        <DownloadCloud size={20} />
                        下载完整诊断报告 (PDF)
                    </button>
                    <button
                        onClick={() => {
                            setShowResult(false);
                            setCurrentStep(0);
                            setAnswers({});
                        }}
                        className="flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-8 py-4 rounded-full font-bold transition-all"
                    >
                        重新自测
                    </button>
                </div>
            </div>
        );
    }

    if (isGenerating) {
        return (
            <div className="w-full bg-white/80 backdrop-blur-xl p-16 rounded-[48px] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-white flex flex-col items-center justify-center min-h-[400px]">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                        <Activity size={32} />
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-2">AI 正在生成专属报告...</h3>
                <p className="text-zinc-500">正在对比全国最新财税政策库及同行业案例</p>
            </div>
        );
    }

    const currentQ = questions[currentStep];

    return (
        <div className="w-full bg-white/90 backdrop-blur-xl overflow-hidden rounded-[48px] shadow-[0_12px_60px_rgba(0,0,0,0.05)] border border-white flex flex-col">
            {/* Header/Progress */}
            <div className="px-10 py-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
                        {currentStep + 1}
                    </div>
                    <div>
                        <h4 className="font-bold text-zinc-900 text-lg">财税风险排查</h4>
                        <p className="text-xs text-zinc-500 font-medium">问题 {currentStep + 1} / {questions.length}</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    {questions.map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-blue-600' :
                                    i < currentStep ? 'w-4 bg-blue-300' : 'w-4 bg-zinc-200'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Content Array */}
            <div className="p-10 md:p-14 flex-1 flex flex-col">
                <div className="mb-10">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 mb-4 leading-tight">
                        {currentQ.title}
                    </h2>
                    <p className="text-lg text-zinc-500 font-medium">
                        {currentQ.desc}
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    {currentQ.options.map((opt) => {
                        const isSelected = answers[currentQ.id] === opt.id;
                        return (
                            <button
                                key={opt.id}
                                onClick={() => handleAnswer(opt.id)}
                                className={`w-full text-left p-6 rounded-2xl border-2 transition-all group flex items-center justify-between ${isSelected
                                        ? 'border-blue-600 bg-blue-50/50 shadow-md transform scale-[1.01]'
                                        : 'border-zinc-100 hover:border-blue-200 hover:bg-zinc-50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-zinc-300 group-hover:border-blue-400'
                                        }`}>
                                        {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                                    </div>
                                    <span className={`text-lg font-medium ${isSelected ? 'text-blue-900' : 'text-zinc-700'}`}>
                                        {opt.label}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-12 flex items-center justify-between">
                    <button
                        onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                        disabled={currentStep === 0}
                        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold disabled:opacity-30 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        上一题
                    </button>
                    {/* The next/submit is handled implicitly by selection, but we could add manual Next here if multi-select */}
                </div>
            </div>
        </div>
    );
};

export default Questionnaire;
