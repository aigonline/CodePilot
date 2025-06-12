
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const PREVIEW_STORAGE_KEY = 'codePilotPreview';

interface PreviewData {
  code: string;
  language: string;
}

export default function PreviewPage() {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>('');


  useEffect(() => {
    try {
      const storedData = localStorage.getItem(PREVIEW_STORAGE_KEY);
      if (storedData) {
        const { code, language }: PreviewData = JSON.parse(storedData);
        setCurrentLanguage(language);
        let fullHtml = '';

        if (language === 'html') {
          // For HTML, try to inject a base style for better default viewing if no styles are present.
          // This is a simple heuristic.
          if (!code.includes('<style>') && !code.includes('</style>') && !code.match(/<link rel=["']stylesheet["']/)) {
            fullHtml = `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>HTML Preview</title>
                <style>
                  body { margin: 0; padding: 10px; font-family: sans-serif; line-height: 1.6; }
                  /* Add some basic resets or styles if the HTML is very minimal */
                </style>
              </head>
              <body>
                ${code}
              </body>
              </html>`;
          } else {
            fullHtml = code;
          }
        } else if (language === 'javascript') {
          fullHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>JavaScript Preview</title>
              <style>body { margin: 8px; font-family: sans-serif; background-color: #f9f9f9; color: #333; } #output { padding: 10px; border: 1px solid #ccc; background-color: #fff; min-height: 50px; margin-top:10px; white-space: pre-wrap; } .error { color: red; font-weight: bold; }</style>
            </head>
            <body>
              <h1>JavaScript Output:</h1>
              <div id="output"></div>
              <script>
                const outputDiv = document.getElementById('output');
                const originalLog = console.log;
                const originalError = console.error;
                const originalWarn = console.warn;
                console.log = (...args) => {
                  outputDiv.innerHTML += args.map(String).join(' ') + '\\n';
                  originalLog.apply(console, args);
                };
                console.error = (...args) => {
                  outputDiv.innerHTML += '<span class="error">ERROR: ' + args.map(String).join(' ') + '</span>\\n';
                  originalError.apply(console, args);
                };
                console.warn = (...args) => {
                  outputDiv.innerHTML += '<span style="color: orange;">WARN: ' + args.map(String).join(' ') + '</span>\\n';
                  originalWarn.apply(console, args);
                };
                try {
                  ${code}
                  if(outputDiv.innerHTML.trim() === '') {
                    outputDiv.innerHTML = '(No output to console)';
                  }
                } catch (e) {
                  outputDiv.innerHTML = '<span class="error">Runtime Error: ' + e.message + '</span>\\nStack: ' + e.stack;
                }
              <\/script>
            </body>
            </html>
          `;
        } else if (language === 'css') {
          fullHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>CSS Preview</title>
              <style>
                body { margin: 0; padding:0; /* CSS will control this */ }
                ${code}
              </style>
            </head>
            <body>
              <div style="padding: 20px; border: 2px dashed #ccc; margin: 20px; background-color: #f0f0f0;">
                <h1>Sample Content for CSS Preview</h1>
                <p>This is a paragraph to demonstrate the styles. It has some <strong>strong</strong> text and <em>emphasized</em> text.</p>
                <button style="padding: 10px 15px; margin: 5px; border: 1px solid #333; background-color: #eee;">A Button</button>
                <input type="text" placeholder="Text Input" style="padding: 10px; margin: 5px; border: 1px solid #333;"/>
                <div style="width: 100px; height: 100px; background-color: lightblue; margin-top: 10px; border: 1px solid blue; display:flex; align-items:center; justify-content:center; text-align:center;">A styled box.</div>
              </div>
            </body>
            </html>
          `;
        } else {
          setError(\`Preview is not supported for \${language.toUpperCase()}.\`);
          setHtmlContent('Preview not available for this language.');
          setIsLoading(false);
          return;
        }
        setHtmlContent(fullHtml);
      } else {
        setError('No code found for preview.');
        setHtmlContent('No preview data found. Generate code and click "Preview" again.');
      }
    } catch (e: any) {
      console.error('Error loading preview:', e);
      setError('Failed to load preview: ' + e.message);
      setHtmlContent('<p style="color: red; padding: 20px;">Error loading preview data. It might be malformed.</p>');
    }
    setIsLoading(false);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="py-4 px-4 md:px-8 border-b border-border sticky top-0 bg-background z-10">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" passHref legacyBehavior>
              <Button variant="outline" size="icon" aria-label="Back to CodePilot">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl md:text-2xl font-semibold text-primary">
              Code Preview {currentLanguage && `(${currentLanguage.toUpperCase()})`}
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-grow p-0 md:p-4 flex flex-col">
        <Card className="flex-grow shadow-lg rounded-none md:rounded-lg overflow-hidden">
          <CardContent className="p-0 h-full w-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading preview...
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-destructive p-4 text-center">
                {error}
              </div>
            ) : (
              <iframe
                srcDoc={htmlContent}
                title="Code Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            )}
          </CardContent>
        </Card>
      </main>
       <footer className="py-4 px-4 md:px-8 border-t border-border text-center mt-auto">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} CodePilot Preview.
        </p>
      </footer>
    </div>
  );
}

