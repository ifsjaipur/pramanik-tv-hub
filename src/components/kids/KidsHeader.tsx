import { useLanguage } from '@/components/ui/LanguageProvider';

export default function KidsHeader() {
  const { language } = useLanguage();

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30">
      <div className="mx-auto max-w-7xl px-4 py-8 text-center md:px-6 md:py-12">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white md:text-4xl">
          {language === 'hi' ? '\u091C\u0948\u0928 \u092A\u093E\u0920\u0936\u093E\u0932\u093E' : 'Jain Pathshala'}
        </h1>
        <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-300">
          {language === 'hi'
            ? '\u092C\u091A\u094D\u091A\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u090F\u0928\u093F\u092E\u0947\u091F\u0947\u0921 \u0915\u0939\u093E\u0928\u093F\u092F\u093E\u0901 \u0914\u0930 \u091C\u0948\u0928 \u0936\u093F\u0915\u094D\u0937\u093E'
            : 'Animated stories and Jain teachings for kids'}
        </p>
      </div>
    </div>
  );
}
