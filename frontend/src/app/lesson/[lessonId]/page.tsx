// src/app/lesson/[lessonId]/page.tsx — Duolingo Lesson Player (Pixel-Perfect & Fully Connected)
//
// Matches Duolingo's signature lesson interface exactly:
//   - Top bar: Exit ✕, progress bar, SINGLE red heart icon with number (e.g. ❤️ 5)
//   - Exercise 1 Multiple Choice: Clear selection, high-contrast Red (wrong) vs Green (correct) states
//   - Fill in the Blank: Displays sentence template with styled blank indicator filled in real-time
//   - Answer Payload Fix: Correctly sends selectedAnswer || typedAnswer for fill_blank exercises
//   - Word bank: Tappable chips with placeholder slots [   ] left in the bank
//   - Correct feedback: Dark green sheet, circular green checkmark icon, "Great!", sub-actions, "CONTINUE" CTA button
//   - Incorrect feedback: Dark red sheet with revealed answer
//   - Secure attempt-based server tracking (POST /start, /check-answer, /complete)

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { lessonApi, userApi } from "@/lib/api";
import { DuoMascot } from "@/components/DuoMascot";
import { HeartIcon } from "@/components/HeartIcon";
import { GemIcon } from "@/components/GemIcon";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Exercise {
  id: number;
  lesson_id: number;
  order: number;
  type: string;
  prompt: string;
  data: Record<string, unknown>;
  correct_answer: null;
}

interface LessonData {
  id: number;
  skill_id: number;
  order: number;
  type: string;
  exercises: Exercise[];
}

interface AnswerResult {
  correct: boolean;
  correct_answer: string | string[][] | null;
  xp_earned: number;
}

interface LessonCompleteResult {
  xp_earned: number;
  hearts_lost: number;
  passed: boolean;
  new_xp_total: number;
  new_hearts: number;
  streak_updated: boolean;
}

interface UserData {
  id: number;
  hearts: number;
  max_hearts: number;
  xp_total: number;
  gems: number;
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = Number(params.lessonId);
  const USER_ID = 1;

  // Attempt & state
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lesson progression
  const [currentIdx, setCurrentIdx] = useState(0);
  const [heartsRemaining, setHeartsRemaining] = useState(5);

  // Answer selections
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [wordBankSelected, setWordBankSelected] = useState<string[]>([]);
  const [matchSelected, setMatchSelected] = useState<{ left: string | null; right: string | null }>({ left: null, right: null });
  const [matchedPairs, setMatchedPairs] = useState<string[][]>([]);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Feedback bar
  const [feedbackState, setFeedbackState] = useState<"correct" | "incorrect" | null>(null);
  const [revealedAnswer, setRevealedAnswer] = useState<string | null>(null);

