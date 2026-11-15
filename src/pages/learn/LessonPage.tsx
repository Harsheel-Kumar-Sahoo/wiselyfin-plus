import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, SearchX, WifiOff, XCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { cx } from "../../components/cx";
import { EmptyState } from "../../components/EmptyState";
import { Skeleton } from "../../components/Skeleton";
import { ApiError, api } from "../../lib/api";
import { errorMessage } from "../../lib/errorMessage";

type LessonResponse = {
  ok: true;
  lesson: {
    slug: string;
    title: string;
    body: string;
    rewardCoins: number;
    rewardXp: number;
    passed: boolean;
    bestScore: number;
    nextSlug: string | null;
    pathSlug: string | null;
    pathTitle: string;
    questions: Array<{ id: string; prompt: string; options: string[] }>;
  };
};

type SubmitResponse = {
  ok: true;
  result: {
    correct: number;
    total: number;
    percent: number;
    passed: boolean;
    questions: Array<{ id: string; correct: boolean; correctIndex: number; explanation: string }>;
  };
  reward: { coins: number; xp: number; pathCompleted: boolean; pathBonus: number };
  balance?: number;
};

// The key makes the page start fresh whenever you move to another lesson.
export function LessonPage() {
  const { slug = "" } = useParams();
  return <LessonView key={slug} slug={slug} />;
}

