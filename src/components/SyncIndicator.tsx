"use client";

import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, UploadCloud } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const SyncIndicator = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [hasLocalData, setHasLocalData] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      const configured = isSupabaseConfigured();
      setIsOnline(configured);
      
      const projects = localStorage.getItem('immo_projects_v9');
      const prospects = localStorage.getItem('immo_prospects_v2');
      // On considère qu'il y a des données locales si les clés existent et ne sont pas des tableaux vides
      const hasProjects = projects && JSON.parse(projects).length > 0;
      const hasProspects = prospects && JSON.parse(prospects).length > 0;
      setHasLocalData(!!(hasProjects || hasProspects));
    };

    checkStatus();
    // On vérifie régulièrement ou lors de changements de storage
    const interval = setInterval(checkStatus, 5000);
    window.addEventListener('storage', checkStatus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkStatus);
    };
  }, []);

  const handleSync = async () => {
    if (!isOnline) return;
    setSyncing(true);
    try {
      // Migration des projets
      const localProjects = JSON.parse(localStorage.getItem('immo_projects_v9') || '[]');
      if (localProjects.length > 0) {
        for (const proj of localProjects) {
          // On upsert dans Supabase
          const { error } = await supabase.from('projects').upsert({
            metadata: proj.metadata,
            lots: proj.lots,
            scenarios: proj.scenarios,
            costs: proj.costs
          });
          if (error) throw error;
        }
      }

      // Migration des prospects
      const localProspects = JSON.parse(localStorage.getItem('immo_prospects_v2') || '[]');
      if (localProspects.length > 0) {
        const { error } = await supabase.from('prospects').upsert(
          localProspects.map((p: any) => ({
            title: p.title,
            phone: p.phone,
            notes: p.notes,
            link: p.link,
            status: p.status
          }))
        );
        if (error) throw error;
      }

      showSuccess("Synchronisation cloud terminée !");
      
      // On vide le local storage après succès pour éviter les doublons au prochain chargement
      localStorage.removeItem('immo_projects_v9');
      localStorage.removeItem('immo_prospects_v2');
      setHasLocalData(false);
      
      // On recharge la page pour rafraîchir les données depuis Supabase
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      showError(`Erreur : ${error.message || "Vérifiez vos tables Supabase"}`);
    } finally {
      setSyncing(false);
    }
  };

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-100 shadow-sm">
        <CloudOff className="w-3 h-3" />
        Mode Local
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {hasLocalData && (
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-gray-800 transition-all shadow-md"
        >
          <UploadCloud className={cn("w-3 h-3", syncing && "animate-spin")} />
          {syncing ? "Synchro..." : "Envoyer vers Cloud"}
        </button>
      )}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-100">
        <Cloud className="w-3 h-3" />
        Cloud Actif
      </div>
    </div>
  );
};

export default SyncIndicator;
