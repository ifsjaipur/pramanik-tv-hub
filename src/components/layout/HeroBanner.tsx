'use client';

import { useLanguage } from '@/components/ui/LanguageProvider';

export default function HeroBanner() {
  const { language } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-saffron-500 via-saffron-600 to-saffron-700 px-4 py-4 text-white md:px-6 md:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl text-center">
        <h1 className="text-xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
          {language === 'hi' ? 'प्रामाणिक विडियो हब' : 'Pramanik Video Hub'}
        </h1>
        <p className="mt-1 text-xs font-medium text-white/90 md:text-xl">
          {language === 'hi'
            ? 'प्रवचन · भावना योग · शंका समाधान · जैन पाठशाला'
            : 'Discourses · Bhawna Yog · Shanka Samadhan · Jain Pathshala'}
        </p>
      </div>
    </section>
  );
}
