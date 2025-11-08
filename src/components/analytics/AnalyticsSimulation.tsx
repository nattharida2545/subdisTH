
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, RotateCcw, Trash2, Clock, Users, Activity, AlertTriangle, Database, BarChart3, Pause, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAnalyticsSimulationV2 } from './hooks/useAnalyticsSimulationV2';
import { useSimulationDataFixer } from '@/hooks/analytics/useSimulationDataFixer';
import AlgorithmSelector from './AlgorithmSelector';
import DecisionPoint from './DecisionPoint';

const AnalyticsSimulation: React.FC = () => {
  const {
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
    downloadSimulationLog
  } = useAnalyticsSimulationV2();

  const { fixSimulationTimestamps } = useSimulationDataFixer();

  const [currentMetrics, setCurrentMetrics] = React.useState({
    avgWaitTime: 0,
    throughput: 0,
    completedQueues: 0
  });

  // Capture metrics when we reach decision points
  React.useEffect(() => {
    if (simulationStats.phase === 'PAUSE_30' || simulationStats.phase === 'PAUSE_70') {
      setCurrentMetrics({
        avgWaitTime: simulationStats.avgWaitTime,
        throughput: simulationStats.completedQueues,
        completedQueues: simulationStats.completedQueues
      });
    }
  }, [simulationStats.phase, simulationStats.avgWaitTime, simulationStats.completedQueues]);

  const getPhaseDescription = () => {
    switch (simulationStats.phase) {
      case 'IDLE': return 'ยังไม่ได้เริ่มต้น';
      case 'PREPARING': return 'กำลังเตรียมข้อมูล...';
      case 'PREPARED': return 'พร้อมเริ่มการจำลอง';
      case 'RUNNING_30': return 'กำลังจำลอง - เฟส 1 (0-30%)';
      case 'PAUSE_30': return 'หยุดชั่วคราว - เฟส 1 เสร็จสิ้น (30%)';
      case 'RUNNING_70': return 'กำลังจำลอง - เฟส 2 (30-70%)';
      case 'PAUSE_70': return 'หยุดชั่วคราว - เฟส 2 เสร็จสิ้น (70%)';
      case 'RUNNING_100': return 'กำลังจำลอง - เฟสสุดท้าย (70-100%)';
      case 'COMPLETED': return 'การจำลองเสร็จสมบูรณ์';
      default: return 'ไม่ทราบสถานะ';
    }
  };

  const canStartTest = simulationStats.prepared && !isRunning && simulationStats.phase === 'PREPARED';
  const canContinuePhase2 = !isRunning && simulationStats.phase === 'PAUSE_30';
  const canCompleteSimulation = !isRunning && simulationStats.phase === 'PAUSE_70';
  const showResults = simulationStats.phase === 'COMPLETED' && simulationStats.algorithmMetrics.length > 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          การจำลองคิวโรงพยาบาลแบบสมจริง (Progressive Testing)
          {simulationStats.isSimulationMode && (
            <Badge variant="outline" className="border-orange-300 bg-orange-100 text-orange-700">
              🔬 Active
            </Badge>
          )}
          {simulationStats.phase !== 'IDLE' && (
            <Badge variant="secondary">{getPhaseDescription()}</Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          จำลองสถานการณ์คิวในโรงพยาบาลจริง พร้อมทดสอบอัลกอริธึมที่จุดหยุด 30% และ 70%
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar for Progressive Testing */}
        {simulationStats.phase !== 'IDLE' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">ความคืบหน้าการจำลอง</span>
              <span className="text-sm text-muted-foreground">{simulationStats.progress}%</span>
            </div>
            <Progress value={simulationStats.progress} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className={simulationStats.progress >= 30 ? 'text-green-600 font-medium' : ''}>30% - จุดตัดสินใจ 1</span>
              <span className={simulationStats.progress >= 70 ? 'text-green-600 font-medium' : ''}>70% - จุดตัดสินใจ 2</span>
              <span className={simulationStats.progress >= 100 ? 'text-green-600 font-medium' : ''}>100% - เสร็จสิ้น</span>
            </div>
          </div>
        )}

        {/* Enhanced Control Buttons */}
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-2">
            <Button
              onClick={prepareSimulation}
              disabled={loading || isRunning}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              เตรียมข้อมูล (สุ่ม 75-150 คิว)
            </Button>
            
            {/* Algorithm Selection Interface */}
            {simulationStats.phase === 'PREPARED' && (
              <AlgorithmSelector
                currentAlgorithm={simulationStats.currentAlgorithm}
                selectedAlgorithm={selectedAlgorithm}
                onAlgorithmChange={setSelectedAlgorithm}
                onStartSimulation={startProgressiveTest}
                disabled={loading}
                isRunning={isRunning}
              />
            )}
          </div>
          
          <Button
            onClick={startProgressiveTest}
            disabled={loading || !canStartTest}
            variant="default"
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'กำลังทดสอบ...' : 'เริ่มทดสอบแบบก้าวหน้า'}
          </Button>

          {/* Decision Point Components - Show intelligent decision interfaces */}
          {/* Phase 1 Decision Point (30%) */}
          {canContinuePhase2 && (
            <div className="col-span-full">
              <DecisionPoint
                phase={30}
                currentAlgorithm={simulationStats.currentAlgorithm}
                currentMetrics={currentMetrics}
                waitingQueues={simulationStats.totalQueues - simulationStats.completedQueues}
                phaseMetrics={simulationStats.algorithmMetrics}
                onContinue={() => continueToPhase2()}
                onChangeAndContinue={(newAlgorithm) => continueToPhase2(newAlgorithm)}
              />
            </div>
          )}

          {/* Phase 2 Decision Point (70%) */}
          {canCompleteSimulation && (
            <div className="col-span-full">
              <DecisionPoint
                phase={70}
                currentAlgorithm={simulationStats.currentAlgorithm}
                currentMetrics={currentMetrics}
                waitingQueues={simulationStats.totalQueues - simulationStats.completedQueues}
                phaseMetrics={simulationStats.algorithmMetrics}
                onContinue={() => completeSimulation()}
                onChangeAndContinue={(newAlgorithm) => completeSimulation(newAlgorithm)}
              />
            </div>
          )}
          
          <Button
            onClick={cleanup}
            disabled={loading}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            ล้างข้อมูลทั้งหมด (กลับสู่ข้อมูลจริง)
          </Button>
        </div>

        {/* Enhanced Algorithm Comparison Results */}
        {showResults && (
          <>
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-800">ผลเปรียบเทียบอัลกอริธึมแบบครบถ้วน</h4>
              </div>
              
              {/* Summary Table */}
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-green-200">
                      <th className="text-left p-2 text-green-800">เฟส</th>
                      <th className="text-left p-2 text-green-800">อัลกอริธึม</th>
                      <th className="text-center p-2 text-green-800">เวลารอเฉลี่ย</th>
                      <th className="text-center p-2 text-green-800">คิวที่เสร็จ</th>
                      <th className="text-center p-2 text-green-800">ประสิทธิภาพ</th>
                      <th className="text-center p-2 text-green-800">คะแนนรวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulationStats.algorithmMetrics.map((metric, index) => {
                      const score = Math.round(((100 - metric.avgWaitTime) * 0.4 + metric.throughput * 0.3 + (metric.throughput / Math.max(metric.avgWaitTime, 1)) * 10 * 0.3) * 100) / 100;
                      const isVest = score === Math.max(...simulationStats.algorithmMetrics.map(m => 
                        (100 - m.avgWaitTime) * 0.4 + m.throughput * 0.3 + (m.throughput / Math.max(m.avgWaitTime, 1)) * 10 * 0.3
                      ));
                      
                      return (
                        <tr key={index} className={`border-b border-green-100 ${isVest ? 'bg-green-100' : 'bg-white'}`}>
                          <td className="p-2 font-medium">{metric.phase}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              metric.algorithm === 'FIFO' ? 'bg-blue-100 text-blue-700' :
                              metric.algorithm === 'PRIORITY' ? 'bg-red-100 text-red-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {metric.algorithm}
                            </span>
                            {isVest && <span className="ml-2 text-green-600 text-xs">👑 ดีที่สุด</span>}
                          </td>
                          <td className="p-2 text-center">{metric.avgWaitTime} นาที</td>
                          <td className="p-2 text-center">{metric.completedQueues} คิว</td>
                          <td className="p-2 text-center">{metric.throughput} คิว/รอบ</td>
                          <td className="p-2 text-center font-bold text-green-700">{score}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Performance Insights */}
              <div className="bg-white p-3 rounded border border-green-200">
                <h5 className="font-medium text-gray-800 mb-2">สรุปผลการทดสอบ:</h5>
                <div className="text-sm text-gray-600 space-y-1">
                  {simulationStats.algorithmMetrics.length > 0 && (
                    <>
                       <p>• เปรียบเทียบ {simulationStats.algorithmMetrics.length} อัลกอริธึมใน {simulationStats.algorithmMetrics.length} เฟส</p>
                      <p>• อัลกอริธึมที่มีประสิทธิภาพดีที่สุด: <strong>
                        {simulationStats.algorithmMetrics.reduce((best, current) => {
                          const currentScore = (100 - current.avgWaitTime) * 0.4 + current.throughput * 0.3;
                          const bestScore = (100 - best.avgWaitTime) * 0.4 + best.throughput * 0.3;
                          return currentScore > bestScore ? current : best;
                        }).algorithm}
                      </strong></p>
                      <p>• เวลารอเฉลี่ยโดยรวม: {Math.round(simulationStats.algorithmMetrics.reduce((sum, m) => sum + m.avgWaitTime, 0) / simulationStats.algorithmMetrics.length)} นาที</p>
                      <p>• คิวที่เสร็จสิ้นรวม: {simulationStats.completedQueues} จาก {simulationStats.totalQueues} คิว</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Current Algorithm Status */}
        {simulationStats.phase !== 'IDLE' && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <Activity className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              อัลกอริธึมปัจจุบัน: {simulationStats.currentAlgorithm}
            </span>
          </div>
        )}
        {simulationStats.prepared && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-900">คิวจำลองทั้งหมด</p>
                  <p className="text-2xl font-bold text-blue-600">{simulationStats.totalQueues}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-900">เสร็จสิ้นแล้ว</p>
                  <p className="text-2xl font-bold text-green-600">{simulationStats.completedQueues}</p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-orange-900">เวลารอเฉลี่ย</p>
                  <p className="text-2xl font-bold text-orange-600">{simulationStats.avgWaitTime} นาที</p>
                </div>
                <Activity className="h-8 w-8 text-orange-500" />
              </div>
            </div>

            {/* Queue Type Distribution */}
            {Object.keys(simulationStats.queueTypeDistribution).length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 text-gray-600" />
                  <h4 className="font-medium text-gray-700">การกระจายตัวของประเภทคิว</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(simulationStats.queueTypeDistribution).map(([type, count]) => (
                    <div key={type} className="text-center p-2 bg-white rounded border">
                      <div className="text-lg font-bold text-gray-800">{count}</div>
                      <div className="text-xs text-gray-600">{type}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {simulationStats.prepared && (
            <Badge variant="secondary">ข้อมูลจำลองพร้อมแล้ว</Badge>
          )}
          {isRunning && (
            <Badge variant="default" className="animate-pulse">กำลังจำลอง</Badge>
          )}
          {simulationStats.isSimulationMode && (
            <Badge variant="outline" className="border-orange-300 text-orange-700">
              🔬 โหมดจำลอง
            </Badge>
          )}
          {simulationStats.completedQueues > 0 && (
            <Badge variant="outline">มีข้อมูลทดสอบ</Badge>
          )}
        </div>

        {/* Enhanced Instructions */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            วิธีการใช้งานแบบใหม่ (Progressive Algorithm Testing):
          </h4>
          <ol className="text-sm space-y-1 text-gray-600">
            <li>1. <strong>เตรียมข้อมูล</strong>: ล้างข้อมูลเดิมและสร้างข้อมูลจำลองใหม่ (สุ่ม 75-150 คิว)</li>
            <li>2. <strong>เริ่มทดสอบ</strong>: จำลองแบบก้าวหน้า จะหยุดที่ 30% เพื่อให้เลือกอัลกอริธึม</li>
            <li>3. <strong>จุดตัดสินใจ 30%</strong>: เลือกเปลี่ยนอัลกอริธึมหรือดำเนินต่อด้วยอัลกอริธึมเดิม</li>
            <li>4. <strong>จุดตัดสินใจ 70%</strong>: โอกาสสุดท้ายในการเปลี่ยนอัลกอริธึมก่อนจบ</li>
            <li>5. <strong>ดูผลเปรียบเทียบ</strong>: เมื่อเสร็จสิ้น จะแสดงผลเปรียบเทียบทุกอัลกอริธึมที่ทดสอบ</li>
          </ol>
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            <strong>ข้อดี:</strong> ทดสอบอัลกอริธึมหลายตัวในการจำลองเดียว และเห็นผลกระทบจริงต่อประสิทธิภาพ
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsSimulation;
