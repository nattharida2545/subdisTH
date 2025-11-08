import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface ExportAnalyticsProps {
  simulationData: any;
  realData: any;
  queueStats?: any;
}

const ExportAnalytics: React.FC<ExportAnalyticsProps> = ({
  simulationData,
  realData,
  queueStats
}) => {
  const exportToCSV = () => {
    const data = [
      ['Metric', 'Real Data', 'Simulation Data', 'Difference'],
      ['Average Wait Time (minutes)', realData.avgWaitTime, simulationData.avgWaitTime, Math.abs(simulationData.avgWaitTime - realData.avgWaitTime)],
      ['Completed Queues', realData.completedQueues, simulationData.completedQueues, Math.abs(simulationData.completedQueues - realData.completedQueues)],
      ['Throughput (queues/round)', realData.throughput, simulationData.throughput, Math.abs(simulationData.throughput - realData.throughput)]
    ];

    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('ส่งออกข้อมูลสำเร็จ!');
  };

  const exportDetailedReport = () => {
    const report = `
Analytics Report - ${new Date().toLocaleDateString('th-TH')}
===========================================

PERFORMANCE COMPARISON
----------------------
Average Wait Time:
  Real Data: ${realData.avgWaitTime} minutes
  Simulation: ${simulationData.avgWaitTime} minutes
  Difference: ${Math.abs(simulationData.avgWaitTime - realData.avgWaitTime)} minutes

Completed Queues:
  Real Data: ${realData.completedQueues} queues
  Simulation: ${simulationData.completedQueues} queues
  Difference: ${Math.abs(simulationData.completedQueues - realData.completedQueues)} queues

Throughput:
  Real Data: ${realData.throughput} queues/round
  Simulation: ${simulationData.throughput} queues/round
  Difference: ${Math.abs(simulationData.throughput - realData.throughput)} queues/round

ANALYSIS
--------
${simulationData.avgWaitTime < realData.avgWaitTime ? 
  '✓ Simulation shows better wait times' : 
  '⚠ Simulation shows longer wait times'}
${simulationData.throughput > realData.throughput ? 
  '✓ Simulation shows better throughput' : 
  '⚠ Simulation shows lower throughput'}

Generated at: ${new Date().toLocaleString('th-TH')}
    `;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `detailed-analytics-report-${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('ส่งออกรายงานสำเร็จ!');
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          ส่งออกข้อมูลการวิเคราะห์
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={exportToCSV}
            variant="outline"
            className="flex-1 flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            ส่งออก CSV
          </Button>
          <Button 
            onClick={exportDetailedReport}
            variant="outline"
            className="flex-1 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            รายงานแบบละเอียด
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          ส่งออกข้อมูลเพื่อการวิเคราะห์เพิ่มเติมหรือแชร์ผลลัพธ์
        </p>
      </CardContent>
    </Card>
  );
};

export default ExportAnalytics;