function LessonView({ slug }: { slug: string }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const queryClient = useQueryClient();

  const [answers, setAnswers] = useState<Array<number | null>>([]);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [message, setMessage] = useState("");

  const query = useQuery({
    queryKey: ["learn", "lesson", slug, lang],
    queryFn: () => api<LessonResponse>(`/api/learn/lessons/${encodeURIComponent(slug)}?lang=${lang}`),
  });

  const submit = useMutation({
    mutationFn: (chosen: number[]) =>
      api<SubmitResponse>(`/api/learn/lessons/${encodeURIComponent(slug)}/submit?lang=${lang}`, {
        method: "POST",
        body: { answers: chosen },
      }),
    onSuccess: (data) => {
      setResult(data);
      void queryClient.invalidateQueries({ queryKey: ["learn"] });
      void queryClient.invalidateQueries({ queryKey: ["wallet"] });
      void useAuth.getState().refresh();
    },
    onError: (err) => setMessage(errorMessage(err, t)),
  });

  const notFound = query.error instanceof ApiError && query.error.status === 404;

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (notFound) {
    return (
      <Card>
        <EmptyState icon={SearchX} title={t("learn.notFound")} />
      </Card>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Card>
        <EmptyState
          icon={WifiOff}
          title={t("common.errorTitle")}
          description={t("common.errorBody")}
          action={<Button onClick={() => void query.refetch()}>{t("common.retry")}</Button>}
        />
      </Card>
    );
  }

  const lesson = query.data.lesson;
  const paragraphs = lesson.body.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const backTo = lesson.pathSlug ? `/learn/${lesson.pathSlug}` : "/learn";

  function choose(questionIndex: number, optionIndex: number) {
    if (result) return;
    setMessage("");
    setAnswers((prev) => {
      const next = lesson.questions.map((_, i) => prev[i] ?? null);
      next[questionIndex] = optionIndex;
      return next;
    });
  }

  function onCheck() {
    const chosen = lesson.questions.map((_, i) => answers[i] ?? null);
    if (chosen.some((a) => a === null)) {
      setMessage(t("learn.answerAll"));
      return;
    }
    setMessage("");
    submit.mutate(chosen as number[]);
  }

  function tryAgain() {
    setResult(null);
    setAnswers([]);
    setMessage("");
  }

  const feedback = new Map(result?.result.questions.map((q) => [q.id, q]));

  return (
    <div className="space-y-6">
      <Link to={backTo} className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
        <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
        {lesson.pathTitle || t("learn.title")}
      </Link>

      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">{lesson.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="coin">{t("learn.reward", { coins: lesson.rewardCoins, xp: lesson.rewardXp })}</Badge>
          {lesson.passed ? <Badge tone="success">{t("learn.passed")}</Badge> : null}
        </div>
      </div>

      <Card className="space-y-4">
        {paragraphs.map((p, i) => (
          <p key={i} className="leading-relaxed">
            {p}
          </p>
        ))}
      </Card>

      {lesson.questions.length > 0 ? (
        <section className="space-y-4" aria-label={t("learn.quiz")}>
          <h2 className="text-lg font-semibold">{t("learn.quiz")}</h2>

          {lesson.questions.map((q, qi) => {
            const fb = feedback.get(q.id);
            return (
              <Card key={q.id}>
                <fieldset className="space-y-3">
                  <legend className="font-medium">
                    {qi + 1}. {q.prompt}
                  </legend>
                  <div className="space-y-2">
                    {q.options.map((option, oi) => {
                      const selected = answers[qi] === oi;
                      const isRightOption = fb ? fb.correctIndex === oi : false;
                      const isWrongPick = fb ? selected && !fb.correct : false;
                      return (
                        <label
                          key={oi}
                          className={cx(
                            "flex min-h-11 cursor-pointer items-center gap-3 rounded-control border px-3 py-2 text-sm",
                            isRightOption
                              ? "border-success bg-success-soft"
                              : isWrongPick
                                ? "border-error bg-error-soft"
                                : selected
                                  ? "border-accent bg-accent-soft"
                                  : "border-line bg-surface hover:bg-soft",
                            result && "cursor-default"
                          )}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            checked={selected}
                            disabled={result !== null}
                            onChange={() => choose(qi, oi)}
                            className="h-4 w-4 accent-[var(--accent)]"
                          />
                          <span className="flex-1">{option}</span>
                          {isRightOption ? (
                            <span className="inline-flex items-center gap-1 text-success">
                              <CheckCircle2 size={16} strokeWidth={1.75} aria-hidden="true" />
                              {t("learn.correct")}
                            </span>
                          ) : isWrongPick ? (
                            <span className="inline-flex items-center gap-1 text-error">
                              <XCircle size={16} strokeWidth={1.75} aria-hidden="true" />
                              {t("learn.wrong")}
                            </span>
                          ) : null}
                        </label>
                      );
                    })}
                  </div>
                  {fb ? <p className="text-sm text-muted">{fb.explanation}</p> : null}
                </fieldset>
              </Card>
            );
          })}

          {message ? (
            <div role="alert" className="rounded-control bg-error-soft px-3 py-2 text-sm text-error">
              {message}
            </div>
          ) : null}

          {result ? (
            <Card className="space-y-4">
              <div
                role="status"
                className={cx(
                  "rounded-control px-3 py-2 text-sm",
                  result.result.passed ? "bg-success-soft text-success" : "bg-error-soft text-error"
                )}
              >
                <p className="font-medium">
                  {t("learn.score", {
                    correct: result.result.correct,
                    total: result.result.total,
                    percent: result.result.percent,
                  })}
                </p>
                <p>{result.result.passed ? t("learn.resultPassed") : t("learn.resultFailed")}</p>
              </div>

              {result.result.passed ? (
                <div className="space-y-1 text-sm">
                  {result.reward.coins > 0 ? (
                    <p className="text-coin">{t("learn.earned", { coins: result.reward.coins, xp: result.reward.xp })}</p>
                  ) : (
                    <p className="text-muted">{t("learn.alreadyEarned")}</p>
                  )}
                  {result.reward.pathBonus > 0 ? (
                    <p className="text-coin">{t("learn.pathDone", { coins: result.reward.pathBonus })}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                {!result.result.passed ? <Button onClick={tryAgain}>{t("learn.tryAgain")}</Button> : null}
                {result.result.passed && lesson.nextSlug ? (
                  <Link to={`/learn/lesson/${lesson.nextSlug}`}>
                    <Button>{t("learn.nextLesson")}</Button>
                  </Link>
                ) : null}
                <Link to={backTo}>
                  <Button variant="secondary">{t("learn.backToPath")}</Button>
                </Link>
                {result.result.passed ? (
                  <Button variant="ghost" onClick={tryAgain}>
                    {t("learn.tryAgain")}
                  </Button>
                ) : null}
              </div>
            </Card>
          ) : (
            <Button onClick={onCheck} loading={submit.isPending} className="w-full sm:w-auto">
              {t("learn.submit")}
            </Button>
          )}
        </section>
      ) : null}
    </div>
  );
}