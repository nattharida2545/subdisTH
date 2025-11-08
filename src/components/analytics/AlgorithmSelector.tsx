import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Cpu, Clock, TrendingUp } from 'lucide-react';

interface AlgorithmSelectorProps {
  currentAlgorithm: string;
  selectedAlgorithm: string;
  onAlgorithmChange: (algorithm: string) => void;
  onStartSimulation: () => void;
  disabled?: boolean;
  isRunning?: boolean;
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  currentAlgorithm,
  selectedAlgorithm,
  onAlgorithmChange,
  onStartSimulation,
  disabled = false,
  isRunning = false
}) => {
  const algorithms = [
    {
      code: 'FIFO',
      name: 'First In, First Out',
      description: 'ลำดับก่อน-หลัง ตามเวลามาถึง',
      advantages: ['ความยุติธรรม', 'ใช้งานง่าย'],
      icon: Clock,
      color: 'blue'
    },
    {
      code: 'PRIORITY',
      name: 'Priority Based',
      description: 'ให้ความสำคัญกับผู้ป่วยเร่งด่วน',
      advantages: ['ลดเวลารอสำหรับ URGENT', 'เหมาะกับ ER'],
      icon: TrendingUp,
      color: 'red'
    },
    {
      code: 'MULTILEVEL',
      name: 'Multi-Level',
      description: 'สมดุลระหว่างความยุติธรรมและประสิทธิภาพ',
      advantages: ['สมดุล', 'ยืดหยุ่น'],
      icon: Cpu,
      color: 'purple'
    }
  ];

  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Settings className="h-4 w-4" />
          เลือกอัลกอริธึมสำหรับการทดสอบ
          {currentAlgorithm && (
            <Badge variant="outline" className="text-xs">
              ปัจจุบัน: {currentAlgorithm}
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-slate-600">
          เลือกอัลกอริธึมที่จะใช้ในการจำลองระบบคิว และเริ่มการทดสอบ
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {algorithms.map((algo) => {
            const Icon = algo.icon;
            const isSelected = selectedAlgorithm === algo.code;
            const isCurrent = currentAlgorithm === algo.code;
            
            return (
              <div
                key={algo.code}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected 
                    ? `border-${algo.color}-300 bg-${algo.color}-50 shadow-md` 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !disabled && onAlgorithmChange(algo.code)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? `bg-${algo.color}-100` : 'bg-slate-100'
                    }`}>
                      <Icon className={`h-4 w-4 ${
                        isSelected ? `text-${algo.color}-600` : 'text-slate-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${
                          isSelected ? `text-${algo.color}-800` : 'text-slate-800'
                        }`}>
                          {algo.code}
                        </h4>
                        {isCurrent && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                            ใช้งานอยู่
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{algo.name}</p>
                      <p className="text-xs text-slate-500 mb-2">{algo.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {algo.advantages.map((advantage, index) => (
                          <span 
                            key={index}
                            className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded"
                          >
                            {advantage}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className={`w-6 h-6 rounded-full bg-${algo.color}-500 flex items-center justify-center`}>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            เลือกแล้ว: <strong className="text-slate-800">{selectedAlgorithm}</strong>
          </div>
          <Button
            onClick={onStartSimulation}
            disabled={disabled || isRunning || !selectedAlgorithm}
            className="bg-primary hover:bg-primary/90"
          >
            {isRunning ? 'กำลังเริ่มการทดสอบ...' : 'เริ่มการทดสอบ'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlgorithmSelector;