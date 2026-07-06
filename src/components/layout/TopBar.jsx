import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function TopBar({ onMenuClick, title }) {
  const { lang, setLang } = useI18n();

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 select-none" style={{ paddingTop: 'env(safe-area-inset-top)', minHeight: 'calc(env(safe-area-inset-top) + 56px)' }}>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="w-5 h-5" />
        </Button>
        {title && <h1 className="text-lg font-heading font-semibold">{title}</h1>}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={lang === 'en' ? 'default' : 'ghost'}
          size="sm"
          className="text-xs h-8 px-3"
          onClick={() => setLang('en')}
        >
          EN
        </Button>
        <Button
          variant={lang === 'mr' ? 'default' : 'ghost'}
          size="sm"
          className="text-xs h-8 px-3"
          onClick={() => setLang('mr')}
        >
          मरा
        </Button>
      </div>
    </header>
  );
}