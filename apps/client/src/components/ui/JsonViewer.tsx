import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Button } from './button';

interface JsonViewerProps {
  data: unknown;
  initiallyExpanded?: boolean;
}

export function JsonViewer({ data, initiallyExpanded = true }: JsonViewerProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2) || '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast.success(t('common.copied', 'Copied to clipboard'));
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
      toast.error(t('common.copyFailed', 'Failed to copy text'));
    }
  };

  if (data === null || data === undefined) return <div className="text-muted-foreground text-sm italic">null</div>;

  return (
    <div className="relative border rounded-md overflow-hidden bg-muted/30">
      <div className="flex items-center justify-between bg-muted px-4 py-2 border-b">
        <Button 
          type="button"
          variant="ghost" 
          size="sm" 
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
          {expanded ? t('common.collapse', 'Collapse') : t('common.expand', 'Expand')}
        </Button>
        <Button 
          type="button"
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
          onClick={handleCopy}
          title={t('common.copyJson', 'Copy JSON')}
        >
          {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
        </Button>
      </div>
      {expanded && (
        <pre className="p-4 text-xs font-mono overflow-auto max-h-[400px]">
          {jsonString}
        </pre>
      )}
    </div>
  );
}
