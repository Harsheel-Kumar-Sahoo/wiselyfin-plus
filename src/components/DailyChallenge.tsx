import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Target, XCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/useAuth";
import { ApiError, api } from "../lib/api";
import { errorMessage } from "../lib/errorMessage";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Card } from "./Card";
import { cx } from "./cx";
import { Skeleton } from "./Skeleton";

type ChallengeResponse =
  | { ok: true; available: false }
  | {
      ok: true;
      available: true;
      day: string;
      rewardCoins: number;
      rewardXp: number;
      attempted: boolean;
      wasCorrect: boolean;
      question: { prompt: string; options: string[] };
    };

type AnswerResponse = {
  ok: true;
  correct: boolean;
  correctIndex: number;
  explanation: string;
  reward: { coins: number; xp: number };
  streak: { value: number; rewardCoins: number };
  newBadges: string[];
};

export function DailyChallenge() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const queryClient = useQueryClient();
  const [choice, setChoice] = useState<number | null>(null);
  const [result, setResult] = useState<AnswerResponse | null>(null);
  const [message, setMessage] = useState("");

  const query = useQuery({
    queryKey: ["engagement", "challenge", lang],
    queryFn: () => api<ChallengeResponse>(`/api/engagement/challenge?lang=${lang}`),
  });

  const answer = useMutation({
    mutationFn: (picked: number) =>
      api<AnswerResponse>(`/api/engagement/challenge/answer?lang=${lang}`, {
        method: "POST",
        body: { choice: picked },
      }),
    onSuccess: (data) => {
      setResult(data);
      void queryClient.invalidateQueries({ queryKey: ["engagement"] });
      void queryClient.invalidateQueries({ queryKey: ["community"] });
      void queryClient.invalidateQueries({ queryKey: ["wallet"] });
      void useAuth.getState().refresh();
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        setMessage(t("engage.challenge.doneToday"));
        void queryClient.invalidateQueries({ queryKey: ["engagement"] });
      } else {
        setMessage(errorMessage(err, t));
      }
    },
  });

  // The challenge is a bonus. If it fails to load, the rest of the page still works.
  if (query.isError) return null;

  if (query.isLoading || !query.data) {
    return (
      <Card className="space-y-3">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full" />
      </Card>
    );
  }

  const data = query.data;

  if (!data.available) {
    return (
      <Card className="flex items-center gap-3 text-sm text-muted">
        <Target size={20} strokeWidth={1.75} aria-hidden="true" />
        {t("engage.challenge.unavailable")}
      </Card>
    );
  }

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Target size={20} strokeWidth={1.75} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold">{t("engage.challenge.title")}</h2>
      </div>
      <Badge tone="coin">{t("engage.challenge.reward", { coins: data.rewardCoins, xp: data.rewardXp })}</Badge>
    </div>
  );

  if (result) {
    return (
      <Card className="space-y-4">
        {header}
        <p className="font-medium">{data.question.prompt}</p>
        <div
          role="status"
          className={cx(
            "flex items-center gap-2 rounded-control px-3 py-2 text-sm",
            result.correct ? "bg-success-soft text-success" : "bg-error-soft text-error"
          )}
        >
          {result.correct ? (
            <CheckCircle2 size={18} strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <XCircle size={18} strokeWidth={1.75} aria-hidden="true" />
          )}
          {result.correct ? t("engage.challenge.correct") : t("engage.challenge.wrong")}
        </div>
        <p className="text-sm text-muted">
          {data.question.options[result.correctIndex]}. {result.explanation}
        </p>
        {result.reward.coins > 0 ? (
          <p className="text-sm text-coin">
            {t("engage.challenge.earned", { coins: result.reward.coins, xp: result.reward.xp })}
          </p>
        ) : null}
        {result.streak.rewardCoins > 0 ? (
          <p className="text-sm text-coin">{t("engage.challenge.streakBonus", { coins: result.streak.rewardCoins })}</p>
        ) : null}
      </Card>
    );
  }

  if (data.attempted) {
    return (
      <Card className="space-y-2">
        {header}
        <p className="text-sm text-muted">
          {data.wasCorrect ? t("engage.challenge.doneCorrect") : t("engage.challenge.doneWrong")}
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      {header}
      <fieldset className="space-y-3">
        <legend className="font-medium">{data.question.prompt}</legend>
        <div className="space-y-2">
          {data.question.options.map((option, i) => (
            <label
              key={i}
              className={cx(
                "flex min-h-11 cursor-pointer items-center gap-3 rounded-control border px-3 py-2 text-sm",
                choice === i ? "border-accent bg-accent-soft" : "border-line bg-surface hover:bg-soft"
              )}
            >
              <input
                type="radio"
                name="daily-challenge"
                checked={choice === i}
                onChange={() => {
                  setChoice(i);
                  setMessage("");
                }}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              <span className="flex-1">{option}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {message ? (
        <div role="alert" className="rounded-control bg-error-soft px-3 py-2 text-sm text-error">
          {message}
        </div>
      ) : null}
      <Button
        loading={answer.isPending}
        onClick={() => {
          if (choice === null) {
            setMessage(t("engage.challenge.chooseOne"));
            return;
          }
          setMessage("");
          answer.mutate(choice);
        }}
      >
        {t("engage.challenge.submit")}
      </Button>
    </Card>
  );
}