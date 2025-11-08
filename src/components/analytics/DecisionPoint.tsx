import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRight, RotateCcw, TrendingUp, TrendingDown, Clock, Users, BarChart3 } from 'lucide-react';
import { useAlgorithmPerformanceAnalysis } from './hooks/useAlgorithmPerformanceAnalysis';

interface DecisionPointProps {
  phase: number; // 30 or 70
  currentAlgorithm: string;
  currentMetrics: {
    avgWaitTime: number;
    throughput: number;
    completedQueues: number;
  };
  waitingQueues: number;
  phaseMetrics?: any[]; // Historical metrics from previous phases
  onContinue: () => void;
  onChangeAndContinue: (newAlgorithm: string) => void;
}

const DecisionPoint: React.FC<DecisionPointProps> = ({
  phase,
  currentAlgorithm,
  currentMetrics,
  waitingQueues,
  phaseMetrics = [],
  onContinue,
  onChangeAndContinue
}) => {
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { generateIntelligentRecommendation } = useAlgorithmPerformanceAnalysis();

  // Generate intelligent recommendation when component mounts
  useEffect(() => {
    const loadRecommendation = async () => {
      setLoading(true);
      try {
        const rec = await generateIntelligentRecommendation(currentAlgorithm, currentMetrics, phaseMetrics);
        setRecommendation(rec);
      } catch (error) {
        console.error('Error generating recommendation:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadRecommendation();
  }, [currentAlgorithm, currentMetrics, phaseMetrics, generateIntelligentRecommendation]);
  const getPerformanceComparison = () => {
    if (!recommendation?.performanceComparison) return null;
    
    const { current, predicted } = recommendation.performanceComparison;
    return {
      waitTimeChange: current.avgWaitTime - predicted.avgWaitTime,
      throughputChange: predicted.throughput - current.throughput,
      efficiencyChange: predicted.efficiency - current.efficiency
    };
  };

  const getPerformanceInsights = () => {
    if (!recommendation) return { status: 'info', message: 'กำลังวิเคราะห์...', icon: BarChart3 };
    
    const comparison = getPerformanceComparison();
    if (!comparison) return { status: 'info', message: 'กำลังวิเคราะห์...', icon: BarChart3 };
    
    if (comparison.waitTimeChange > 2) {
      return {
        status: 'success',
        message: `เปลี่ยนอัลกอริธึมจะลดเวลารอ ${comparison.waitTimeChange} นาที`,
        icon: TrendingUp
      };
    } else if (comparison.throughputChange > 1) {
      return {
        status: 'success',
        message: `เปลี่ยนอัลกอริธึมจะเพิ่มประสิทธิภาพ ${comparison.throughputChange} คิว`,
        icon: TrendingUp
      };
    } else if (recommendation.recommended === currentAlgorithm) {
      return {
        status: 'success',
        message: 'อัลกอริธึมปัจจุบันมีประสิทธิภาพดีที่สุดแล้ว',
        icon: TrendingUp
      };
    } else {
      return {
        status: 'warning',
        message: 'การเปลี่ยนอัลกอริธึมอาจไม่มีผลต่างมาก',
        icon: TrendingDown
      };
    }
  };

  const insights = getPerformanceInsights();
  const StatusIcon = insights.icon;
  const recommendedAlgorithm = recommendation?.recommended || currentAlgorithm;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Clock className="h-5 w-5" />
          จุดตัดสินใจ {phase}% - วิเคราะห์ประสิทธิภาพปัจจุบัน
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">เวลารอเฉลี่ย</p>
                <p className="text-2xl font-bold text-blue-600">{currentMetrics.avgWaitTime} นาที</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">เสร็จสิ้นแล้ว</p>
                <p className="text-2xl font-bold text-green-600">{currentMetrics.completedQueues}</p>
              </div>
              <Users className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">คิวคงเหลือ</p>
                <p className="text-2xl font-bold text-orange-600">{waitingQueues}</p>
              </div>
              <Users className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Historical Phase Comparison */}
        {phaseMetrics.length > 0 && (
          <Card className="bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                การเปรียบเทียบประสิทธิภาพแต่ละเฟส
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">เฟส</TableHead>
                    <TableHead className="text-xs">อัลกอริธึม</TableHead>
                    <TableHead className="text-xs">เวลารอเฉลี่ย</TableHead>
                    <TableHead className="text-xs">คิวที่เสร็จ</TableHead>
                    <TableHead className="text-xs">ประสิทธิภาพ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {phaseMetrics.map((metric, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-xs font-medium">{metric.phase}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="text-xs">{metric.algorithm}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{metric.avgWaitTime} นาที</TableCell>
                      <TableCell className="text-xs">{metric.completedQueues} คิว</TableCell>
                      <TableCell className="text-xs">{metric.throughput} คิว/รอบ</TableCell>
                    </TableRow>
                  ))}
                  {/* Current phase preview */}
                  <TableRow className="bg-blue-50">
                    <TableCell className="text-xs font-medium">PHASE_{phase === 30 ? '2' : '3'} (ปัจจุบัน)</TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="default" className="text-xs">{currentAlgorithm}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{currentMetrics.avgWaitTime} นาที</TableCell>
                    <TableCell className="text-xs">{currentMetrics.completedQueues} คิว</TableCell>
                    <TableCell className="text-xs">{currentMetrics.throughput} คิว/รอบ</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Performance Insights */}
        <Alert className={`border-${insights.status === 'warning' ? 'amber' : insights.status === 'success' ? 'green' : 'blue'}-200 bg-${insights.status === 'warning' ? 'amber' : insights.status === 'success' ? 'green' : 'blue'}-50`}>
          <StatusIcon className="h-4 w-4" />
          <AlertDescription className={`text-${insights.status === 'warning' ? 'amber' : insights.status === 'success' ? 'green' : 'blue'}-800`}>
            <strong>ผลการวิเคราะห์:</strong> {insights.message}
            {loading && <span className="ml-2">🔄</span>}
          </AlertDescription>
        </Alert>

        {/* Algorithm Status */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium mb-2">อัลกอริธึมปัจจุบัน</h4>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">{currentAlgorithm}</Badge>
            <span className="text-sm text-gray-600">
              • {currentAlgorithm === 'FIFO' && 'เข้าก่อน ออกก่อน - เหมาะกับคิวปกติ'}
              {currentAlgorithm === 'PRIORITY' && 'จัดลำดับความสำคัญ - เหมาะกับกรณีเร่งด่วน'}
              {currentAlgorithm === 'MULTILEVEL' && 'หลายระดับ - เหมาะกับคิวหลากหลาย'}
            </span>
          </div>
        </div>

        {/* Decision Options */}
        <div className="space-y-3">
          <h4 className="font-medium">ตัวเลือกการดำเนินการ:</h4>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onContinue}
              variant="default"
              className="flex items-center gap-2 flex-1"
            >
              <ArrowRight className="h-4 w-4" />
              ดำเนินต่อด้วย {currentAlgorithm}
            </Button>
            
            <Button
              onClick={() => onChangeAndContinue(recommendedAlgorithm)}
              variant="outline"
              className="flex items-center gap-2 flex-1"
            >
              <RotateCcw className="h-4 w-4" />
              เปลี่ยนเป็น {recommendedAlgorithm}
            </Button>
          </div>
        </div>

        {/* Intelligent Recommendation */}
        {recommendation && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <h5 className="font-medium mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              คำแนะนำจากการวิเคราะห์ข้อมูลจริง
              <Badge variant="outline" className={`text-xs ${
                recommendation.confidence === 'HIGH' ? 'border-green-300 bg-green-100 text-green-700' :
                recommendation.confidence === 'MEDIUM' ? 'border-yellow-300 bg-yellow-100 text-yellow-700' :
                'border-red-300 bg-red-100 text-red-700'
              }`}>
                ความแม่นยำ: {recommendation.confidence}
              </Badge>
            </h5>
            <div className="text-sm space-y-2">
              <p><strong>เหตุผล:</strong> {recommendation.reason}</p>
              <p><strong>ผลที่คาดหวัง:</strong> {recommendation.expectedImprovement}</p>
              
              {/* Performance Comparison */}
              {recommendation.performanceComparison && (
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <h6 className="text-xs font-medium text-gray-600 mb-1">ปัจจุบัน ({recommendation.performanceComparison.current.algorithm})</h6>
                    <div className="text-xs space-y-1">
                      <div>เวลารอเฉลี่ย: {recommendation.performanceComparison.current.avgWaitTime} นาที</div>
                      <div>ประสิทธิภาพ: {recommendation.performanceComparison.current.throughput} คิว</div>
                      <div>คะแนนรวม: {recommendation.performanceComparison.current.efficiency}</div>
                    </div>
                  </div>
                  <div className={`p-3 rounded border ${
                    recommendation.recommended !== currentAlgorithm ? 'bg-green-50 border-green-200' : 'bg-white'
                  }`}>
                    <h6 className="text-xs font-medium text-gray-600 mb-1">คาดการณ์ ({recommendation.performanceComparison.predicted.algorithm})</h6>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1">
                        เวลารอเฉลี่ย: {recommendation.performanceComparison.predicted.avgWaitTime} นาที
                        {recommendation.performanceComparison.predicted.avgWaitTime < recommendation.performanceComparison.current.avgWaitTime && 
                          <span className="text-green-600">↓</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        ประสิทธิภาพ: {recommendation.performanceComparison.predicted.throughput} คิว
                        {recommendation.performanceComparison.predicted.throughput > recommendation.performanceComparison.current.throughput && 
                          <span className="text-green-600">↑</span>}
                      </div>
                      <div>คะแนนรวม: {recommendation.performanceComparison.predicted.efficiency}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DecisionPoint;