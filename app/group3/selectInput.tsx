import { ChevronDown} from "lucide-react";

export function SelectInput({ value, onChange, label, versions }: { 
    label: string, 
    value: string, 
    onChange: (v: string) => void, 
    versions: string[] 
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium block">{label}</label>
      <div className="relative">
        <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="appearance-none flex items-center justify-between h-9 w-full rounded-md border border-input px-3 py-1 text-sm shadow-xs outline-none cursor-pointer"
        >
            {versions.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none" />
      </div>
    </div>
  );
}