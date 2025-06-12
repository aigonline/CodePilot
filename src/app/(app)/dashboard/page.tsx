
"use client";

import * as React from "react";
import { History, SendHorizonal, Copy, Download, Trash2, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { generateCodeAction, type GenerateCodeActionState } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from "next/navigation";

interface HistoryItem {
  id: string;
  prompt: string;
  language: string;
  code: string;
  timestamp: number;
}

const SUPPORTED_LANGUAGES = [
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "json", label: "JSON" },
  { value: "sql", label: "SQL" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "kotlin", label: "Kotlin" },
  { value: "swift", label: "Swift" },
];

const HISTORY_STORAGE_KEY = "codepilot_history";
const PREVIEW_STORAGE_KEY = 'codePilotPreview';
const PREVIEWABLE_LANGUAGES = ["html", "css", "javascript"];
const MAX_HISTORY_ITEMS = 20;

export default function CodePilotDashboardPage() {
  const [prompt, setPrompt] = React.useState<string>("");
  const [language, setLanguage] = React.useState<string>(SUPPORTED_LANGUAGES[2].value); 
  const [generatedCode, setGeneratedCode] = React.useState<string>("");
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [activeAccordionItem, setActiveAccordionItem] = React.useState<string | undefined>(undefined);

  const { toast } = useToast();
  const router = useRouter();

  const initialState: GenerateCodeActionState = {};
  const [formState, formAction] = React.useActionState(generateCodeAction, initialState);
  
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  React.useEffect(() => {
    setIsLoading(false);
    if (formState?.code) {
      setGeneratedCode(formState.code);
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        prompt,
        language,
        code: formState.code,
        timestamp: Date.now(),
      };
      setHistory(prevHistory => [newHistoryItem, ...prevHistory].slice(0, MAX_HISTORY_ITEMS));
      toast({ title: "Success", description: "Code generated successfully!" });
    } else if (formState?.error) {
      toast({ variant: "destructive", title: "Error", description: formState.error });
      setGeneratedCode(""); 
    } else if (formState?.inputErrors) {
       const errors = Object.values(formState.inputErrors).join(" ");
       toast({ variant: "destructive", title: "Validation Error", description: errors });
       setGeneratedCode("");
    }
  }, [formState, prompt, language, toast, setGeneratedCode, setHistory]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setGeneratedCode(""); 
    const formData = new FormData(event.currentTarget);
    React.startTransition(() => {
      formAction(formData);
    });
  };
  
  const handleCopyToClipboard = () => {
    if (!generatedCode) {
      toast({ variant: "destructive", title: "Nothing to copy", description: "Generate some code first." });
      return;
    }
    navigator.clipboard.writeText(generatedCode)
      .then(() => toast({ title: "Copied!", description: "Code copied to clipboard." }))
      .catch(() => toast({ variant: "destructive", title: "Error", description: "Failed to copy code." }));
  };

  const getFileExtension = (lang: string): string => {
    const foundLang = SUPPORTED_LANGUAGES.find(l => l.value === lang);
    if (foundLang) {
        switch(foundLang.value) {
            case "javascript": return "js";
            case "typescript": return "ts";
            case "python": return "py";
            default: return foundLang.value;
        }
    }
    return "txt";
  };

  const handleDownloadCode = () => {
    if (!generatedCode) {
      toast({ variant: "destructive", title: "Nothing to download", description: "Generate some code first." });
      return;
    }
    const blob = new Blob([generatedCode], { type: `text/${getFileExtension(language)};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `codepilot_snippet_${language}.${getFileExtension(language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "Code download started." });
  };

  const handleLoadHistoryItem = (item: HistoryItem) => {
    setPrompt(item.prompt);
    setLanguage(item.language);
    setGeneratedCode(item.code);
    setActiveAccordionItem(undefined); 
    toast({ title: "Loaded from history", description: "Prompt and code loaded." });
  };

  const handleClearHistory = () => {
    setHistory([]);
    toast({ title: "History Cleared" });
  };

  const isPreviewable = React.useMemo(() => {
    return generatedCode && PREVIEWABLE_LANGUAGES.includes(language);
  }, [generatedCode, language]);

  const handlePreview = () => {
    if (!isPreviewable) {
      toast({
        variant: "destructive",
        title: "Cannot Preview",
        description: `Preview is only available for HTML, CSS, and JavaScript. Current language: ${language}.`,
      });
      return;
    }

    try {
      localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify({ code: generatedCode, language }));
      const previewUrl = router.push('/preview'); // router.push is async in some cases, not typically for simple paths
      // Forcing a new tab for preview
      const newWindow = window.open('/preview', '_blank', 'noopener,noreferrer');
      if (newWindow) newWindow.opener = null;

    } catch (error) {
      console.error("Failed to save to localStorage or navigate:", error);
      toast({
        variant: "destructive",
        title: "Preview Error",
        description: "Could not prepare data for preview.",
      });
    }
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
      
      <div className="md:col-span-1 flex flex-col gap-6 lg:gap-8">
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Create Code</CardTitle>
            <CardDescription>Enter your prompt and select a language.</CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-foreground mb-2">
                  Prompt
                </label>
                <Textarea
                  id="prompt"
                  name="prompt"
                  placeholder="e.g., a React component for a login form with Tailwind CSS"
                  rows={6}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="focus:ring-primary focus:border-primary rounded-xl"
                  required
                />
              </div>
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-foreground mb-2">
                  Language
                </label>
                <Select name="language" value={language} onValueChange={setLanguage} required>
                  <SelectTrigger id="language" className="focus:ring-primary focus:border-primary rounded-xl">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-3 text-base" disabled={isLoading}>
                <SendHorizonal className="mr-2 h-5 w-5" />
                {isLoading ? "Generating..." : "Generate Code"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center">
                <History className="mr-2 h-5 w-5 text-primary" />
                History
              </CardTitle>
              <CardDescription>Review your past generations.</CardDescription>
            </div>
            {history.length > 0 && (
               <Button variant="outline" size="icon" onClick={handleClearHistory} aria-label="Clear history" className="rounded-full">
                 <Trash2 className="h-4 w-4" />
               </Button>
            )}
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No history yet. Generated code will appear here.</p>
            ) : (
              <ScrollArea className="h-[300px] pr-3">
                <Accordion type="single" collapsible value={activeAccordionItem} onValueChange={setActiveAccordionItem}>
                  {history.map((item) => (
                    <AccordionItem value={item.id} key={item.id} className="border-border rounded-xl mb-2 overflow-hidden data-[state=open]:shadow-md">
                      <AccordionTrigger className="text-sm hover:no-underline px-4 py-3 bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col text-left w-full pr-2">
                            <span className="font-medium truncate max-w-[200px] sm:max-w-[250px]" title={item.prompt}>
                                {item.prompt.length > 40 ? `${item.prompt.substring(0, 40)}...` : item.prompt}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {SUPPORTED_LANGUAGES.find(l => l.value === item.language)?.label || item.language} - {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                            </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2 pb-4 px-4 bg-card border-t border-border">
                        <p className="text-xs text-muted-foreground italic">Prompt: {item.prompt}</p>
                        <Button variant="outline" size="sm" onClick={() => handleLoadHistoryItem(item)} className="w-full rounded-lg">
                          <ChevronRight className="mr-2 h-4 w-4" /> Load this Session
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      
      <div className="md:col-span-2">
        <Card className="rounded-2xl shadow-lg h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold">Generated Code</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleCopyToClipboard} disabled={!generatedCode || isLoading} aria-label="Copy code" className="rounded-full">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleDownloadCode} disabled={!generatedCode || isLoading} aria-label="Download code" className="rounded-full">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handlePreview} disabled={!isPreviewable || isLoading} aria-label="Preview code" className="rounded-full">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col min-h-[calc(100vh-12rem-120px)] md:min-h-0">
            <ScrollArea className="flex-grow rounded-xl border border-input bg-muted/20 p-1 relative min-h-[300px] md:min-h-[500px] lg:min-h-[600px]">
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground animate-pulse">
                  <SendHorizonal className="h-12 w-12 mb-4 text-primary opacity-50 animate-bounce" />
                  Generating code...
                </div>
              ) : generatedCode ? (
                <pre className="p-4 text-sm font-code whitespace-pre-wrap break-all animate-fade-in">
                  <code className={`language-${language}`}>{generatedCode}</code>
                </pre>
              ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-code-xml opacity-30 mb-4"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
                  Generated code will appear here.
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
