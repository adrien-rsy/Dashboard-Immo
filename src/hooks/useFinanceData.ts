import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Releve, LigneCompte, ObjectifPatrimoine } from '@/types/finance';

const LOCAL_KEY = 'immo_finance_v1';
const LOCAL_OBJ = 'immo_finance_objectif_v1';

function localLoadReleves(): Releve[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]'); } catch { return []; }
}
function localSaveReleves(r: Releve[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(r));
}
function localLoadObjectif(): ObjectifPatrimoine | null {
  try { return JSON.parse(localStorage.getItem(LOCAL_OBJ) ?? 'null'); } catch { return null; }
}
function localSaveObjectif(o: ObjectifPatrimoine) {
  localStorage.setItem(LOCAL_OBJ, JSON.stringify(o));
}

// Mappe les lignes DB vers le type Releve — inclut le champ previsionnel
function rowsToReleves(relRows: any[], ligneRows: any[]): Releve[] {
  return relRows.map((r) => ({
    id: r.id,
    date: r.date,
    note: r.note ?? undefined,
    previsionnel: r.previsionnel ?? false,
    lignes: ligneRows
      .filter((l) => l.releve_id === r.id)
      .map((l) => ({
        id: l.id,
        nom: l.nom,
        categorie: l.categorie,
        montant: Number(l.montant),
      })) as LigneCompte[],
  }));
}

export function useFinanceData() {
  const [releves, setReleves] = useState<Releve[]>([]);
  const [objectif, setObjectif] = useState<ObjectifPatrimoine | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'supabase' | 'local' | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const { error: testErr } = await supabase
        .from('finance_releves')
        .select('id', { count: 'exact', head: true });

      if (testErr) {
        console.warn('[Finance] Supabase indisponible, mode localStorage', testErr.message);
        setMode('local');
        setReleves(localLoadReleves());
        setObjectif(localLoadObjectif());
        setLoading(false);
        return;
      }

      setMode('supabase');

      const [{ data: rData, error: rErr }, { data: lData, error: lErr }, { data: oData }] =
        await Promise.all([
          supabase.from('finance_releves').select('*').order('date', { ascending: false }),
          supabase.from('finance_lignes').select('*'),
          supabase.from('finance_objectif').select('*').limit(1).maybeSingle(),
        ]);

      if (rErr) console.error('[Finance] Erreur chargement relevés', rErr);
      if (lErr) console.error('[Finance] Erreur chargement lignes', lErr);

      setReleves(rowsToReleves(rData ?? [], lData ?? []));
      if (oData) {
        setObjectif({ montant: Number(oData.montant), label: (oData as any).label ?? undefined });
      }

      setLoading(false);
    })();
  }, []);

  // ─── Add ───────────────────────────────────────────────────────────────────────────────
  const addReleve = useCallback(async (data: Omit<Releve, 'id'>) => {
    if (mode === 'local') {
      const newR: Releve = { ...data, id: `r_${Date.now()}` };
      const updated = [newR, ...releves];
      setReleves(updated);
      localSaveReleves(updated);
      return;
    }

    const { data: inserted, error } = await supabase
      .from('finance_releves')
      .insert({
        date: data.date,
        note: data.note ?? null,
        previsionnel: data.previsionnel ?? false,   // ← champ persisté
      })
      .select()
      .single();

    if (error || !inserted) {
      console.error('[Finance] Erreur insert relevé', error);
      return;
    }

    if (data.lignes.length > 0) {
      const { error: lErr } = await supabase.from('finance_lignes').insert(
        data.lignes.map((l) => ({
          id: l.id,
          releve_id: inserted.id,
          nom: l.nom,
          categorie: l.categorie,
          montant: l.montant,
        }))
      );
      if (lErr) console.error('[Finance] Erreur insert lignes', lErr);
    }

    const newR: Releve = { ...data, id: inserted.id };
    setReleves((prev) => [newR, ...prev]);
  }, [mode, releves]);

  // ─── Update ──────────────────────────────────────────────────────────────────────────
  const updateReleve = useCallback(async (id: string, data: Omit<Releve, 'id'>) => {
    if (mode === 'local') {
      const updated = releves.map((r) => (r.id === id ? { ...data, id } : r));
      setReleves(updated);
      localSaveReleves(updated);
      return;
    }

    const { error: uErr } = await supabase
      .from('finance_releves')
      .update({
        date: data.date,
        note: data.note ?? null,
        previsionnel: data.previsionnel ?? false,   // ← champ persisté
      })
      .eq('id', id);
    if (uErr) console.error('[Finance] Erreur update relevé', uErr);

    await supabase.from('finance_lignes').delete().eq('releve_id', id);

    if (data.lignes.length > 0) {
      await supabase.from('finance_lignes').insert(
        data.lignes.map((l) => ({
          id: l.id,
          releve_id: id,
          nom: l.nom,
          categorie: l.categorie,
          montant: l.montant,
        }))
      );
    }

    setReleves((prev) => prev.map((r) => (r.id === id ? { ...data, id } : r)));
  }, [mode, releves]);

  // ─── Delete ──────────────────────────────────────────────────────────────────────────
  const deleteReleve = useCallback(async (id: string) => {
    if (mode === 'local') {
      const updated = releves.filter((r) => r.id !== id);
      setReleves(updated);
      localSaveReleves(updated);
      return;
    }
    await supabase.from('finance_lignes').delete().eq('releve_id', id);
    await supabase.from('finance_releves').delete().eq('id', id);
    setReleves((prev) => prev.filter((r) => r.id !== id));
  }, [mode, releves]);

  // ─── Objectif ─────────────────────────────────────────────────────────────────────────
  const saveObjectif = useCallback(async (obj: ObjectifPatrimoine) => {
    setObjectif(obj);
    localSaveObjectif(obj);

    if (mode !== 'supabase') return;

    const { data: existing } = await supabase
      .from('finance_objectif')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('finance_objectif')
        .update({ montant: obj.montant, label: (obj as any).label ?? null })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('finance_objectif')
        .insert({ montant: obj.montant, label: (obj as any).label ?? null });
    }
  }, [mode]);

  return {
    releves, objectif, loading,
    isSupabase: mode === 'supabase',
    addReleve, updateReleve, deleteReleve, saveObjectif,
  };
}
