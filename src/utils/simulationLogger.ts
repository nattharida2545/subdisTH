/**
 * Comprehensive Simulation Logger
 * Tracks all user decisions, algorithm changes, and performance metrics
 * Provides downloadable logs for debugging and analysis
 */

export interface SimulationLogEntry {
  timestamp: string;
  phase: string;
  event: string;
  algorithm: string;
  details: any;
  metrics?: {
    avgWaitTime: number;
    throughput: number;
    completedQueues: number;
    waitingQueues: number;
  };
}

class SimulationLogger {
  private logs: SimulationLogEntry[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.log('SESSION_START', 'IDLE', 'FIFO', 'Simulation session initialized');
  }

  log(event: string, phase: string, algorithm: string, details: any, metrics?: any) {
    const entry: SimulationLogEntry = {
      timestamp: new Date().toISOString(),
      phase,
      event,
      algorithm,
      details,
      metrics
    };

    this.logs.push(entry);
    console.log(`[SimulationLogger] ${event}:`, entry);
  }

  // Log user decisions at decision points
  logDecision(phase: number, currentAlgorithm: string, chosenAction: 'continue' | 'change', newAlgorithm?: string, reasoning?: string) {
    this.log(
      'USER_DECISION',
      `PAUSE_${phase}`,
      currentAlgorithm,
      {
        decisionPoint: `${phase}%`,
        action: chosenAction,
        previousAlgorithm: currentAlgorithm,
        newAlgorithm: newAlgorithm || currentAlgorithm,
        reasoning: reasoning || 'No reasoning provided'
      }
    );
  }

  // Log algorithm processing details
  logAlgorithmProcessing(algorithm: string, phase: string, processingDetails: any) {
    this.log(
      'ALGORITHM_PROCESSING',
      phase,
      algorithm,
      {
        ...processingDetails,
        processingTimestamp: new Date().toISOString()
      }
    );
  }

  // Log performance metrics capture
  logMetricsCapture(algorithm: string, phase: string, metrics: any) {
    this.log(
      'METRICS_CAPTURED',
      phase,
      algorithm,
      'Performance metrics captured at checkpoint',
      metrics
    );
  }

  // Log queue state changes
  logQueueStateChange(queueId: string, fromStatus: string, toStatus: string, algorithm: string, phase: string) {
    this.log(
      'QUEUE_STATUS_CHANGE',
      phase,
      algorithm,
      {
        queueId,
        from: fromStatus,
        to: toStatus,
        timestamp: new Date().toISOString()
      }
    );
  }

  // Get all logs
  getAllLogs(): SimulationLogEntry[] {
    return [...this.logs];
  }

  // Get logs filtered by event type
  getLogsByEvent(eventType: string): SimulationLogEntry[] {
    return this.logs.filter(log => log.event === eventType);
  }

  // Get user decision timeline
  getDecisionTimeline(): SimulationLogEntry[] {
    return this.logs.filter(log => log.event === 'USER_DECISION');
  }

  // Generate comprehensive report
  generateReport(): string {
    const report = {
      sessionId: this.sessionId,
      generatedAt: new Date().toISOString(),
      summary: {
        totalLogs: this.logs.length,
        sessionDuration: this.getSessionDuration(),
        algorithmsUsed: this.getAlgorithmsUsed(),
        decisionPoints: this.getDecisionTimeline().length
      },
      decisionTimeline: this.getDecisionTimeline(),
      performanceMetrics: this.getMetricsSummary(),
      algorithmProcessingLogs: this.getLogsByEvent('ALGORITHM_PROCESSING'),
      allLogs: this.logs
    };

    return JSON.stringify(report, null, 2);
  }

  // Download report as file
  downloadReport() {
    const report = this.generateReport();
    const blob = new Blob([report], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `simulation_log_${this.sessionId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Helper methods
  private getSessionDuration(): string {
    if (this.logs.length < 2) return '0ms';
    const start = new Date(this.logs[0].timestamp).getTime();
    const end = new Date(this.logs[this.logs.length - 1].timestamp).getTime();
    return `${end - start}ms`;
  }

  private getAlgorithmsUsed(): string[] {
    const algorithms = new Set(this.logs.map(log => log.algorithm));
    return Array.from(algorithms);
  }

  private getMetricsSummary(): any[] {
    return this.logs
      .filter(log => log.event === 'METRICS_CAPTURED')
      .map(log => ({
        timestamp: log.timestamp,
        phase: log.phase,
        algorithm: log.algorithm,
        metrics: log.metrics
      }));
  }

  // Clear logs (for new session)
  clearLogs() {
    this.logs = [];
    this.sessionId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.log('SESSION_RESET', 'IDLE', 'FIFO', 'Logs cleared, new session started');
  }
}

// Export singleton instance
export const simulationLogger = new SimulationLogger();