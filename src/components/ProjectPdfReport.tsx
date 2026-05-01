import React from 'react';
import { MapPin, Calendar, Briefcase, TrendingUp, Euro, BarChart3 } from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

interface PdfScenarioBlockProps {
  scenario: any;
  totals: any;
  lots: any[];
  costs: any[];
  isMain: boolean;
}

const CostRow: React.FC<{ label: string; value: number; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0',
    fontWeight: highlight ? 700 : 400,
  }}>
    <span style={{ color: '#666', fontSize: 13 }}>{label}</span>
    <span style={{ fontWeight: highlight ? 700 : 600, fontSize: 13, color: highlight ? '#000' : '#333' }}>{fmt(value)}</span>
  </div>
);

const KpiCard: React.FC<{ label: string; value: string; sub?: string; accent?: boolean }> = ({ label, value, sub, accent }) => (
  <div style={{
    background: accent ? '#000' : '#fff',
    color: accent ? '#fff' : '#000',
    borderRadius: 16,
    padding: '20px 24px',
    border: accent ? 'none' : '1.5px solid #ebebeb',
    flex: 1,
  }}>
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: accent ? 'rgba(255,255,255,0.6)' : '#999', marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: accent ? 'rgba(255,255,255,0.55)' : '#aaa', marginTop: 6 }}>{sub}</div>}
  </div>
);