  // Modals
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showOutOfHeartsModal, setShowOutOfHeartsModal] = useState(false);
  const [completeResult, setCompleteResult] = useState<LessonCompleteResult | null>(null);
  const [showXpToast, setShowXpToast] = useState(false);

  // Load lesson & create server attempt
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        setLoading(true);
        const [lessonData, userData] = await Promise.all([
          lessonApi.getLesson(lessonId) as Promise<LessonData>,
          userApi.getUser(USER_ID) as Promise<UserData>,
        ]);

        if (!isMounted) return;

        lessonData.exercises.sort((a, b) => a.order - b.order);
        setLesson(lessonData);
        setUser(userData);
        setHeartsRemaining(userData.hearts);

        const id = await lessonApi.startLesson(lessonId, USER_ID);
        if (isMounted) setAttemptId(id);
      } catch (err: unknown) {
        if (isMounted) setError(err instanceof Error ? err.message : "Failed to load lesson");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => { isMounted = false; };
  }, [lessonId]);

  const currentExercise = lesson?.exercises[currentIdx] ?? null;

  // Enable/disable CHECK button
  const hasAnswer = (() => {
    if (!currentExercise) return false;
    switch (currentExercise.type) {
      case "multiple_choice":
        return selectedAnswer !== null;
      case "translate_word_bank":
        return wordBankSelected.length > 0;
      case "match_pairs": {
        const totalPairs = (currentExercise.data?.pairs as string[][] | undefined)?.length ?? 0;
        return totalPairs > 0 && matchedPairs.length === totalPairs;
      }
      case "fill_blank":
        if ((currentExercise.data.options as string[] | undefined)?.length) {
          return selectedAnswer !== null;
        }
        return typedAnswer.trim().length > 0;
      case "type_answer":
        return typedAnswer.trim().length > 0;
      default:
        return false;
    }
  })();

  // Helper to normalize and clean strings consistently across all exercises
  const cleanAnswerString = (str: unknown): string => {
    if (!str) return "";
    return String(str)
      .normalize("NFD")
      .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, " ") // remove zero-width & non-breaking spaces
      .replace(/\s+/g, " ")                         // collapse multiple spaces into single space
      .trim();
  };

  // Build answer payload
  const buildAnswerPayload = () => {
    if (!currentExercise || !attemptId) return null;
    const base = { exercise_id: currentExercise.id, attempt_id: attemptId };

    switch (currentExercise.type) {
      case "multiple_choice":
        return { ...base, user_answer: cleanAnswerString(selectedAnswer) };
      case "translate_word_bank": {
        const joined = wordBankSelected
          .map(w => cleanAnswerString(w))
          .filter(w => w.length > 0)
          .join(" ");
        return { ...base, user_answer: joined };
      }
      case "match_pairs": {
        const cleanedPairs = matchedPairs.map(p => [
          cleanAnswerString(p[0]),
          cleanAnswerString(p[1])
        ]);
        return { ...base, user_pairs: cleanedPairs };
      }
      case "fill_blank":
        return { ...base, user_answer: cleanAnswerString(selectedAnswer || typedAnswer) };
      case "type_answer":
        return { ...base, user_answer: cleanAnswerString(typedAnswer) };
      default:
        return null;
    }
  };
  const handleSubmit = useCallback(async () => {
    if (!hasAnswer || isSubmitted || !currentExercise || !attemptId) return;
    setIsSubmitted(true);

    const payload = buildAnswerPayload();
    if (!payload) return;

    try {
      const result = await lessonApi.checkAnswer(lessonId, payload) as AnswerResult;
      setFeedbackState(result.correct ? "correct" : "incorrect");

      if (result.correct) {
        setShowXpToast(true);
        setTimeout(() => setShowXpToast(false), 1800);
      } else {
        const newHearts = Math.max(0, heartsRemaining - 1);
        setHeartsRemaining(newHearts);

        const ca = result.correct_answer;
        if (Array.isArray(ca)) {
          setRevealedAnswer((ca as string[][]).map(p => p.join(" = ")).join(", "));
        } else {
          setRevealedAnswer(ca as string | null);
        }

        if (newHearts === 0) {
          setTimeout(() => setShowOutOfHeartsModal(true), 1200);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to check answer");
    }
  }, [
    hasAnswer,
    isSubmitted,
    currentExercise,
    attemptId,
    heartsRemaining,
    lessonId,
    wordBankSelected,
    selectedAnswer,
    matchedPairs,
    typedAnswer,
  ]);

  // Advance to next question or complete lesson
  const handleContinue = useCallback(async () => {
    if (!lesson || !attemptId) return;

    const isLastExercise = currentIdx >= lesson.exercises.length - 1;

    if (isLastExercise) {
      try {
        const result = await lessonApi.completeLesson(lessonId, USER_ID, attemptId) as LessonCompleteResult;
        setCompleteResult(result);
        setShowCompleteModal(true);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to complete lesson");
      }
    } else {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setWordBankSelected([]);
      setMatchSelected({ left: null, right: null });
      setMatchedPairs([]);
      setTypedAnswer("");
      setIsSubmitted(false);
      setFeedbackState(null);
      setRevealedAnswer(null);
    }
  }, [lesson, currentIdx, lessonId, attemptId]);

  // Enter key shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (feedbackState) handleContinue();
        else if (hasAnswer) handleSubmit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [feedbackState, hasAnswer, handleContinue, handleSubmit]);

  const totalExercises = lesson?.exercises.length ?? 0;
  const progress = totalExercises > 0 ? (currentIdx + (feedbackState ? 1 : 0)) / totalExercises : 0;

  if (loading) return <LessonLoading />;
  if (error) return <LessonError message={error} onBack={() => router.push("/path")} />;
  if (!lesson || !currentExercise) return <LessonError message="No exercises found" onBack={() => router.push("/path")} />;

  // Extract sentence for fill_blank or translate exercises
  const rawSentence = (currentExercise.data?.sentence as string | undefined) || "";

  return (
    <div className="min-h-screen bg-[#131F24] text-[#D1D8DB] flex flex-col justify-between font-sans select-none">

      {/* ── TOP BAR: Exit ✕ | Progress Bar | SINGLE Red Heart with Number ── */}
      <header className="w-full max-w-4xl mx-auto px-4 py-6 flex items-center justify-between gap-4">
        <button
          onClick={() => router.push("/path")}
          className="text-[#5A6B73] hover:text-[#D1D8DB] font-extrabold text-xl p-2 transition-colors"
          aria-label="Exit lesson"
        >
          ✕
        </button>

        <div className="flex-1 h-3.5 bg-[#37464F] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#58CC02] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <HeartIcon size={24} />
          <span className="font-extrabold text-base text-[#FF4B4B]">
            {heartsRemaining}
          </span>
        </div>
      </header>

      {/* ── XP TOAST ── */}
      {showXpToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#58CC02] text-white font-black text-sm px-4 py-2 rounded-full shadow-lg animate-bounce-in">
          +10 XP ⚡
        </div>
      )}

      {/* ── MAIN EXERCISE AREA ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 max-w-2xl mx-auto w-full pb-36">

        {/* Exercise Header & Prompt */}
        <div className="w-full mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#CE82FF]/20 text-[#CE82FF] font-black text-xs uppercase tracking-wider mb-3">
            <span>
              {currentExercise.type === "multiple_choice" ? "CHOOSE THE ANSWER" :
                currentExercise.type === "translate_word_bank" ? "TRANSLATE THIS SENTENCE" :
                  currentExercise.type === "fill_blank" ? "COMPLETE THE SENTENCE" :
                    currentExercise.type === "match_pairs" ? "MATCH PAIRS" : "TYPE IN SPANISH"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            {currentExercise.type === "translate_word_bank"
              ? "Translate this sentence"
              : currentExercise.type === "fill_blank"
                ? "Complete the sentence"
                : currentExercise.prompt}
          </h1>
        </div>

        {/* Speech Bubble for translate_word_bank exercises */}
        {currentExercise.type === "translate_word_bank" && (
          <div className="w-full flex items-start gap-4 mb-8">
            <div className="shrink-0 animate-owl-jump">
              <DuoMascot width={72} height={72} />
            </div>
            <div className="relative bg-[#1A2C32] border-2 border-[#37464F] rounded-2xl px-5 py-4 flex items-center gap-3">
              <div className="absolute -left-2 top-5 w-3 h-3 bg-[#1A2C32] border-l-2 border-b-2 border-[#37464F] rotate-45" />
              <button className="text-[#1CB0F6] hover:scale-110 transition-transform" aria-label="Play audio">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
              </button>
              <span className="font-extrabold text-xl text-white">
                {rawSentence || currentExercise.prompt}
              </span>
            </div>
          </div>
        )}

        {/* SENTENCE TEMPLATE FOR FILL_BLANK */}
        {currentExercise.type === "fill_blank" && (
          <div className="w-full mb-8">
            <div className="bg-[#1A2C32] border-2 border-[#37464F] rounded-2xl px-6 py-5 text-center shadow-lg">
              <p className="text-xl sm:text-2xl font-black text-white leading-relaxed">
                {rawSentence.includes("_____") ? (
                  rawSentence.split("_____").map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className="inline-block min-w-[90px] border-b-4 border-[#1CB0F6] mx-2 text-[#1CB0F6] font-black px-2 py-0.5 bg-[#1CB0F6]/10 rounded-t-md">
                          {selectedAnswer || typedAnswer || "_____"}
                        </span>
                      )}
                    </span>
                  ))
                ) : (
                  <span>{rawSentence || currentExercise.prompt}</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* ── EXERCISE TYPES ── */}
        {currentExercise.type === "multiple_choice" && (
          <MultipleChoiceExercise
            data={currentExercise.data as { options: string[] }}
            selected={selectedAnswer}
            onSelect={setSelectedAnswer}
            disabled={isSubmitted}
            feedbackState={feedbackState}
            correctAnswer={revealedAnswer}
          />
        )}

        {currentExercise.type === "translate_word_bank" && (
          <WordBankExercise
            data={currentExercise.data as { word_bank: string[]; sentence: string }}
            selected={wordBankSelected}
            onSelectChip={(word) => setWordBankSelected(prev => [...prev, word])}
            onRemoveChip={(index) => setWordBankSelected(prev => prev.filter((_, i) => i !== index))}
            disabled={isSubmitted}
          />
        )}



        {currentExercise.type === "match_pairs" && (
          <MatchPairsExercise
            data={currentExercise.data as { pairs: string[][] }}
            matchSelected={matchSelected}
            matchedPairs={matchedPairs}
            onSelect={(side, val) => {
              // Unmatch if clicking an already matched item
              const existingPair = matchedPairs.find(p => p.includes(val));
              if (existingPair) {
                setMatchedPairs(pairs => pairs.filter(p => p !== existingPair));
                return;
              }

              setMatchSelected(prev => {
                const next = { ...prev, [side]: val };
                if (next.left && next.right) {
                  const newPair = [next.left, next.right];
                  setMatchedPairs(pairs => {
                    const filtered = pairs.filter(p => p[0] !== next.left && p[1] !== next.right);
                    return [...filtered, newPair];
                  });
                  return { left: null, right: null };
                }
                return next;
              });
            }}
            disabled={isSubmitted}
          />
        )}
        {currentExercise.type === "fill_blank" && (
          (currentExercise.data.options as string[] | undefined)?.length ? (
            <FillBlankChoiceExercise
              options={currentExercise.data.options as string[]}
              selected={selectedAnswer}
              onSelect={(v) => { setSelectedAnswer(v); setTypedAnswer(v); }}
              disabled={isSubmitted}
              feedbackState={feedbackState}
              correctAnswer={revealedAnswer}
            />
          ) : (
            <TypeAnswerExercise
              value={typedAnswer}
              onChange={setTypedAnswer}
              disabled={isSubmitted}
              placeholder="Type the missing word..."
            />
          )
        )}

        {currentExercise.type === "type_answer" && (
          <TypeAnswerExercise
            value={typedAnswer}
            onChange={setTypedAnswer}
            disabled={isSubmitted}
            placeholder="Type in Spanish..."
          />
        )}
      </main>

      {/* ── BOTTOM FEEDBACK BAR ── */}
      <footer
        className={`fixed bottom-0 left-0 right-0 z-30 transition-colors duration-300 border-t-2 ${feedbackState === "correct"
            ? "bg-[#131F24] border-[#18392B]"
            : feedbackState === "incorrect"
              ? "bg-[#131F24] border-[#3A1B1B]"
              : "bg-[#131F24] border-[#37464F]"
          } px-6 py-5`}
      >
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {feedbackState === "correct" ? (
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-14 h-14 rounded-full bg-[#18392B] text-[#58CC02] flex items-center justify-center shrink-0 border-2 border-[#58CC02]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <div>
                <h3 className="text-xl font-black text-[#58CC02] mb-1">Great!</h3>
                <div className="flex items-center gap-4 text-xs font-extrabold text-[#5A6B73]">
                  <span className="hover:text-[#D1D8DB] cursor-pointer">z_z TOO EASY</span>
                  <span className="hover:text-[#D1D8DB] cursor-pointer">⛰️ TOO DIFFICULT</span>
                  <span className="hover:text-[#D1D8DB] cursor-pointer">🏳️ REPORT</span>
                </div>
              </div>
            </div>

          ) : feedbackState === "incorrect" ? (
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-14 h-14 rounded-full bg-[#3A1B1B] text-[#FF4B4B] flex items-center justify-center shrink-0 border-2 border-[#FF4B4B]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>

              <div>
                <h3 className="text-xl font-black text-[#FF4B4B] mb-1">Incorrect</h3>
                {revealedAnswer && (
                  <p className="text-sm font-bold text-[#FF4B4B]">
                    Correct answer: <span className="underline font-black">{revealedAnswer}</span>
                  </p>
                )}
              </div>
            </div>

          ) : (
            <div className="hidden sm:block" />
          )}

          {/* CHECK / CONTINUE CTA Button */}
          <div className="w-full sm:w-auto shrink-0">
            {feedbackState ? (
              <button
                onClick={handleContinue}
                className={`w-full sm:w-48 py-3.5 px-8 rounded-duo-xl font-black text-sm uppercase tracking-wider text-white transition-all active:scale-95 ${feedbackState === "correct"
                    ? "bg-[#58CC02] shadow-[0_4px_0_#46A302] hover:brightness-105"
                    : "bg-[#FF4B4B] shadow-[0_4px_0_#EA2B2B] hover:brightness-105"
                  }`}
              >
                CONTINUE
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!hasAnswer}
                className={`w-full sm:w-48 py-3.5 px-8 rounded-duo-xl font-black text-sm uppercase tracking-wider transition-all ${hasAnswer
                    ? "bg-[#58CC02] text-white shadow-[0_4px_0_#46A302] hover:brightness-105 active:scale-95"
                    : "bg-[#37464F] text-[#5A6B73] cursor-not-allowed border-2 border-[#37464F]"
                  }`}
              >
                CHECK
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {showCompleteModal && completeResult && (
        <LessonCompleteModal
          result={completeResult}
          onContinue={() => router.push("/path")}
        />
      )}

      {showOutOfHeartsModal && (
        <OutOfHeartsModal
          gems={user?.gems ?? 500}
          onRefill={async () => {
            try {
              await userApi.refillHearts(USER_ID);
              const updated = await userApi.getUser(USER_ID) as UserData;
              setHeartsRemaining(updated.hearts);
              setUser(updated);
              setShowOutOfHeartsModal(false);
            } catch {
              router.push("/path");
            }
          }}
          onQuit={() => router.push("/path")}
        />
      )}
    </div>
  );
}

// ─── Sub-Components (High-Contrast Feedback Styling) ───────────────────────────

function MultipleChoiceExercise({
  data, selected, onSelect, disabled, feedbackState, correctAnswer,
}: {
  data: { options: string[] };
  selected: string | null;
  onSelect: (v: string) => void;
  disabled: boolean;
  feedbackState: "correct" | "incorrect" | null;
  correctAnswer: string | null;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
      {data.options.map((option) => {
        const isSelected = option === selected;
        const isCorrectOption = feedbackState === "incorrect" && option === correctAnswer;

        let cls = "p-4.5 rounded-2xl border-2 font-extrabold text-base text-left transition-all flex items-center justify-between ";
        let badge = null;

        if (disabled) {
          if (isSelected && feedbackState === "correct") {
            // Selected right answer -> GREEN
            cls += "bg-[#18392B] border-[#58CC02] text-[#58CC02] shadow-[0_4px_0_#46A302]";
            badge = <span className="text-[#58CC02] text-xl font-black">✓</span>;
          } else if (isSelected && feedbackState === "incorrect") {
            // Selected wrong answer -> LOUD BRIGHT RED
            cls += "bg-[#FF4B4B]/20 border-[#FF4B4B] text-[#FF4B4B] shadow-[0_4px_0_#EA2B2B]";
            badge = <span className="text-[#FF4B4B] text-xl font-black">✕</span>;
          } else if (isCorrectOption) {
            // Revealed correct answer -> REVEALED GREEN
            cls += "bg-[#18392B] border-[#58CC02] text-[#58CC02] shadow-[0_4px_0_#46A302]";
            badge = <span className="text-[#58CC02] text-xs font-black uppercase tracking-wider bg-[#58CC02]/20 px-2 py-0.5 rounded-md">Correct Answer</span>;
          } else {
            cls += "bg-[#1A2C32] border-[#37464F] text-[#5A6B73] opacity-40";
          }
        } else if (isSelected) {
          // Selected before submit -> BRIGHT BLUE
          cls += "bg-[#1CB0F6]/10 border-[#1CB0F6] text-[#1CB0F6] shadow-[0_4px_0_#1899D6]";
        } else {
          // Normal state -> HOVER BLUE
          cls += "bg-[#1A2C32] border-[#37464F] text-white hover:border-[#1CB0F6] hover:bg-[#233A42] cursor-pointer active:scale-95";
        }

        return (
          <button
            key={option}
            onClick={() => !disabled && onSelect(option)}
            disabled={disabled}
            className={cls}
          >
            <span>{option}</span>
            {badge}
          </button>
        );
      })}
    </div>
  );
}

function WordBankExercise({
  data, selected, onSelectChip, onRemoveChip, disabled,
}: {
  data: { word_bank: string[]; sentence: string };
  selected: string[];
  onSelectChip: (w: string) => void;
  onRemoveChip: (i: number) => void;
  disabled: boolean;
}) {
  const selectedBankIndices: number[] = [];
  const selectedCopy = [...selected];

  data.word_bank.forEach((word, bankIdx) => {
    const foundIdx = selectedCopy.indexOf(word);
    if (foundIdx !== -1) {
      selectedBankIndices.push(bankIdx);
      selectedCopy.splice(foundIdx, 1);
    }
  });

  return (
    <div className="w-full space-y-8">
      <div className="min-h-[80px] border-b-2 border-[#37464F] pb-3 flex flex-wrap gap-3 items-end justify-start">
        {selected.length === 0 && (
          <span className="text-[#5A6B73] font-bold text-sm italic py-2">
            Tap the words below to form your answer...
          </span>
        )}
        {selected.map((word, i) => (
          <button
            key={i}
            onClick={() => !disabled && onRemoveChip(i)}
            disabled={disabled}
            className="px-5 py-3 rounded-2xl bg-[#1A2C32] border-2 border-[#37464F] text-white font-extrabold text-base shadow-md hover:border-[#1CB0F6] active:scale-95 transition-all"
          >
            {word}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 justify-center pt-4">
        {data.word_bank.map((word, bankIdx) => {
          const isSelected = selectedBankIndices.includes(bankIdx);

          if (isSelected) {
            return (
              <div
                key={bankIdx}
                className="px-5 py-3 rounded-2xl bg-[#1A2C32]/40 border-2 border-[#37464F]/40 text-transparent font-extrabold text-base select-none"
              >
                {word}
              </div>
            );
          }

          return (
            <button
              key={bankIdx}
              onClick={() => !disabled && onSelectChip(word)}
              disabled={disabled}
              className="px-5 py-3 rounded-2xl bg-[#1A2C32] border-2 border-[#37464F] text-white font-extrabold text-base shadow-md hover:border-[#1CB0F6] hover:bg-[#233A42] active:scale-95 transition-all"
            >
              {word}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FillBlankChoiceExercise({
  options, selected, onSelect, disabled, feedbackState, correctAnswer,
}: {
  options: string[];
  selected: string | null;
  onSelect: (v: string) => void;
  disabled: boolean;
  feedbackState: "correct" | "incorrect" | null;
  correctAnswer: string | null;
}) {
  return (
    <div className="flex flex-wrap gap-3 justify-center w-full">
      {options.map((option) => {
        const isSelected = option === selected;
        const isCorrectOption = feedbackState === "incorrect" && option === correctAnswer;

        let cls = "px-6 py-3.5 rounded-2xl border-2 font-extrabold text-lg text-center transition-all ";
        if (disabled) {
          if (isSelected && feedbackState === "correct") {
            cls += "bg-[#18392B] border-[#58CC02] text-[#58CC02]";
          } else if (isSelected && feedbackState === "incorrect") {
            cls += "bg-[#FF4B4B]/20 border-[#FF4B4B] text-[#FF4B4B]";
          } else if (isCorrectOption) {
            cls += "bg-[#18392B] border-[#58CC02] text-[#58CC02]";
          } else {
            cls += "bg-[#1A2C32] border-[#37464F] text-[#5A6B73] opacity-40";
          }
        } else if (isSelected) {
          cls += "bg-[#1CB0F6]/10 border-[#1CB0F6] text-[#1CB0F6] shadow-[0_4px_0_#1899D6]";
        } else {
          cls += "bg-[#1A2C32] border-[#37464F] text-white hover:border-[#1CB0F6] hover:bg-[#233A42] cursor-pointer active:scale-95";
        }

        return (
          <button
            key={option}
            onClick={() => !disabled && onSelect(option)}
            disabled={disabled}
            className={cls}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}



function MatchPairsExercise({
  data, matchSelected, matchedPairs, onSelect, disabled,
}: {
  data: { pairs: string[][] };
  matchSelected: { left: string | null; right: string | null };
  matchedPairs: string[][];
  onSelect: (side: "left" | "right", val: string) => void;
  disabled: boolean;
}) {
  const lefts = data.pairs.map(p => p[0]);
  
  // Shuffled right options so they aren't pre-aligned in identical order
  const rights = React.useMemo(() => {
    const r = data.pairs.map(p => p[1]);
    return [...r].sort((a, b) => (a.charCodeAt(0) % 3) - (b.charCodeAt(0) % 3));
  }, [data.pairs]);

  const renderChip = (val: string, side: "left" | "right") => {
    const isMatched = matchedPairs.some(p => p.includes(val));
    const isSelected = (side === "left" && matchSelected.left === val) || (side === "right" && matchSelected.right === val);

    let cls = "p-3.5 rounded-2xl border-2 font-extrabold text-sm text-center w-full transition-all ";
    if (isMatched) {
      cls += "border-[#58CC02] bg-[#58CC02]/10 text-[#58CC02] opacity-60 cursor-pointer hover:border-[#FF4B4B] hover:text-[#FF4B4B]";
    } else if (isSelected) {
      cls += "border-[#1CB0F6] bg-[#1CB0F6]/10 text-[#1CB0F6] shadow-[0_4px_0_#1899D6]";
    } else if (disabled) {
      cls += "border-[#37464F] bg-[#1A2C32] text-[#5A6B73]";
    } else {
      cls += "border-[#37464F] bg-[#1A2C32] text-white hover:border-[#1CB0F6] cursor-pointer active:scale-95";
    }

    return (
      <button
        key={val}
        onClick={() => !disabled && onSelect(side, val)}
        disabled={disabled}
        className={cls}
        title={isMatched ? "Tap to un-match" : undefined}
      >
        {val}
      </button>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      <div className="space-y-3">{lefts.map(v => renderChip(v, "left"))}</div>
      <div className="space-y-3">{rights.map(v => renderChip(v, "right"))}</div>
    </div>
  );
}

function TypeAnswerExercise({
  value, onChange, disabled, placeholder,
}: { value: string; onChange: (v: string) => void; disabled: boolean; placeholder: string }) {
  const accentChars = ["á", "é", "í", "ó", "ú", "ñ", "¿", "¡"];

  return (
    <div className="w-full space-y-3">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-5 py-4 text-lg font-bold border-2 rounded-2xl bg-[#1A2C32] text-white border-[#37464F] focus:outline-none focus:border-[#1CB0F6] placeholder:text-[#5A6B73] transition-all disabled:opacity-60"
        autoFocus
      />
      <div className="flex flex-wrap gap-2 justify-center pt-1">
        {accentChars.map(char => (
          <button
            key={char}
            type="button"
            onClick={() => !disabled && onChange(value + char)}
            disabled={disabled}
            className="w-10 h-10 rounded-xl bg-[#1A2C32] border-2 border-[#37464F] text-white font-extrabold text-base hover:border-[#1CB0F6] hover:bg-[#233A42] active:scale-95 transition-all disabled:opacity-40"
          >
            {char}
          </button>
        ))}
      </div>
    </div>
  );
}

function LessonCompleteModal({ result, onContinue }: { result: LessonCompleteResult; onContinue: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131F24] max-w-sm w-full rounded-3xl border-2 border-[#37464F] shadow-2xl text-center p-8 animate-bounce-in">
        <div className="flex justify-center mb-4 animate-owl-jump">
          <DuoMascot width={96} height={96} />
        </div>

        <h2 className="text-3xl font-black text-white mb-1">
          {result.passed ? "Lesson Complete! 🎉" : "Lesson Over 😔"}
        </h2>
        <p className="text-sm font-bold text-[#8A9BA3] mb-6">
          {result.passed ? "You crushed it! Keep up the momentum!" : "Don't give up — try again!"}
        </p>

        <div className="flex justify-around bg-[#1A2C32] rounded-2xl p-4 mb-6 border border-[#37464F]">
          <div className="text-center">
            <span className="block text-2xl">⚡</span>
            <span className="block text-xl font-black text-[#FFC800]">+{result.xp_earned}</span>
            <span className="text-xs font-bold text-[#8A9BA3]">TOTAL XP</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl">❤️</span>
            <span className="block text-xl font-black text-[#FF4B4B]">{result.new_hearts}</span>
            <span className="text-xs font-bold text-[#8A9BA3]">HEARTS</span>
          </div>
          {result.streak_updated && (
            <div className="text-center">
              <span className="block text-2xl">🔥</span>
              <span className="block text-xl font-black text-[#FF9600]">Streak!</span>
              <span className="text-xs font-bold text-[#8A9BA3]">UPDATED</span>
            </div>
          )}
        </div>

        <button
          onClick={onContinue}
          className="w-full py-4 rounded-2xl bg-[#58CC02] shadow-[0_4px_0_#46A302] font-black text-base uppercase text-white hover:brightness-105 active:scale-95 transition-all"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}

function OutOfHeartsModal({ gems, onRefill, onQuit }: { gems: number; onRefill: () => void; onQuit: () => void }) {
  const canRefill = gems >= 350;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131F24] max-w-sm w-full rounded-3xl border-2 border-[#37464F] shadow-2xl text-center p-8 animate-bounce-in">
        <div className="flex justify-center mb-3">
          <HeartIcon size={64} />
        </div>

        <h2 className="text-2xl font-black text-[#FF4B4B] mb-2">Out of Hearts!</h2>
        <p className="text-sm font-bold text-[#8A9BA3] mb-6">
          You&apos;ve used all your hearts. Refill with gems or practice to earn more!
        </p>

        <div className="space-y-3">
          <button
            onClick={onRefill}
            disabled={!canRefill}
            className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 ${canRefill
                ? "bg-[#58CC02] text-white shadow-[0_4px_0_#46A302] hover:brightness-105"
                : "bg-[#1A2C32] text-[#5A6B73] cursor-not-allowed border-2 border-[#37464F]"
              }`}
          >
            <span>REFILL HEARTS</span>
            <span className="bg-black/20 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
              <GemIcon size={14} /> 350
            </span>
          </button>

          <button onClick={onQuit} className="w-full py-3.5 rounded-2xl font-black text-sm uppercase text-[#8A9BA3] border-2 border-[#37464F] hover:border-[#5A6B73]">
            QUIT LESSON
          </button>
        </div>
      </div>
    </div>
  );
}

function LessonLoading() {
  return (
    <div className="min-h-screen bg-[#131F24] flex flex-col items-center justify-center gap-4">
      <div className="animate-owl-jump">
        <DuoMascot width={80} height={80} />
      </div>
      <p className="font-extrabold text-[#8A9BA3] text-sm animate-pulse">
        Loading lesson...
      </p>
    </div>
  );
}

function LessonError({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#131F24] flex items-center justify-center p-6">
      <div className="bg-[#1A2C32] border-2 border-[#37464F] rounded-3xl p-8 max-w-sm text-center">
        <div className="text-5xl mb-3">⚠️</div>
        <h3 className="font-black text-[#FF4B4B] text-lg mb-2">Something went wrong</h3>
        <p className="text-sm font-bold text-[#8A9BA3] mb-5">{message}</p>
        <button onClick={onBack} className="w-full py-3.5 rounded-2xl bg-[#58CC02] shadow-[0_4px_0_#46A302] font-black text-sm uppercase text-white">GO HOME</button>
      </div>
    </div>
  );
}
