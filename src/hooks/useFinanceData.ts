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

// ─── helpers Supabase → types internes ────────────────────────────────────────

function rowsToReleves(
  releves: any[],
  lignes: any[]
): Releve[] {
  return releves.map((r) => ({
    id: r.id,
    date: r.date,
    note: r.note ?? undefined,
    lignes: lignes
      .filter((l) => l.releve_id === r.id)
      .map((l) => ({
        id: l.id,
        nom: l.nom,
        categorie: l.categorie,
        montant: Number(l.montant),
      })),
  }));
}

export function useFinanceData() {
  const [releves, setReleves] = useState<Releve[]>([]);
  const [objectif, setObjectif] = useState<ObjectifPatrimoine | null>(null);
  const [loading, setLoading] = useState(true);
  const [useSupabase, setUseSupabase] = useState(false);

  // ─── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Test Supabase connectivity
        const { error: pingErr } = await supabase
          .from('finance_releves')
          .select('id')
          .limit(1);

        if (pingErr) throw pingErr;

        setUseSupabase(true);

        // Load releves + lignes
        const [{ data: rData }, { data: lData }, { data: oData }] = await Promise.all([
          supabase.from('finance_releves').select('*').order('date', { ascending: false }),
          supabase.from('finance_lignes').select('*'),
          supabase.from('finance_objectif').select('*').limit(1).maybeSingle(),
        ]);

        setReleves(rowsToReleves(rData ?? [], lData ?? []));
        if (oData) setObjectif({ montant: Number(oData.montant), label: oData.label ?? undefined });
        else setObjectif(localLoadObjectif());
      } catch {
        // Fallback localStorage
        setUseSupabase(false);
        setReleves(localLoadReleves());
        setObjectif(localLoadObjectif());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ─── Add releve ──────────────────────────────────────────────────────────────
  const addReleve = useCallback(async (data: Omit<Releve, 'id'>) => {
    const tempId = `r_${Date.now()}`;
    const newReleve: Releve = { ...data, id: tempId };

    if (!useSupabase) {
      const updated = [newReleve, ...releves];
      setReleves(updated);
      localSaveReleves(updated);
      return;
    }

    const { data: inserted, error } = await supabase
      .from('finance_releves')
      .insert({ date: data.date, note: data.note ?? null })
      .select()
      .single();

    if (error || !inserted) return;

    if (data.lignes.length > 0) {
      await supabase.from('finance_lignes').insert(
        data.lignes.map((l) => ({
          id: l.id,
          releve_id: inserted.id,
          nom: l.nom,
          categorie: l.categorie,
          montant: l.montant,
        }))
      );
    }

    const finalReleve: Releve = { ...data, id: inserted.id };
    setReleves((prev) => [finalReleve, ...prev]);
  }, [useSupabase, releves]);

  // ─── Update releve ───────────────────────────────────────────────────────────
  const updateReleve = useCallback(async (id: string, data: Omit<Releve, 'id'>) => {
    if (!useSupabase) {
      const updated = releves.map((r) => (r.id === id ? { ...data, id } : r));
      setReleves(updated);
      localSaveReleves(updated);
      return;
    }

    await supabase
      .from('finance_releves')
      .update({ date: data.date, note: data.note ?? null })
      .eq('id', id);

    // Replace all lignes for this releve
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
  }, [useSupabase, releves]);

  // ─── Delete releve ───────────────────────────────────────────────────────────
  const deleteReleve = useCallback(async (id: string) => {
    if (!useSupabase) {
      const updated = releves.filter((r) => r.id !== id);
      setReleves(updated);
      localSaveReleves(updated);
      return;
    }
    await supabase.from('finance_lignes').delete().eq('releve_id', id);
    await supabase.from('finance_releves').delete().eq('id', id);
    setReleves((prev) => prev.filter((r) => r.id !== id));
  }, [useSupabase, releves]);

  // ─── Save objectif ───────────────────────────────────────────────────────────
  const saveObjectif = useCallback(async (obj: ObjectifPatrimoine) => {
    setObjectif(obj);
    localSaveObjectif(obj);

    if (!useSupabase) return;

    const { data: existing } = await supabase
      .from('finance_objectif')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('finance_objectif')
        .update({ montant: obj.montant, label: obj.label ?? null })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('finance_objectif')
        .insert({ montant: obj.montant, label: obj.label ?? null });
    }
  }, [useSupabase]);

  return { releves, objectif, loading, useSupabase, addReleve, updateReleve, deleteReleve, saveObjectif };
}