const PdfScenarioBlock: React.FC<PdfScenarioBlockProps> = ({ scenario, totals, lots, costs, isMain }) => {
  const relevantCosts = costs.filter((c: any) => c.isGlobal || c.targetScenarioId === scenario.id);

  const displayCosts = relevantCosts.map((cost: any) => {
    if (cost.type === 'notaire') return { ...cost, values: { [scenario.id]: totals.calculatedCosts.notaire } };
    if (cost.type === 'agence') return { ...cost, values: { [scenario.id]: totals.calculatedCosts.agence } };
    if (cost.type === 'finance') return { ...cost, values: { [scenario.id]: totals.calculatedCosts.finance } };
    return cost;
  });

  return (
    <div style={{ marginBottom: isMain ? 48 : 32 }}>
      {/* Scenario header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          background: isMain ? '#000' : '#f4f4f4',
          color: isMain ? '#fff' : '#333',
          borderRadius: 100,
          padding: '6px 16px',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 0.5,
        }}>
          {isMain ? '★ ' : ''}{scenario.name}
        </div>
        {isMain && (
          <span style={{ fontSize: 11, color: '#999', fontWeight: 600 }}>Scénario principal</span>
        )}
      </div>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <KpiCard label="Chiffre d'affaires" value={fmt(totals.caTotal)} accent={isMain} />
        <KpiCard label="Coût total" value={fmt(totals.costTotal)} />
        <KpiCard
          label="Marge nette"
          value={fmt(totals.margin)}
          sub={fmtPct(totals.profitability) + ' de rentabilité'}
          accent={!isMain}
        />
      </div>

      {/* Lots table */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1.5px solid #ebebeb',
        overflow: 'hidden',
        marginBottom: 20,
      }}>
        <div style={{ padding: '14px 20px', borderBottom: '1.5px solid #ebebeb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.3 }}>Lots</span>
          <span style={{ fontSize: 12, color: '#999' }}>{lots.length} lot{lots.length > 1 ? 's' : ''}</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              <th style={{ padding: '10px 20px', textAlign: 'left', fontWeight: 700, color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Lot</th>
              <th style={{ padding: '10px 20px', textAlign: 'left', fontWeight: 700, color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Type</th>
              <th style={{ padding: '10px 20px', textAlign: 'right', fontWeight: 700, color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Surface</th>
              <th style={{ padding: '10px 20px', textAlign: 'right', fontWeight: 700, color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Prix</th>
            </tr>
          </thead>
          <tbody>
            {lots.map((lot: any, i: number) => (
              <tr key={lot.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '10px 20px', fontWeight: 600 }}>{lot.name || `Lot ${i + 1}`}</td>
                <td style={{ padding: '10px 20px', color: '#666' }}>{lot.type || '—'}</td>
                <td style={{ padding: '10px 20px', textAlign: 'right', color: '#666' }}>{lot.surface ? `${lot.surface} m²` : '—'}</td>
                <td style={{ padding: '10px 20px', textAlign: 'right', fontWeight: 700 }}>{fmt(lot.prices?.[scenario.id] || 0)}</td>
              </tr>
            ))}
            <tr style={{ background: '#f4f4f4', borderTop: '2px solid #ebebeb' }}>
              <td colSpan={3} style={{ padding: '12px 20px', fontWeight: 700, fontSize: 13 }}>Total</td>
              <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 900, fontSize: 14 }}>{fmt(totals.caTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Cost breakdown */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1.5px solid #ebebeb',
        padding: '0 20px',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 0', borderBottom: '1.5px solid #ebebeb', marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.3 }}>Détail des coûts</span>
        </div>
        {displayCosts.map((cost: any) => (
          <CostRow
            key={cost.id}
            label={cost.label}
            value={cost.values?.[scenario.id] || 0}
          />
        ))}
        <div style={{ padding: '14px 0', borderTop: '2px solid #000', marginTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 14 }}>
            <span>Total des coûts</span>
            <span>{fmt(totals.costTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProjectPdfReportProps {
  project: any;
  selectedScenarioIds: string[];
  mainScenarioId: string;
  calculateTotals: (scenarioId: string) => any;
}

const ProjectPdfReport = React.forwardRef<HTMLDivElement, ProjectPdfReportProps>(
  ({ project, selectedScenarioIds, mainScenarioId, calculateTotals }, ref) => {
    const mainScenario = project.scenarios.find((s: any) => s.id === mainScenarioId);
    const otherScenarios = project.scenarios.filter(
      (s: any) => selectedScenarioIds.includes(s.id) && s.id !== mainScenarioId
    );
    const mainTotals = calculateTotals(mainScenarioId);

    return (
      <div
        ref={ref}
        style={{
          width: 900,
          minHeight: 1100,
          background: '#f7f6f2',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          padding: 48,
          boxSizing: 'border-box',
          color: '#000',
        }}
      >
        {/* Header */}
        <div style={{
          background: '#000',
          borderRadius: 20,
          padding: '32px 40px',
          marginBottom: 32,
          color: '#fff',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
                Rapport d'opération
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, lineHeight: 1.1, marginBottom: 16 }}>
                {project.metadata.title}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                {project.metadata.address && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>📍</span>
                    <span>{project.metadata.address}</span>
                  </div>
                )}
                {project.metadata.startDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>📅</span>
                    <span>Début : {new Date(project.metadata.startDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
                {project.metadata.status && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>💼</span>
                    <span>{project.metadata.status}</span>
                  </div>
                )}
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1.5px solid rgba(255,255,255,0.15)',
              borderRadius: 12,
              padding: '10px 18px',
              fontSize: 11,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: 0.5,
              whiteSpace: 'nowrap',
            }}>
              {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Main scenario */}
        {mainScenario && (
          <PdfScenarioBlock
            scenario={mainScenario}
            totals={mainTotals}
            lots={project.lots}
            costs={project.costs}
            isMain={true}
          />
        )}

        {/* Divider if other scenarios */}
        {otherScenarios.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 32,
          }}>
            <div style={{ flex: 1, height: 1, background: '#ddd' }} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#aaa' }}>
              Autres scénarios
            </span>
            <div style={{ flex: 1, height: 1, background: '#ddd' }} />
          </div>
        )}

        {/* Other scenarios */}
        {otherScenarios.map((scenario: any) => (
          <PdfScenarioBlock
            key={scenario.id}
            scenario={scenario}
            totals={calculateTotals(scenario.id)}
            lots={project.lots}
            costs={project.costs}
            isMain={false}
          />
        ))}

        {/* Footer */}
        <div style={{
          marginTop: 48,
          paddingTop: 20,
          borderTop: '1.5px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: '#bbb',
        }}>
          <span>Dashboard-Immo — Document confidentiel</span>
          <span>Généré le {new Date().toLocaleDateString('fr-FR')}</span>
        </div>
      </div>
    );
  }
);

ProjectPdfReport.displayName = 'ProjectPdfReport';
export default ProjectPdfReport;
