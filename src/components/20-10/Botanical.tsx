export function Botanical({ className = "" }: { className?: string }) {
  return (
    <svg className={`botanical ${className}`} viewBox="0 0 180 240" fill="none" aria-hidden="true">
      <path d="M28 238C99 179 61 99 143 12M70 160 25 115M83 114 133 86M100 72 83 28M57 197 115 173" stroke="currentColor" strokeWidth="1.3" />
      <path d="M70 160C29 160 14 123 25 115c32 1 46 24 45 45ZM83 114c-1-28 28-38 50-28-4 23-26 32-50 28ZM100 72C72 60 68 39 83 28c21 11 26 27 17 44ZM57 197c10-26 38-35 58-24-11 21-33 29-58 24ZM121 39c-6-19 3-33 22-27 6 14-4 25-22 27Z" fill="currentColor" fillOpacity=".13" stroke="currentColor" strokeWidth=".8" />
      <path d="M74 144c-21-7-29-23-18-36 18 2 26 15 18 36ZM91 94c21-7 41-4 43 13-18 13-34 8-43-13ZM69 182c-19-4-25-20-18-31 15 5 22 15 18 31Z" stroke="currentColor" strokeWidth=".8" />
    </svg>
  );
}

export function FlowerMark({ className = "" }: { className?: string }) {
  return <svg className={className} width="30" height="36" viewBox="0 0 30 36" fill="none" aria-hidden="true"><path d="M15 34V17m0 9 9-6m-9 11-8-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M15 19C-1 13 7 2 14 9 17-2 30 7 22 15l-7 4Z" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="1.2"/></svg>;
}
