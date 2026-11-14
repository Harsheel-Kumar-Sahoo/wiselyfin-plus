import type { TFunction } from "i18next";
import { ApiError } from "./api";

// Turns any failure into a friendly sentence in the user's language.
export function errorMessage(err: unknown, t: TFunction): string {
  if (err instanceof ApiError) {
    return t(`errors.${err.code}`, { defaultValue: t("errors.SERVER_ERROR") });
  }
  return t("errors.SERVER_ERROR");
}

// Returns a short message for one form field when the server rejected it, or undefined.
export function fieldError(err: unknown, field: string, t: TFunction): string | undefined {
  if (!(err instanceof ApiError) || err.code !== "INVALID_INPUT") return undefined;
  if (!err.fields.some((f) => f.field === field)) return undefined;
  return field === "password" ? t("auth.passwordHint") : t("errors.INVALID_INPUT");
}