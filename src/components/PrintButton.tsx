'use client'
import { Download } from 'lucide-react'
export default function PrintButton() {
  return <button onClick={() => window.print()} className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold hover:bg-violet-400"><Download size={16} />Download / Print as PDF</button>
}
