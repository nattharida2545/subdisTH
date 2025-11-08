import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { useQueueTypes } from '@/hooks/useQueueTypes';
import { useServicePoints } from '@/hooks/useServicePoints';
import { useAllServicePointQueueTypes } from '@/hooks/useServicePointQueueTypes';
import { useQueryClient } from '@tanstack/react-query';
import { createLogger } from '@/utils/logger';
import { simulationLogger } from '@/utils/simulationLogger';
import { useProgressiveQueueProcessing } from './useProgressiveQueueProcessing';
import { useIntelligentDecisionPoint } from './useIntelligentDecisionPoint';
import { simulationModeEmitter } from '@/hooks/useSimulationModeSync';

const logger = createLogger('AnalyticsSimulationV2');

export type SimulationPhase = 'IDLE' | 'PREPARING' | 'PREPARED' | 'RUNNING_30' | 'PAUSE_30' | 'RUNNING_70' | 'PAUSE_70' | 'RUNNING_100' | 'COMPLETED';

export interface AlgorithmMetrics {
  algorithm: string;
  phase: string;
  avgWaitTime: number;
  throughput: number;
  completedQueues: number;
  processedInPhase: number;
  timestamp: string;
}

export interface SimulationStats {
  prepared: boolean;
  totalQueues: number;
  processedQueues: number;
  completedQueues: number;
  waitingQueues: number;
  avgWaitTime: number;
  isSimulationMode: boolean;
  queueTypeDistribution: Record<string, number>;
  servicePointDistribution: Record<string, number>;
  phase: SimulationPhase;
  progress: number;
  algorithmMetrics: AlgorithmMetrics[];
  currentAlgorithm: string;
  currentAnalysis?: any;
  recommendation?: any;
}

