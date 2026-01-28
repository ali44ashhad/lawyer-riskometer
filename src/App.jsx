import { useState, useEffect } from "react";

const dpdpQuestions = [
    {
        id: 1,
        question: "What best describes your organization?",
        description: "DPDP Act has specific obligations based on organization size and type.",
        options: [
            "Individual / Freelancer",
            "Startup  ",
            "SME / Private Company",
            "Large Enterprise ",
            "Foreign Company processing Indian data",
        ],
        weights: [2, 3, 5, 7, 9], // Higher weight = higher compliance burden (scaled so total max = 100)
        dpdpRelevance: "Data Fiduciary classification varies by size"
    },
    {
        id: 2,
        question: "Industry vertical?",
        description: "Sector-specific compliance requirements under DPDP Act.",
        options: [
            "IT / SaaS ",
            "E-commerce  ",
            "Healthcare  ",
            "Finance / FinTech ",
            "Education ",
            "Marketing / Advertising  ",
            "Other"
        ],
        weights: [7, 7, 9, 9, 5, 7, 3], // Healthcare/FinTech highest risk (scaled to max 100)
        dpdpRelevance: "Healthcare/FinTech have additional sectoral regulations"
    },
    {
        id: 3,
        question: "Do you collect personal data of individuals in India?",
        description: "DPDP Act applies if you process any personal data of individuals in India.",
        options: [
            "Yes ",
            "No "
        ],
        weights: [9, 5, 0, 3],
        dpdpRelevance: "Determines applicability of entire Act"
    },
    {
        id: 4,
        question: "What type of data do you collect?",
        description: "Higher penalties for sensitive personal data breaches.",
        options: [
            "Name, email, phone number",
            "Address, ID proof, KYC data",
            "Financial data",
            "Health/medical data",
            "Children's data (under 18)",
            "Sensitive Personal data"
        ],
        weights: [2, 5, 9, 9, 9, 7],
        dpdpRelevance: "Sections 8(7) & 9 - Higher protection for sensitive data"
    },
    {
        id: 5,
        question: "Do you obtain explicit user consent before collecting data?",
        description: "DPDP Act requires clear, itemized consent with withdrawal option.",
        options: [
            "Yes ",
            "No",
            "Not sure"
        ],
        weights: [0, 3, 7, 8],
        dpdpRelevance: "Section 6 - Valid consent is mandatory"
    },
    {
        id: 6,
        question: "Do you have a clear privacy policy available to users?",
        description: "Must specify purpose, retention, rights in clear language.",
        options: [
            "Yes ",
            "No" 
        ],
        weights: [0, 3, 8, 5],
        dpdpRelevance: "Section 5 - Notice requirements"
    },
    {
        id: 7,
        question: "Can users withdraw consent easily?",
        description: "Must enable access, correction, erasure, grievance redressal.",
        options: [
            "Yes ", 
            "No" 
        ],
        weights: [0, 3, 7, 8],
        dpdpRelevance: "Chapter III - Rights of Data Principals"
    },
    {
        id: 8,
        question: "Do you store personal data on:",
        description: "Cross-border transfer rules apply under DPDP Act.",
        options: [
            "Indian servers",
            " Foreign servers",
            "Both" 
        ],
        weights: [2, 3, 5, 8],
        dpdpRelevance: "Section 16 - Cross-border data transfers"
    },
    {
        id: 9,
        question: "Have you implemented reasonable security safeguards?",
        description: "Reasonable security practices mandatory to prevent breaches.",
        options: [
            "Yes ", 
            "No",
            "Not sure"
        ],
        weights: [0, 3, 7, 8],
        dpdpRelevance: "Section 8(5) - Security safeguards obligation"
    },
    {
        id: 10,
        question: "Do you have a process to report data breaches?",
        description: "72-hour breach notification mandatory to DPA & affected individuals.",
        options: [
            "Yes ", 
            "No" 
        ],
        weights: [0, 3, 7, 8],
        dpdpRelevance: "Section 8(6) - Breach notification requirements"
    },
    {
        id: 11,
        question: "Can users:",
        description: "Significant Data Fiduciaries must appoint DPO.",
        options: [
            "Access their data",
            "Request correction or deletion",
            " Nominate a representative" 
        ],
        weights: [0, 3, 7, 8],
        dpdpRelevance: "Section 10 - Data Protection Officer"
    },
    {
        id: 12,
        question: "Have you appointed a Data Protection Officer (DPO) (if applicable)?",
        description: "Existing frameworks may need DPDP alignment.",
        options: [
            "Yes ",
            "No" 
        ],
        weights: [2, 2, 5, 8],
        dpdpRelevance: "DPDP has unique India-specific requirements"
    }
];

 

