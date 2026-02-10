"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export default function SubmitPage() {
  const t = useTranslations("submit");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = new FormData(e.currentTarget);
    const data = {
      name_latin: form.get("name_latin"),
      name_farsi: form.get("name_farsi"),
      details: form.get("details"),
      sources: form.get("sources"),
      submitter_email: form.get("submitter_email"),
      submitter_name: form.get("submitter_name"),
    };

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <span className="text-5xl mb-6 block candle-flicker">🕯</span>
        <p className="text-xl text-memorial-200 mb-2">{t("thankYou")}</p>
        <p className="text-sm text-memorial-500">{t("description")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-3xl candle-flicker inline-block mb-4">🕯</span>
        <h1 className="text-3xl font-bold text-memorial-50 mb-2">{t("title")}</h1>
        <p className="text-memorial-400">{t("description")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Victim Name Group */}
        <fieldset className="rounded-lg border border-memorial-800/60 bg-memorial-900/30 p-6 space-y-5">
          <legend className="text-sm font-medium text-gold-400 px-2">
            {t("nameLabel").replace(" *", "")}
          </legend>
          <div>
            <label className="block text-sm text-memorial-300 mb-1.5">
              {t("nameLabel")} *
            </label>
            <input
              name="name_latin"
              required
              className="w-full rounded-lg border border-memorial-700 bg-memorial-900 px-4 py-2.5 text-memorial-100 placeholder:text-memorial-600 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
              placeholder="e.g. Mahsa Amini"
            />
          </div>
          <div>
            <label className="block text-sm text-memorial-300 mb-1.5">
              {t("nameFarsiLabel")}
            </label>
            <input
              name="name_farsi"
              dir="rtl"
              className="w-full rounded-lg border border-memorial-700 bg-memorial-900 px-4 py-2.5 text-memorial-100 placeholder:text-memorial-600 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
              placeholder="مثلاً مهسا امینی"
            />
          </div>
        </fieldset>

        {/* Details */}
        <div>
          <label className="block text-sm font-medium text-memorial-300 mb-1.5">
            {t("detailsLabel")} *
          </label>
          <p className="text-xs text-memorial-500 mb-2">
            {t("detailsHint")}
          </p>
          <textarea
            name="details"
            required
            rows={6}
            className="w-full rounded-lg border border-memorial-700 bg-memorial-900 px-4 py-2.5 text-memorial-100 placeholder:text-memorial-600 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
          />
        </div>

        {/* Sources */}
        <div>
          <label className="block text-sm font-medium text-memorial-300 mb-1.5">
            {t("sourcesLabel")}
          </label>
          <p className="text-xs text-memorial-500 mb-2">
            {t("sourcesHint")}
          </p>
          <textarea
            name="sources"
            rows={3}
            className="w-full rounded-lg border border-memorial-700 bg-memorial-900 px-4 py-2.5 text-memorial-100 placeholder:text-memorial-600 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
          />
        </div>

        {/* Submitter Info */}
        <fieldset className="rounded-lg border border-memorial-800/60 bg-memorial-900/30 p-6 space-y-5">
          <legend className="text-sm font-medium text-memorial-400 px-2">
            {t("yourInfo")}
          </legend>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-memorial-300 mb-1.5">
                {t("yourNameLabel")}
              </label>
              <input
                name="submitter_name"
                className="w-full rounded-lg border border-memorial-700 bg-memorial-900 px-4 py-2.5 text-memorial-100 placeholder:text-memorial-600 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
              />
            </div>
            <div>
              <label className="block text-sm text-memorial-300 mb-1.5">
                {t("emailLabel")}
              </label>
              <input
                name="submitter_email"
                type="email"
                className="w-full rounded-lg border border-memorial-700 bg-memorial-900 px-4 py-2.5 text-memorial-100 placeholder:text-memorial-600 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
              />
            </div>
          </div>
          <p className="text-xs text-memorial-600">{t("privacyNote")}</p>
        </fieldset>

        {status === "error" && (
          <p className="text-blood-400 text-sm text-center">{t("error")}</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-lg bg-gold-500/20 border border-gold-500/30 px-6 py-3.5 font-medium text-gold-400 hover:bg-gold-500/30 transition-colors disabled:opacity-50"
        >
          {status === "loading" ? "..." : t("submitButton")}
        </button>
      </form>
    </div>
  );
}