export const useAnalyticsSimulationV2 = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('MULTILEVEL');
  const [simulationStats, setSimulationStats] = useState<SimulationStats>({
    prepared: false,
    totalQueues: 0,
    processedQueues: 0,
    completedQueues: 0,
    waitingQueues: 0,
    avgWaitTime: 0,
    isSimulationMode: false,
    queueTypeDistribution: {},
    servicePointDistribution: {},
    phase: 'IDLE',
    progress: 0,
    algorithmMetrics: [],
    currentAlgorithm: 'MULTILEVEL' // Start with MULTILEVEL for mixed queue types
  });

  const queryClient = useQueryClient();
  const { fetchQueues } = useQueues();
  const { patients } = usePatients();
  const { queueTypes } = useQueueTypes();
  const { servicePoints } = useServicePoints();
  const { mappings } = useAllServicePointQueueTypes();

  const { processQueuesByPercentage } = useProgressiveQueueProcessing();
  const { analyzeCurrentQueues, generateRecommendation, getContextualInsights } = useIntelligentDecisionPoint();

  // Enhanced cleanup with comprehensive logging and verification
  const completeCleanup = useCallback(async () => {
    const startTime = Date.now();
    logger.info('🧹 ENHANCED CLEANUP STARTED - Complete data isolation cleanup');
    simulationLogger.log('CLEANUP_STARTED', 'CLEANUP', 'UNKNOWN', 'User initiated complete cleanup with verification');
    
    try {
      toast.info('🔍 กำลังค้นหาข้อมูลจำลองทั้งหมด...');
      
      // Step 1: Find ALL simulation queues with comprehensive search
      const { data: simulationQueues, error: simCheckError } = await supabase
        .from('queues')
        .select('id, notes, queue_date, created_at, status, type, number', { count: 'exact' })
        .like('notes', '%ข้อมูลจำลองโรงพยาบาล%');

      if (simCheckError) {
        logger.error('❌ Error checking simulation queues:', simCheckError);
        throw simCheckError;
      }

      let deletedCount = 0;
      if (simulationQueues && simulationQueues.length > 0) {
        toast.info(`🗑️ กำลังลบคิวจำลองทั้งหมด ${simulationQueues.length} คิว...`);
        
        // Step 2: Delete all simulation queues
        const { error: deleteSimError } = await supabase
          .from('queues')
          .delete()
          .like('notes', '%ข้อมูลจำลองโรงพยาบาล%');

        if (deleteSimError) {
          logger.error('❌ Error deleting simulation queues:', deleteSimError);
          throw deleteSimError;
        }
        
        deletedCount = simulationQueues.length;
        logger.info(`✅ Deleted ${deletedCount} simulation queues`);
      }

      // Step 3: Verify cleanup completion
      toast.info('🔍 กำลังตรวจสอบการล้างข้อมูล...');
      const { data: remainingQueues } = await supabase
        .from('queues')
        .select('id')
        .like('notes', '%ข้อมูลจำลองโรงพยาบาล%');

      if (remainingQueues && remainingQueues.length > 0) {
        logger.warn(`⚠️ Found ${remainingQueues.length} remaining simulation queues after cleanup`);
        throw new Error(`Cleanup incomplete: ${remainingQueues.length} simulation queues remain`);
      }

      // Step 4: Clear all caches and local storage
      try {
        localStorage.removeItem('queueAlgorithm');
        localStorage.removeItem('simulationMode');
        localStorage.removeItem('algorithmMetrics');
        localStorage.removeItem('simulationStats');
        sessionStorage.removeItem('simulationData');
      } catch (e) {
        logger.warn('LocalStorage/SessionStorage clear failed:', e);
      }

      // Step 5: Force complete cache refresh
      await queryClient.clear();
      await queryClient.invalidateQueries();
      await queryClient.refetchQueries({ queryKey: ['queues'] });
      await queryClient.refetchQueries({ queryKey: ['analytics'] });

      const duration = Date.now() - startTime;
      logger.info(`🎉 ENHANCED CLEANUP COMPLETED successfully in ${duration}ms`);
      
      simulationLogger.log('CLEANUP_COMPLETED', 'IDLE', 'FIFO', {
        deletedCount,
        duration: `${duration}ms`,
        verificationPassed: true,
        cleanupType: 'ENHANCED_WITH_VERIFICATION'
      });
      
      simulationLogger.clearLogs();

      // Immediately switch to real-time mode
      simulationModeEmitter.emit(false);
      
      if (deletedCount > 0) {
        toast.success(`🎉 ล้างข้อมูลเรียบร้อยแล้ว (ลบ ${deletedCount} คิว) - กลับสู่โหมดข้อมูลจริง`, { duration: 4000 });
      } else {
        toast.success('✨ ระบบสะอาดแล้ว - ไม่พบข้อมูลที่ต้องลบ', { duration: 4000 });
      }

      return deletedCount;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('💥 ENHANCED CLEANUP FAILED:', error);
      
      simulationLogger.log('CLEANUP_FAILED', 'ERROR', 'UNKNOWN', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`
      });
      
      throw error;
    }
  }, [queryClient]);

  // Create realistic simulation data with proper service point assignments
  const prepareSimulation = useCallback(async () => {
    setLoading(true);
    try {
      logger.info('Preparing comprehensive simulation with service point awareness...');
      toast.info('กำลังเตรียมข้อมูลจำลองแบบครอบคลุม...');

      if (!patients?.length || !queueTypes?.length || !servicePoints?.length) {
        toast.error('ต้องมีข้อมูลผู้ป่วย ประเภทคิว และจุดบริการก่อน');
        return;
      }

      // Complete cleanup first
      await completeCleanup();
      
      // Generate fresh realistic simulation data
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const enabledQueueTypes = queueTypes.filter(qt => qt.enabled);
      const enabledServicePoints = servicePoints.filter(sp => sp.enabled);

      if (enabledQueueTypes.length === 0) {
        toast.error('ไม่พบประเภทคิวที่เปิดใช้งาน');
        return;
      }

      logger.info(`Using ${enabledQueueTypes.length} queue types and ${enabledServicePoints.length} service points`);

      // Create realistic queue distribution (RANDOM 75-150 queues, ALL start as WAITING)
      const queues = [];
      const totalQueues = 75 + Math.floor(Math.random() * 76); // Random between 75-150
      const typeDistribution: Record<string, number> = {};
      const servicePointDistribution: Record<string, number> = {};

      // Initialize distribution counters
      enabledQueueTypes.forEach(qt => typeDistribution[qt.code] = 0);
      enabledServicePoints.forEach(sp => servicePointDistribution[sp.name] = 0);

      for (let i = 0; i < totalQueues; i++) {
        // Simulate realistic arrival times throughout the day (8 AM to 5 PM)
        const hour = 8 + Math.floor(Math.random() * 9);
        const minute = Math.floor(Math.random() * 60);
        const createdTime = new Date(today);
        createdTime.setHours(hour, minute, 0, 0);

        // Distribute queue types with realistic weights
        const queueType = getRealisticQueueType(enabledQueueTypes, i);
        typeDistribution[queueType.code]++;

        // Assign service point based on mappings or default assignment
        const servicePoint = findServicePointForQueueType(queueType, mappings, enabledServicePoints);
        if (servicePoint) {
          servicePointDistribution[servicePoint.name]++;
        }

        const patient = patients[Math.floor(Math.random() * patients.length)];

        // ALL queues start as WAITING - no pre-processing
        queues.push({
          patient_id: patient.id,
          type: queueType.code,
          number: typeDistribution[queueType.code],
          status: 'WAITING', // ALL start as waiting
          queue_date: todayStr,
          service_point_id: servicePoint?.id,
          created_at: createdTime.toISOString(),
          called_at: null, // Not called yet
          completed_at: null, // Not completed yet
          notes: `🔬 ข้อมูลจำลองโรงพยาบาล - ${queueType.name} (รอการประมวลผล)`
        });
      }

      logger.info('Queue type distribution:', typeDistribution);
      logger.info('Service point distribution:', servicePointDistribution);

      // Insert queues in batches
      const batchSize = 20;
      for (let i = 0; i < queues.length; i += batchSize) {
        const batch = queues.slice(i, i + batchSize);
        const { error } = await supabase
          .from('queues')
          .insert(batch);

        if (error) {
          logger.error('Error inserting batch:', error);
          throw error;
        }
      }

      // Update stats - all queues are waiting initially
      setSimulationStats({
        prepared: true,
        totalQueues: queues.length,
        processedQueues: 0,
        completedQueues: 0,
        waitingQueues: queues.length,
        avgWaitTime: 0,
        isSimulationMode: true,
        queueTypeDistribution: typeDistribution,
        servicePointDistribution,
        phase: 'PREPARED',
        progress: 0,
        algorithmMetrics: [],
        currentAlgorithm: selectedAlgorithm // Use selected algorithm
      });

      // Immediately switch to simulation mode
      simulationModeEmitter.emit(true);
      
      // Force refresh the queue data
      await queryClient.invalidateQueries({ queryKey: ['queues'] });
      await fetchQueues(true);
      
      logger.info(`Created ${queues.length} simulation queues (ALL WAITING) with proper service point assignments`);
      toast.success(`🔬 เตรียมข้อมูลจำลองเรียบร้อย (${queues.length} คิว ทั้งหมดรอการประมวลผล)`);

    } catch (error) {
      logger.error('Error preparing simulation:', error);
      toast.error(`เกิดข้อผิดพลาดในการเตรียมข้อมูล: ${error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ'}`);
    } finally {
      setLoading(false);
    }
  }, [patients, queueTypes, servicePoints, mappings, fetchQueues, completeCleanup, queryClient, selectedAlgorithm]);

  // Start progressive test - process exactly 30% of queues
  const startProgressiveTest = useCallback(async () => {
    if (!simulationStats.prepared) {
      toast.error('กรุณาเตรียมข้อมูลก่อนทดสอบ');
      return;
    }

    setIsRunning(true);
    setSimulationStats(prev => ({ ...prev, phase: 'RUNNING_30', progress: 0 }));
    
    // Ensure we're in simulation mode when starting
    simulationModeEmitter.emit(true);
    
    toast.info('เริ่มจำลองแบบก้าวหน้า - ประมวลผล 30% ของคิวทั้งหมด');

    try {
      logger.info('🚀 Starting Phase 1: Processing 0% → 30% of queues');
      simulationLogger.log('PHASE_1_START', 'RUNNING_30', simulationStats.currentAlgorithm, 'Starting phase 1 processing');

      // Process exactly 30% of queues using current algorithm
      const result = await processQueuesByPercentage(30, 0, simulationStats.currentAlgorithm, mappings);
      
      // Update stats and UI with progress animation
      const updateProgress = (progress: number) => {
        setSimulationStats(prev => ({ 
          ...prev, 
          progress,
          processedQueues: Math.floor((progress / 100) * prev.totalQueues),
        }));
      };
      
      // Animate progress from 0 to 30
      for (let i = 0; i <= 30; i += 2) {
        await new Promise(resolve => setTimeout(resolve, 50));
        updateProgress(i);
      }
      
      // Final update with actual results
      setSimulationStats(prev => ({ 
        ...prev, 
        phase: 'PAUSE_30', 
        progress: 30,
        processedQueues: result.processedCount,
        completedQueues: result.metrics.completedQueues,
        waitingQueues: result.remainingCount,
        avgWaitTime: result.metrics.avgWaitTime
      }));

      // Capture metrics for this phase
      const metrics: AlgorithmMetrics = {
        algorithm: simulationStats.currentAlgorithm,
        phase: 'PHASE_1',
        ...result.metrics,
        processedInPhase: result.processedCount,
        timestamp: new Date().toISOString()
      };

      setSimulationStats(prev => ({ 
        ...prev, 
        algorithmMetrics: [metrics]
      }));

      // Analyze current situation for intelligent recommendations
      const analysis = await analyzeCurrentQueues();
      const recommendation = generateRecommendation(simulationStats.currentAlgorithm, analysis, result.metrics);
      
      setSimulationStats(prev => ({ 
        ...prev, 
        currentAnalysis: analysis,
        recommendation
      }));

      await fetchQueues(true);
      setIsRunning(false);
      
      toast.success(`🎯 เฟส 1 เสร็จสิ้น (30%) - ประมวลผล ${result.processedCount} คิว, เสร็จสิ้น ${result.metrics.completedQueues} คิว`);
      
    } catch (error) {
      logger.error('Error during progressive simulation:', error);
      toast.error('เกิดข้อผิดพลาดในการทดสอบ');
      setIsRunning(false);
    }
  }, [simulationStats.prepared, simulationStats.currentAlgorithm, mappings, processQueuesByPercentage, analyzeCurrentQueues, generateRecommendation, fetchQueues]);

  // Continue to phase 2 (30% → 70%)
  const continueToPhase2 = useCallback(async (newAlgorithm?: string) => {
    const previousAlgorithm = simulationStats.currentAlgorithm;
    const finalAlgorithm = newAlgorithm || previousAlgorithm;
    
    // Log user decision
    simulationLogger.logDecision(
      30, 
      previousAlgorithm, 
      newAlgorithm ? 'change' : 'continue',
      finalAlgorithm,
      newAlgorithm ? `User changed from ${previousAlgorithm} to ${newAlgorithm}` : `User continued with ${previousAlgorithm}`
    );
    
    setIsRunning(true);
    setSimulationStats(prev => ({ 
      ...prev, 
      phase: 'RUNNING_70', 
      currentAlgorithm: finalAlgorithm 
    }));
    
    toast.info(`🔄 เฟส 2 (30% → 70%) ${newAlgorithm ? `เปลี่ยนเป็น ${newAlgorithm}` : 'ดำเนินต่อ'}`);

    try {
      logger.info(`🚀 Starting Phase 2: Processing 30% → 70% with ${finalAlgorithm}`);
      
      // Process next 40% of queues (from 30% to 70%)
      const result = await processQueuesByPercentage(70, 30, finalAlgorithm, mappings);
      
      // Animate progress from 30 to 70
      const updateProgress = (progress: number) => {
        setSimulationStats(prev => ({ 
          ...prev, 
          progress,
          processedQueues: Math.floor((progress / 100) * prev.totalQueues),
        }));
      };
      
      for (let i = 30; i <= 70; i += 2) {
        await new Promise(resolve => setTimeout(resolve, 50));
        updateProgress(i);
      }
      
      // Final update with actual results
      setSimulationStats(prev => ({ 
        ...prev, 
        phase: 'PAUSE_70', 
        progress: 70,
        processedQueues: prev.processedQueues + result.processedCount,
        completedQueues: result.metrics.completedQueues,
        waitingQueues: result.remainingCount,
        avgWaitTime: result.metrics.avgWaitTime
      }));

      // Capture metrics for phase 2
      const metrics: AlgorithmMetrics = {
        algorithm: finalAlgorithm,
        phase: 'PHASE_2',
        ...result.metrics,
        processedInPhase: result.processedCount,
        timestamp: new Date().toISOString()
      };

      setSimulationStats(prev => ({ 
        ...prev, 
        algorithmMetrics: [...prev.algorithmMetrics, metrics]
      }));

      // Update analysis and recommendation for final decision
      const analysis = await analyzeCurrentQueues();
      const recommendation = generateRecommendation(finalAlgorithm, analysis, result.metrics);
      
      setSimulationStats(prev => ({ 
        ...prev, 
        currentAnalysis: analysis,
        recommendation
      }));

      await fetchQueues(true);
      setIsRunning(false);
      
      toast.success(`🎯 เฟส 2 เสร็จสิ้น (70%) - ประมวลผล ${result.processedCount} คิวเพิ่มเติม`);
      
    } catch (error) {
      logger.error('Error in phase 2:', error);
      toast.error('เกิดข้อผิดพลาดในเฟส 2');
      setIsRunning(false);
    }
  }, [simulationStats.currentAlgorithm, mappings, processQueuesByPercentage, analyzeCurrentQueues, generateRecommendation, fetchQueues]);

  // Complete final phase (70% → 100%)
  const completeSimulation = useCallback(async (finalAlgorithm?: string) => {
    const previousAlgorithm = simulationStats.currentAlgorithm;
    const chosenAlgorithm = finalAlgorithm || previousAlgorithm;
    
    // Log user decision
    simulationLogger.logDecision(
      70, 
      previousAlgorithm, 
      finalAlgorithm ? 'change' : 'continue',
      chosenAlgorithm,
      finalAlgorithm ? `User changed from ${previousAlgorithm} to ${finalAlgorithm}` : `User continued with ${previousAlgorithm}`
    );
    
    setIsRunning(true);
    setSimulationStats(prev => ({ 
      ...prev, 
      phase: 'RUNNING_100', 
      currentAlgorithm: chosenAlgorithm 
    }));
    
    toast.info('🏁 เฟสสุดท้าย (70% → 100%) - จบการจำลอง');

    try {
      logger.info(`🚀 Starting Final Phase: Processing 70% → 100% with ${chosenAlgorithm}`);
      
      // Process remaining 30% of queues
      const result = await processQueuesByPercentage(100, 70, chosenAlgorithm, mappings);
      
      // Animate progress from 70 to 100
      const updateProgress = (progress: number) => {
        setSimulationStats(prev => ({ 
          ...prev, 
          progress,
          processedQueues: Math.floor((progress / 100) * prev.totalQueues),
        }));
      };
      
      for (let i = 70; i <= 100; i += 2) {
        await new Promise(resolve => setTimeout(resolve, 50));
        updateProgress(i);
      }
      
      // Final update with actual results
      setSimulationStats(prev => ({ 
        ...prev, 
        phase: 'COMPLETED', 
        progress: 100,
        processedQueues: prev.processedQueues + result.processedCount,
        completedQueues: result.metrics.completedQueues,
        waitingQueues: result.remainingCount,
        avgWaitTime: result.metrics.avgWaitTime
      }));

      // Capture final metrics  
      const metrics: AlgorithmMetrics = {
        algorithm: chosenAlgorithm,
        phase: 'PHASE_3',
        ...result.metrics,
        processedInPhase: result.processedCount,
        timestamp: new Date().toISOString()
      };

      setSimulationStats(prev => ({ 
        ...prev, 
        algorithmMetrics: [...prev.algorithmMetrics, metrics]
      }));

      await fetchQueues(true);
      setIsRunning(false);
      
      toast.success('🎉 การจำลองเสร็จสมบูรณ์ - ดูผลเปรียบเทียบอัลกอริธึม');
      simulationLogger.log('SIMULATION_COMPLETED', 'COMPLETED', chosenAlgorithm, 'Simulation completed successfully');
      
      // Offer to download comprehensive log
      setTimeout(() => {
        toast.info('📊 ต้องการดาวน์โหลดรายงานผลการทดสอบแบบละเอียดหรือไม่?', {
          action: {
            label: 'ดาวน์โหลด',
            onClick: () => simulationLogger.downloadReport()
          }
        });
      }, 2000);
      
    } catch (error) {
      logger.error('Error in final phase:', error);
      toast.error('เกิดข้อผิดพลาดในเฟสสุดท้าย');
      setIsRunning(false);
    }
  }, [simulationStats.currentAlgorithm, mappings, processQueuesByPercentage, fetchQueues]);

  const cleanup = useCallback(async () => {
    setLoading(true);
    logger.info('🧹 MANUAL CLEANUP BUTTON CLICKED');
    
    // Immediately switch to real-time mode for instant UI feedback
    simulationModeEmitter.emit(false);
    
    try {
      await completeCleanup();

      // Reset simulation stats to initial state
      setSimulationStats({
        prepared: false,
        totalQueues: 0,
        processedQueues: 0,
        completedQueues: 0,
        waitingQueues: 0,
        avgWaitTime: 0,
        isSimulationMode: false,
        queueTypeDistribution: {},
        servicePointDistribution: {},
        phase: 'IDLE',
        progress: 0,
        algorithmMetrics: [],
        currentAlgorithm: 'MULTILEVEL' // Start with MULTILEVEL for mixed queue types
      });

      await queryClient.clear();
      await queryClient.invalidateQueries();
      await fetchQueues(true);
      
    } catch (error) {
      logger.error('💥 Manual cleanup failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ';
      toast.error(`เกิดข้อผิดพลาดในการล้างข้อมูล: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [completeCleanup, fetchQueues, queryClient]);

  return {
    isRunning,
    simulationStats,
    selectedAlgorithm,
    setSelectedAlgorithm,
    prepareSimulation,
    startProgressiveTest,
    continueToPhase2,
    completeSimulation,
    cleanup,
    loading,
    downloadSimulationLog: () => simulationLogger.downloadReport()
  };
};

// Helper functions for realistic queue generation
const getRealisticQueueType = (enabledQueueTypes: any[], index: number) => {
  // Realistic distribution: 50% GENERAL, 20% ELDERLY, 15% APPOINTMENT, 10% PRIORITY, 5% others
  const rand = Math.random();
  if (rand < 0.5) return enabledQueueTypes.find(qt => qt.code === 'GENERAL') || enabledQueueTypes[0];
  if (rand < 0.7) return enabledQueueTypes.find(qt => qt.code === 'ELDERLY') || enabledQueueTypes[0];
  if (rand < 0.85) return enabledQueueTypes.find(qt => qt.code === 'APPOINTMENT') || enabledQueueTypes[0];
  if (rand < 0.95) return enabledQueueTypes.find(qt => qt.code === 'PRIORITY') || enabledQueueTypes[0];
  return enabledQueueTypes[index % enabledQueueTypes.length];
};

const findServicePointForQueueType = (queueType: any, mappings: any[], enabledServicePoints: any[]) => {
  // Try to find specific mapping first
  const specificMapping = mappings.find(m => m.queue_type_code === queueType.code);
  if (specificMapping?.service_point) {
    return specificMapping.service_point;
  }
  
  // Fallback to general service points or first available
  const generalMapping = mappings.find(m => m.supports_all_types);
  if (generalMapping?.service_point) {
    return generalMapping.service_point;
  }
  
  // Last resort - assign to first enabled service point
  return enabledServicePoints[0];
};