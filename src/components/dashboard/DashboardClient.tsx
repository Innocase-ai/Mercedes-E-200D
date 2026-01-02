
"use client";

import React, { useState, useEffect } from 'react';

import { MaintenanceTask, ServiceHistory, Expense } from '@/lib/types';
import Header from './Header';
import StatsCard from './StatsCard';
import AiDiagnosis from './AiDiagnosis';
import MaintenanceList from './MaintenanceList';
import MileageUpdateModal from './MileageUpdateModal';
import InvoiceScanModal from './InvoiceScanModal';
import ExpensesTable from './ExpensesTable';
import MaintenanceAlert from './MaintenanceAlert';
import { getAiDiagnosis } from '@/ai/flows/ai-powered-diagnosis';
import { fetchMaintenanceTasks, fetchCarData, saveCarData, saveInvoice, fetchExpenses } from '@/actions/car-data';
import { analyzeInvoice as analyzeInvoiceFlow } from '@/ai/flows/invoice-analysis';
import { speakMaintenanceAlerts } from '@/ai/flows/speak-maintenance-alerts';
import { useToast } from "@/hooks/use-toast"
import { calculateMaintenanceStatus, formatMileage } from '@/lib/utils';

interface DashboardClientProps {
  carImageUrl: string;
  maintenanceTasks: MaintenanceTask[];
}

