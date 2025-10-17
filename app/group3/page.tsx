import { InputPanel } from "./inputPanel";
import { VisualPanel } from "./visualPanel";
import React from "react"; 

export default function Group3Page() {
  return (
    <div className="font-sans">
      {/* The py-10 provides padding at the top and bottom of the page content */}
      <main className="flex flex-col gap-8 w-full max-w-7xl mx-auto py-10"> 
        
        {/* Main Content Layout: Form (Left) and Map (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-10 w-full flex-grow">
          
          <InputPanel />
          
          <VisualPanel />
          
        </div>
      </main>
    </div>
  );
}