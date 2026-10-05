import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  ecosystemApi,
  SkillGraphItem,
  SkillAssessmentItem,
} from '../../services/ecosystemApi';

export const SkillAssessmentsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assessments' | 'graph' | 'history'>('assessments');

  const [graphNodes, setGraphNodes] = useState<SkillGraphItem[]>([]);
  const [assessments, setAssessments] = useState<SkillAssessmentItem[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Assessment Test Session
  const [activeTest, setActiveTest] = useState<SkillAssessmentItem | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [testResult, setTestResult] = useState<{
    scorePercent: number;
    passed: boolean;
    badgeAwarded?: any;
  } | null>(null);
  const [submittingTest, setSubmittingTest] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gRes, aRes, sRes] = await Promise.all([
        ecosystemApi.getSkillGraph(),
        ecosystemApi.listSkillAssessments(),
        ecosystemApi.getMySubmissions(),
      ]);

      if (gRes.success) setGraphNodes(gRes.graph || []);
      if (aRes.success) setAssessments(aRes.assessments || []);
      if (sRes.success) setSubmissions(sRes.submissions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = (assessment: SkillAssessmentItem) => {
    setActiveTest(assessment);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTestResult(null);
  };

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleFinishTest = async () => {
    if (!activeTest) return;
    setSubmittingTest(true);
    try {
      const res = await ecosystemApi.submitSkillAssessment(activeTest.id, selectedAnswers);
      if (res.success) {
        setTestResult({
          scorePercent: res.scorePercent,
          passed: res.passed,
          badgeAwarded: res.badgeAwarded,
        });
        loadData(); // Refresh submissions
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-2xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-500/30">
            <Award className="w-3.5 h-3.5" />
            Verified Skill Assessments & Skill Graph
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mb-2">
            Skill Certifications & Market Radar
          </h1>
          <p className="text-gray-300 text-sm lg:text-base leading-relaxed">
            Validate your technical proficiency through standardized tests to earn permanent verified badges, boost proposal rank in client search algorithms, and explore real-time rate benchmarks.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-2">
        <button
          onClick={() => {
            setActiveTab('assessments');
            setActiveTest(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'assessments'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Skill Tests & Badges ({assessments.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('graph');
            setActiveTest(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'graph'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Marketplace Skill Graph ({graphNodes.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('history');
            setActiveTest(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Award className="w-4 h-4" />
          My Verified Certificates ({submissions.filter((s) => s.passed).length})
        </button>
      </div>

      {/* ACTIVE TEST RUNNER */}
      {activeTest && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm">
          {!testResult ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <span className="px-2.5 py-0.5 text-xs bg-emerald-50 text-emerald-700 font-bold rounded-full">
                    {activeTest.skillName} • {activeTest.level}
                  </span>
                  <h2 className="text-lg font-bold text-gray-900 mt-1">{activeTest.title}</h2>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Question {currentQuestionIndex + 1} of {activeTest.questions.length}
                </div>
              </div>

              {/* Question display */}
              {activeTest.questions[currentQuestionIndex] && (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900">
                    {activeTest.questions[currentQuestionIndex].question}
                  </h3>

                  <div className="space-y-2.5">
                    {activeTest.questions[currentQuestionIndex].options.map((opt, idx) => {
                      const qId = activeTest.questions[currentQuestionIndex].id;
                      const isSelected = selectedAnswers[qId] === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectAnswer(qId, idx)}
                          className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50/60 text-emerald-900 font-semibold ring-2 ring-emerald-100'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40"
                >
                  Previous
                </button>

                {currentQuestionIndex < activeTest.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submittingTest}
                    onClick={handleFinishTest}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-bold shadow-sm"
                  >
                    {submittingTest ? 'Grading Assessment...' : 'Submit & Grade Test'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="py-8 text-center max-w-md mx-auto space-y-4">
              {testResult.passed ? (
                <>
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Assessment Passed!</h3>
                  <p className="text-sm text-gray-600">
                    You scored <strong className="text-emerald-700">{testResult.scorePercent}%</strong> (Threshold: {activeTest.passScorePercent}%).
                  </p>
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Badge Awarded</p>
                    <p className="text-sm font-bold text-emerald-900">{activeTest.badgeName}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <RotateCcw className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Passing Score Not Met</h3>
                  <p className="text-sm text-gray-600">
                    You scored <strong className="text-red-600">{testResult.scorePercent}%</strong>. The required passing score is {activeTest.passScorePercent}%.
                  </p>
                </>
              )}

              <button
                onClick={() => setActiveTest(null)}
                className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all mt-4"
              >
                Back to Assessments Directory
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: ASSESSMENTS DIRECTORY */}
      {activeTab === 'assessments' && !activeTest && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((test) => {
              const alreadyPassed = submissions.some(
                (s) => s.assessmentId === test.id && s.passed
              );
              return (
                <div
                  key={test.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between hover:shadow-lg transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 text-xs bg-emerald-50 text-emerald-700 font-bold rounded-full">
                        {test.skillName}
                      </span>
                      <span className="text-xs text-gray-400 font-semibold">{test.durationMinutes} mins</span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mb-1">{test.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-3 mb-4">{test.description}</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 mb-4">
                      <span>{test.questionsCount} Questions</span>
                      <span>Pass: {test.passScorePercent}%</span>
                    </div>

                    {alreadyPassed ? (
                      <div className="w-full py-2.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" />
                        Badge Earned
                      </div>
                    ) : (
                      <button
                        onClick={() => startAssessment(test)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Take Assessment
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SKILL GRAPH & MARKET RATE RADAR */}
      {activeTab === 'graph' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Market Demand & Hourly Rate Benchmarks</h2>
            <p className="text-sm text-gray-500 mb-6">
              Live market intelligence computed across 10,000+ completed contract milestones and active hiring proposals.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {graphNodes.map((node) => (
                <div key={node.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-gray-900 text-sm">{node.name}</h3>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded">
                      ${node.averageHourlyRate}/hr
                    </span>
                  </div>

                  <p className="text-xs text-gray-500">{node.category}</p>

                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1 font-medium">
                      <span>Demand Score</span>
                      <span className="font-bold text-emerald-600">{node.demandScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-emerald-600 h-1.5 rounded-full"
                        style={{ width: `${node.demandScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Related</p>
                    <div className="flex flex-wrap gap-1">
                      {node.relatedSkills.slice(0, 3).map((r) => (
                        <span key={r} className="px-1.5 py-0.5 bg-white text-gray-600 rounded text-[10px] border">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CERTIFICATES HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {submissions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900">No assessment submissions yet</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
                Complete assessments to earn verified skill badges that appear on your public profile and proposal bids.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="divide-y divide-gray-100">
                {submissions.map((sub) => (
                  <div key={sub.id} className="p-5 flex items-center justify-between gap-4 hover:bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          sub.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {sub.passed ? <CheckCircle2 className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{sub.skillName} Assessment</h4>
                        <p className="text-xs text-gray-500">Completed on {new Date(sub.completedAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full ${
                          sub.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {sub.passed ? `Passed (${sub.scorePercent}%)` : `Failed (${sub.scorePercent}%)`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
