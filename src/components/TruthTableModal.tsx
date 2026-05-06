import React from 'react';
import { X } from 'lucide-react';

interface TruthTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportToCanvas: () => void;
  data: {
    inputs: string[];
    outputs: string[];
    rows: number[][];
  };
}

const TruthTableModal: React.FC<TruthTableModalProps> = ({ isOpen, onClose, onExportToCanvas, data }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-dk-dark-bg border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-orbitron font-bold text-white">Truth Table Analysis</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dk-darker-bg/50">
                {data.inputs.map((input, i) => (
                  <th key={`in-${i}`} className="p-3 text-xs font-bold text-yellow-500 uppercase tracking-widest border border-white/5">
                    {input || `In ${i+1}`}
                  </th>
                ))}
                {data.outputs.map((output, i) => (
                  <th key={`out-${i}`} className="p-3 text-xs font-bold text-green-500 uppercase tracking-widest border border-white/5">
                    {output || `Out ${i+1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <tr key={`row-${i}`} className="hover:bg-white/5 transition-colors">
                  {row.map((cell, j) => (
                    <td key={`cell-${i}-${j}`} className={`p-3 text-sm font-mono border border-white/5 ${j < data.inputs.length ? 'text-gray-300' : 'text-white font-bold'}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-dk-darker-bg/30 border-t border-white/5 flex justify-end gap-3">
          <button 
            onClick={onExportToCanvas}
            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-yellow-900/20"
          >
            Export to Canvas
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TruthTableModal;