export default function DashboardClient({ carImageUrl, maintenanceTasks: initialTasks }: DashboardClientProps) {
  // Use simple state instead of local storage
  const [currentMileage, setCurrentMileage] = useState(47713);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory>({});
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(initialTasks);

  // Track if we have synced with the server to prevent overwriting cloud data with defaults
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // ... (modals state)
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);

  // ... (AI state)
  const [aiDiagnosis, setAiDiagnosis] = useState("");
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [invoiceFeedback, setInvoiceFeedback] = useState("");

  const [isClient, setIsClient] = useState(false);

  const { toast } = useToast();

  // Keep a ref for the audio object to prevent memory leaks and manage playback
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsClient(true);
    return () => {
      // Cleanup audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Sync with Airtable on mount
  useEffect(() => {
    const initCloudSync = async () => {
      // 1. Fetch Maintenance Tasks if missing (client-side fallback for Cloud Run SSR issues)
      if (maintenanceTasks.length === 0) {
        console.log("Client Side: Re-fetching maintenance tasks...");
        const tasks = await fetchMaintenanceTasks();
        setMaintenanceTasks(tasks);
      }

      // 2. Fetch Car Data
      const cloudData = await fetchCarData();
      if (cloudData) {
        if (cloudData.mileage > 0) setCurrentMileage(cloudData.mileage);
        if (Object.keys(cloudData.history).length > 0) setServiceHistory(cloudData.history);
      }

      // 3. Fetch Expenses
      const cloudExpenses = await fetchExpenses();
      setExpenses(cloudExpenses);

      setIsDataLoaded(true);
    };
    initCloudSync();
  }, [maintenanceTasks.length]);

  // Save to Airtable on changes (debounced), ONLY if data is loaded
  useEffect(() => {
    if (!isClient || !isDataLoaded) return;

    const timer = setTimeout(async () => {
      console.log("Auto-saving to Airtable...", { currentMileage });
      const success = await saveCarData(currentMileage, serviceHistory);
      if (success) {
        console.log("Auto-save success");
        toast({
          title: "Sauvegarde réussie",
          description: "Vos données ont été synchronisées avec Airtable.",
          duration: 2000,
        });
      } else {
        console.error("Auto-save failed");
        toast({
          variant: "destructive",
          title: "Erreur de sauvegarde",
          description: "Impossible de synchroniser avec Airtable.",
        });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentMileage, serviceHistory, isClient, isDataLoaded, toast]);


  // ... (rest of code)

  // Performance Optimization: Memoize the sorted tasks list
  const sortedTasks = React.useMemo(() => {
    if (!maintenanceTasks || maintenanceTasks.length === 0) return [];

    return [...maintenanceTasks].sort((a, b) => {
      const lastA = serviceHistory[a.id] || 0;
      const lastB = serviceHistory[b.id] || 0;
      const statusA = calculateMaintenanceStatus(lastA, a.interval, currentMileage);
      const statusB = calculateMaintenanceStatus(lastB, b.interval, currentMileage);

      const order: Record<string, number> = { 'RETARD': 0, 'PROCHE': 1, 'OK': 2 };
      const valA = order[statusA.status] ?? 2;
      const valB = order[statusB.status] ?? 2;

      if (valA !== valB) return valA - valB;
      return statusA.remaining - statusB.remaining;
    });
  }, [maintenanceTasks, serviceHistory, currentMileage]);

  const handleAiDiagnosis = async () => {
    setIsDiagnosing(true);
    setAiDiagnosis("");

    const tasksStatus = sortedTasks.map(t => {
      const lastDone = serviceHistory[t.id] || 0;
      const statusData = calculateMaintenanceStatus(lastDone, t.interval, currentMileage);
      return `- ${t.name}: ${statusData.remaining}km restants (${statusData.status}, Prévu vers ${statusData.estimatedDate})`;
    }).join('\n');

    try {
      const result = await getAiDiagnosis({ currentMileage, tasksStatus });
      setAiDiagnosis(result.diagnosis);
    } catch (error) {
      setAiDiagnosis("Impossible de contacter l'assistant expert pour le moment.");
      toast({
        variant: "destructive",
        title: "Erreur d'analyse IA",
        description: "La connexion avec l'assistant expert a échoué.",
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleInvoiceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // QA Fix: Limit size to 10MB to prevent browser memory issues with Large Data URIs
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Fichier trop volumineux",
          description: "Veuillez sélectionner un fichier de moins de 10 Mo.",
        });
        return;
      }

      const reader = new FileReader();

      reader.onloadstart = () => setIsScanning(true);

      reader.onloadend = () => {
        setIsScanning(false);
        setSelectedFile(reader.result as string);
      };

      reader.onerror = () => {
        setIsScanning(false);
        toast({
          variant: "destructive",
          title: "Erreur de lecture",
          description: "Impossible de lire le fichier sélectionné.",
        });
      };

      reader.readAsDataURL(file);
    }
  };

  const analyzeInvoice = async () => {
    if (!selectedFile) return;
    setIsScanning(true);
    setInvoiceFeedback("");

    try {
      const result = await analyzeInvoiceFlow({ invoiceDataUri: selectedFile });

      // Update UI feedback
      setInvoiceFeedback(`[${result.type}] ${result.label}\n\n${result.analysis}`);

      // Save structured analysis to Airtable
      await saveInvoice(result);

      // Refresh expenses list
      const updatedExpenses = await fetchExpenses();
      setExpenses(updatedExpenses);

    } catch (error) {
      setInvoiceFeedback("Erreur lors de l'analyse. Veuillez réessayer.");
      toast({
        variant: "destructive",
        title: "Erreur d'analyse",
        description: "L'IA n'a pas pu traiter ce document.",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const speakAlerts = async () => {
    // Proactive memory check: stop current audio if needed
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsSpeaking(true);
    const criticalTasks = maintenanceTasks.filter(t => {
      const lastDone = serviceHistory[t.id] || 0;
      const nextDue = lastDone + t.interval;
      return (nextDue - currentMileage) <= 2000;
    });

    let message = `Bonjour Sébastien. Votre Mercedes affiche ${formatMileage(currentMileage)}. `;
    if (criticalTasks.length > 0) {
      message += `Attention, vous avez ${criticalTasks.length} entretiens prioritaires : ${criticalTasks.map(t => t.name).join(' et ')}. Veuillez consulter votre garage à Soignies prochainement.`;
    } else {
      message += "Tous vos systèmes sont au vert. Bonne route.";
    }

    try {
      const { media } = await speakMaintenanceAlerts(message);
      const audio = new Audio(media);
      audioRef.current = audio;
      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
      };
      audio.play();
    } catch (error) {
      console.error("TTS error", error);
      setIsSpeaking(false);
      toast({
        variant: "destructive",
        title: "Erreur Audio",
        description: "Impossible de générer l'alerte vocale.",
      });
    }
  };

  const updateMileage = (newMileage: number) => {
    if (newMileage >= (currentMileage || 0)) {
      setCurrentMileage(newMileage);
      setShowUpdateModal(false);
      toast({
        title: "Compteur mis à jour",
        description: `Le nouveau kilométrage (${newMileage.toLocaleString()} km) a été enregistré.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erreur de kilométrage",
        description: "Le nouveau kilométrage doit être supérieur ou égal à l'actuel.",
      });
    }
  };

  const markDone = (id: string) => {
    setServiceHistory({ ...serviceHistory, [id]: currentMileage });
  };

  const resetInvoiceScan = () => {
    setSelectedFile(null);
    setInvoiceFeedback("");
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans pb-32">
      <Header
        carImageUrl={carImageUrl}
        onScanClick={() => setShowScanModal(true)}
      />

      <div className="p-4 sm:p-6">
        <StatsCard
          currentMileage={currentMileage}
          isClient={isClient}
          isSpeaking={isSpeaking}
          onUpdateClick={() => setShowUpdateModal(true)}
          onSpeakClick={speakAlerts}
        />
      </div>

      <MaintenanceAlert
        tasks={maintenanceTasks}
        currentMileage={currentMileage}
        serviceHistory={serviceHistory}
      />

      <AiDiagnosis
        aiDiagnosis={aiDiagnosis}
        isDiagnosing={isDiagnosing}
        onDiagnoseClick={handleAiDiagnosis}
      />

      <MaintenanceList
        tasks={sortedTasks}
        currentMileage={currentMileage}
        serviceHistory={serviceHistory}
        onMarkDone={markDone}
      />

      <div className="p-4 sm:p-6 pb-20">
        <ExpensesTable expenses={expenses} />
      </div>

      <MileageUpdateModal
        open={showUpdateModal}
        onOpenChange={setShowUpdateModal}
        currentMileage={currentMileage}
        onUpdateMileage={updateMileage}
      />

      <InvoiceScanModal
        open={showScanModal}
        onOpenChange={setShowScanModal}
        selectedFile={selectedFile}
        isScanning={isScanning}
        invoiceFeedback={invoiceFeedback}
        onFileChange={handleInvoiceFile}
        onAnalyze={analyzeInvoice}
        onReset={resetInvoiceScan}
      />
    </div>
  );
}