export default function DPDPSmartCalculator() {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [riskResult, setRiskResult] = useState(null);
    const [showSegmentSolutions, setShowSegmentSolutions] = useState(false);

    const handleAnswer = (option, questionIndex) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = {
            answer: option,
            weight: dpdpQuestions[questionIndex].weights[dpdpQuestions[questionIndex].options.indexOf(option)]
        };
        setAnswers(newAnswers);
        
        if (questionIndex < dpdpQuestions.length - 1) {
            setStep(questionIndex + 1);
        } else {
            calculateDPDPRisk(newAnswers);
        }
    };

    const calculateDPDPRisk = (allAnswers) => {
        if (allAnswers.length !== dpdpQuestions.length) return;
        
        let totalScore = 0;
        let maxPossibleScore = 0;
        const criticalFlags = [];
        const recommendations = [];
        
        allAnswers.forEach((ans, idx) => {
            const question = dpdpQuestions[idx];
            const weight = ans.weight;
            
            totalScore += weight;
            maxPossibleScore += Math.max(...question.weights);
            
            // Flag critical issues (threshold scaled to 100: 4 * 100/59 ≈ 7)
            if (weight >= 7) {
                criticalFlags.push({
                    question: question.question,
                    answer: ans.answer,
                    risk: "HIGH",
                    section: question.dpdpRelevance
                });
            }
            
            // Generate recommendations (threshold scaled to 100: 2 * 100/59 ≈ 3)
            if (weight > 3) {
                recommendations.push(`Fix: ${question.question} - Current: "${ans.answer}"`);
            }
        });
        
        // Calculate risk percentage (weights already scaled to max 100)
        const riskPercentage = (totalScore / maxPossibleScore) * 100;
        
        let riskCategory;
        let nextSteps;
        
        if (riskPercentage <= 25) {
            riskCategory = {
                level: "🟢 LOW RISK",
                color: "bg-green-100 border-green-500 text-green-800",
                description: "Broadly compliant but needs documentation review",
                penaltyRisk: "Low (₹10-50 lakhs for minor violations)"
            };
            nextSteps = ["Annual audit", "Employee refresher training"];
        } else if (riskPercentage <= 50) {
            riskCategory = {
                level: "🟡 MODERATE RISK",
                color: "bg-yellow-100 border-yellow-500 text-yellow-800",
                description: "Significant compliance gaps requiring immediate attention",
                penaltyRisk: "Medium (Up to ₹200 crores for breaches)"
            };
            nextSteps = ["90-day remediation plan", "DPO appointment", "Security audit"];
        } else {
            riskCategory = {
                level: "🔴 HIGH RISK",
                color: "bg-red-100 border-red-500 text-red-800",
                description: "Critical non-compliance - Enforcement action likely",
                penaltyRisk: "High (Up to ₹250 crores + business suspension)"
            };
            nextSteps = ["Immediate legal intervention", "Board-level review", "Regulatory engagement"];
        }
        
        setRiskResult({
            score: Math.round(totalScore),
            maxScore: Math.round(maxPossibleScore),
            percentage: riskPercentage.toFixed(1),
            category: riskCategory,
            criticalFlags,
            recommendations: recommendations.slice(0, 5),
            nextSteps,
            segment: determineClientSegment(allAnswers)
        });
        
        setShowSegmentSolutions(true);
    };

    const determineClientSegment = (answers) => {
        const orgType = answers[0]?.answer;
        if (orgType?.includes("Startup")) return "startup";
        if (orgType?.includes("Large Enterprise")) return "corporate";
        if (orgType?.includes("Foreign")) return "hnwi";
        return "sme";
    };

    const resetAssessment = () => {
        setStep(0);
        setAnswers([]);
        setRiskResult(null);
        setShowSegmentSolutions(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Section with Clear Positioning */}
            <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                            <span className="text-white text-sm font-semibold">Bijender Singh & Associates</span>
                            <span className="ml-2 px-2 py-1 bg-blue-600 rounded-full text-xs text-white">Est. 2010</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                            India's Premier <span className="text-blue-300">Tech Law</span> Firm
                        </h1>
                        
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
                            Specializing in DPDP Act 2023 compliance, breach prevention, 
                            and tech litigation. Protecting startups to Fortune 500 companies 
                            from ₹250 crore penalties.
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-4">
                            <a href="/" className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg">
                               Free Compliance Check
                            </a>
                            <a href="/" className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl font-bold text-lg">
                              Emergency Legal Support
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trust Bar */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-2xl font-bold text-blue-700">250+</div>
                            <div className="text-sm text-gray-600">Clients Protected</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-700">0</div>
                            <div className="text-sm text-gray-600">Major Breaches for Clients</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-700">15+</div>
                            <div className="text-sm text-gray-600">Years Tech Law Experience</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-700">24/7</div>
                            <div className="text-sm text-gray-600">Breach Response Team</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calculator Section */}
            <div id="calculator" className="max-w-6xl mx-auto px-4 py-16">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            DPDP Act 2023 Compliance Assessment
                        </h2>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-600">Question {step + 1} of {dpdpQuestions.length}</span>
                            <span className="text-blue-600 font-bold">
                                {step + 1}/{dpdpQuestions.length}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-700 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${((step + 1) / dpdpQuestions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {riskResult ? (
                        <div className="space-y-8">
                            {/* Risk Score Card */}
                            <div className={`border-2 rounded-xl p-8 ${riskResult.category.color}`}>
                                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-3xl font-bold mb-2">{riskResult.category.level}</h3>
                                        <p className="text-lg">{riskResult.category.description}</p>
                                    </div>
                                    <div className="mt-4 md:mt-0">
                                        <div className="text-4xl font-bold">{riskResult.score}/{riskResult.maxScore}</div>
                                        <div className="text-center">{riskResult.percentage}% Risk Level</div>
                                    </div>
                                </div>
                                
                                <div className="bg-white/50 rounded-lg p-4 mb-4">
                                    <div className="font-bold text-red-600 mb-2">⚠️ Penalty Exposure:</div>
                                    <p>{riskResult.category.penaltyRisk}</p>
                                </div>
                            </div>

                            {/* Critical Issues */}
                            {riskResult.criticalFlags.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                                    <h4 className="text-xl font-bold text-red-700 mb-4">🚨 Critical Compliance Gaps</h4>
                                    <ul className="space-y-3">
                                        {riskResult.criticalFlags.slice(0, 3).map((flag, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <span className="text-red-500 mr-2">•</span>
                                                <div>
                                                    <span className="font-semibold">{flag.question}</span>
                                                    <div className="text-gray-700">Current: {flag.answer}</div>
                                                    <div className="text-sm text-gray-500">{flag.section}</div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Segment-Specific Solutions */}
                            {showSegmentSolutions && (
                                <div id="solutions" className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                        Tailored Solutions for Your Organization
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="font-bold text-lg mb-4 text-blue-700">🚀 Immediate Actions Required</h4>
                                            <ul className="space-y-3">
                                                {riskResult.nextSteps.map((step, idx) => (
                                                    <li key={idx} className="flex items-center">
                                                        <span className="text-green-500 mr-3">✓</span>
                                                        {step}
                                                    </li>
                                                ))}
                                            </ul>
                                            
                                            <div className="mt-8">
                                                <button
                                                    onClick={resetAssessment}
                                                    className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition"
                                                >
                                                    Start New Assessment
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h4 className="font-bold text-lg mb-4 text-blue-700">🛡️ Our Protection Package</h4>
                                            <div className="space-y-4">
                                                <div className="bg-white p-4 rounded-lg border border-blue-200">
                                                    <div className="font-bold mb-2">Pre-Breach Prevention</div>
                                                    <div className="text-sm text-gray-600">
                                                        Compliance audits • Privacy by design • Employee training
                                                    </div>
                                                </div>
                                                <div className="bg-white p-4 rounded-lg border border-blue-200">
                                                    <div className="font-bold mb-2">24/7 Breach Response</div>
                                                    <div className="text-sm text-gray-600">
                                                        Emergency legal team • Regulatory liaison • Forensic support
                                                    </div>
                                                </div>
                                                <div className="bg-white p-4 rounded-lg border border-blue-200">
                                                    <div className="font-bold mb-2">Litigation Defense</div>
                                                    <div className="text-sm text-gray-600">
                                                        Tribunal representation • Settlement negotiation • Appeals
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    {dpdpQuestions[step].question}
                                </h3>
                                
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dpdpQuestions[step].options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(option, step)}
                                        className="text-left p-6 rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                    >
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 group-hover:bg-blue-100 text-gray-700 group-hover:text-blue-700 font-bold mr-4">
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 group-hover:text-blue-800">
                                                    {option}
                                                </div>
                                                
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Talent Attraction Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-xl p-10">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                            For <span className="text-blue-700">Young Legal Talent</span>
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            <div className="text-center p-6">
                                <div className="text-4xl mb-4">🤖</div>
                                <h4 className="font-bold text-xl mb-3">Tech-Law Innovation</h4>
                                <p className="text-gray-600">
                                    Work with AI legal tools, blockchain evidence, and automated compliance systems
                                </p>
                            </div>
                            <div className="text-center p-6">
                                <div className="text-4xl mb-4">🌐</div>
                                <h4 className="font-bold text-xl mb-3">Global Exposure</h4>
                                <p className="text-gray-600">
                                    Handle cross-border data transfers and international privacy frameworks
                                </p>
                            </div>
                            <div className="text-center p-6">
                                <div className="text-4xl mb-4">🚀</div>
                                <h4 className="font-bold text-xl mb-3">Rapid Growth</h4>
                                <p className="text-gray-600">
                                    Fast-track to partnership with India's fastest-growing tech law practice
                                </p>
                            </div>
                        </div>
                        
                         
                    </div>
                </div>
            </div>

            {/* Client Success Stories */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                    Protecting India's Digital Economy
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                        <div className="text-blue-600 text-2xl mb-4">🏦</div>
                        <h4 className="font-bold text-xl mb-3">Leading FinTech</h4>
                        <p className="text-gray-600 mb-4">
                            Successfully defended against ₹150 crore data breach claim
                        </p>
                        <div className="text-sm text-blue-700 font-medium">Saved: ₹145+ Crores</div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                        <div className="text-blue-600 text-2xl mb-4">🏥</div>
                        <h4 className="font-bold text-xl mb-3">HealthTech Unicorn</h4>
                        <p className="text-gray-600 mb-4">
                            DPDP compliance achieved before Series C funding
                        </p>
                        <div className="text-sm text-blue-700 font-medium">Enabled: $50M Funding</div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                        <div className="text-blue-600 text-2xl mb-4">🛒</div>
                        <h4 className="font-bold text-xl mb-3">E-commerce Giant</h4>
                        <p className="text-gray-600 mb-4">
                            Global data transfer framework for 10M+ users
                        </p>
                        <div className="text-sm text-blue-700 font-medium">Protected: 10M+ Users</div>
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 py-20">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready for DPDP Act 2026?
                    </h2>
                    <p className="text-xl text-blue-100 mb-10">
                        With enforcement strengthening in 2026, now is the time to ensure 
                        complete compliance and avoid catastrophic penalties.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <a href="/" className="bg-white text-blue-900 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition">
                            Get Comprehensive Audit
                        </a>
                        <a href="/" className="bg-blue-700 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-800 transition">
                            DPO-as-a-Service
                        </a>
                        <a href="/" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition">
                            Litigation Readiness Check
                        </a>
                    </div>
                    
                    <div className="mt-12 pt-8 border-t border-white/20">
                        <p className="text-blue-200">
                            <span className="font-bold">Bijender Singh & Associates</span> | 
                            India's Tech Law Specialists | DPDP Act Pioneers | 
                            Breach Prevention Experts | Litigation Leaders
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}