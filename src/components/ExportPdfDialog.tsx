import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Download, FileText, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { usePdfExport } from '@/hooks/usePdfExport';

interface Scenario {
  id: string;
  name: string;
  isDefault?: boolean;
}

interface ExportPdfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: any;
  scenarios: Scenario[];
  calculateTotals: (scenarioId: string) => any;
}

const ExportPdfDialog: React.FC<ExportPdfDialogProps> = ({
  open,
  onOpenChange,
  project,
  scenarios,
  calculateTotals,
}) => {
  const defaultScenarioId = scenarios.find(s => s.isDefault)?.id || scenarios[0]?.id;

  const [selectedIds, setSelectedIds] = useState<string[]>(
    scenarios.map(s => s.id)
  );
  const [mainScenarioId, setMainScenarioId] = useState<string>(defaultScenarioId || '');

  const { exportPdf, isExporting } = usePdfExport();

  const selectedScenarios = useMemo(
    () => scenarios.filter(s => selectedIds.includes(s.id)),
    [scenarios, selectedIds]
  );

  const toggleScenario = (id: string) => {
    setSelectedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      // If we deselect the current main scenario, pick the first remaining
      if (!next.includes(mainScenarioId) && next.length > 0) {
        setMainScenarioId(next[0]);
      }
      return next;
    });
  };

  const handleExport = async () => {
    await exportPdf({
      project,
      selectedScenarioIds: selectedIds,
      mainScenarioId,
      calculateTotals,
    });
    onOpenChange(false);
  };

  const canExport = selectedIds.length > 0 && mainScenarioId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] rounded-2xl p-0 border-none shadow-2xl max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-[560px] sm:w-[560px] sm:rounded-[2rem]">
        <DialogHeader className="p-8 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-black rounded-xl">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black">Exporter en PDF</DialogTitle>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Choisissez les scénarios à inclure dans le rapport.
          </p>
        </DialogHeader>

        <div className="p-8 space-y-8">
          {/* Scenario selection */}
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Scénarios à inclure
            </Label>
            <div className="space-y-2">
              {scenarios.map(scenario => {
                const checked = selectedIds.includes(scenario.id);
                return (
                  <button
                    key={scenario.id}
                    onClick={() => toggleScenario(scenario.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                      checked
                        ? 'border-black bg-black/5'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="w-5 h-5 text-black flex-shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                    <span className="font-semibold text-sm flex-1">{scenario.name}</span>
                    {scenario.isDefault && (
                      <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                        Défaut
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedIds.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-red-500 mt-2">
                <AlertCircle className="w-4 h-4" />
                <span>Sélectionnez au moins un scénario.</span>
              </div>
            )}
          </div>

          {/* Main scenario selector */}
          {selectedIds.length > 0 && (
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Scénario principal du rapport
              </Label>
              <div className="space-y-2">
                {selectedScenarios.map(scenario => (
                  <button
                    key={scenario.id}
                    onClick={() => setMainScenarioId(scenario.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                      mainScenarioId === scenario.id
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      mainScenarioId === scenario.id
                        ? 'border-white bg-white'
                        : 'border-gray-400'
                    }`}>
                      {mainScenarioId === scenario.id && (
                        <div className="w-2 h-2 rounded-full bg-black" />
                      )}
                    </div>
                    <span className="font-semibold text-sm">{scenario.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-8 pt-0">
          <button
            onClick={handleExport}
            disabled={!canExport || isExporting}
            className="w-full py-4 bg-black text-white rounded-2xl font-bold shadow-xl shadow-black/20 hover:bg-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Génération en cours…
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Générer le PDF
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportPdfDialog;
