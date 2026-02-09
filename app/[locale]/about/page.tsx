import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AboutContent />;
}

function AboutContent() {
  const t = useTranslations("about");

  const sections = [
    { title: t("mission"), text: t("missionText") },
    { title: t("openSource"), text: t("openSourceText") },
    { title: t("methodology"), text: t("methodologyText") },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-memorial-50 mb-8">{t("title")}</h1>

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-gold-400 mb-3">{section.title}</h2>
            <p className="text-memorial-300 leading-relaxed">{section.text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
