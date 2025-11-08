import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Monitor, TrendingUp, Activity, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PerformanceData {
  timestamp: string;
  avgWaitTime: number;
  throughput: number;
  activeQueues: number;
  completedQueues: number;
}

const PerformanceMonitor: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRealTime, setIsRealTime] = useState(false);

  const chartConfig: ChartConfig = {
    avgWaitTime: {
      label: "Average Wait Time",
      color: "hsl(var(--primary))",
    },
    throughput: {
      label: "Throughput",
      color: "hsl(var(--secondary))",
    },
    activeQueues: {
      label: "Active Queues",
      color: "hsl(var(--accent))",
    },
  };

  const fetchPerformanceData = async () => {
    setIsLoading(true);
    try {
      // Fetch performance data from the last 24 hours
      const { data, error } = await supabase
        .from('queues')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Process data into hourly aggregates
      const hourlyData: { [key: string]: PerformanceData } = {};
      
      data?.forEach(queue => {
        const hour = new Date(queue.created_at).toISOString().slice(0, 13) + ':00:00';
        
        if (!hourlyData[hour]) {
          hourlyData[hour] = {
            timestamp: hour,
            avgWaitTime: 0,
            throughput: 0,
            activeQueues: 0,
            completedQueues: 0
          };
        }

        if (queue.status === 'ACTIVE') hourlyData[hour].activeQueues++;
        if (queue.status === 'COMPLETED') {
          hourlyData[hour].completedQueues++;
          // Calculate wait time from created_at to completed_at
          if (queue.completed_at && queue.created_at) {
            const waitTime = (new Date(queue.completed_at).getTime() - new Date(queue.created_at).getTime()) / (1000 * 60); // minutes
            hourlyData[hour].avgWaitTime = 
              (hourlyData[hour].avgWaitTime + waitTime) / 2;
          }
        }
      });

      // Calculate throughput (completed queues per hour)
      Object.values(hourlyData).forEach(hourData => {
        hourData.throughput = hourData.completedQueues;
      });

      setPerformanceData(Object.values(hourlyData).slice(-24)); // Last 24 hours
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast.error('Failed to fetch performance data');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRealTime = () => {
    setIsRealTime(!isRealTime);
    if (!isRealTime) {
      toast.success('Real-time monitoring enabled');
    } else {
      toast.success('Real-time monitoring disabled');
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRealTime) {
      interval = setInterval(fetchPerformanceData, 30000); // Update every 30 seconds
    }
    return () => clearInterval(interval);
  }, [isRealTime]);

  const latestData = performanceData[performanceData.length - 1];
  const previousData = performanceData[performanceData.length - 2];

  const getPerformanceStatus = () => {
    if (!latestData || !previousData) return 'unknown';
    
    const waitTimeChange = latestData.avgWaitTime - previousData.avgWaitTime;
    const throughputChange = latestData.throughput - previousData.throughput;
    
    if (waitTimeChange < -2 && throughputChange > 0) return 'excellent';
    if (waitTimeChange < 0 && throughputChange >= 0) return 'good';
    if (Math.abs(waitTimeChange) < 2 && Math.abs(throughputChange) < 2) return 'stable';
    return 'needs-attention';
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            <CardTitle>Performance Monitor</CardTitle>
            <Badge 
              variant={performanceStatus === 'excellent' ? 'default' : 
                      performanceStatus === 'good' ? 'secondary' :
                      performanceStatus === 'stable' ? 'outline' : 'destructive'}
            >
              {performanceStatus === 'excellent' ? '🚀 Excellent' :
               performanceStatus === 'good' ? '✅ Good' :
               performanceStatus === 'stable' ? '📊 Stable' : '⚠️ Needs Attention'}
            </Badge>
            {isRealTime && (
              <Badge variant="outline" className="animate-pulse">
                <Activity className="h-3 w-3 mr-1" />
                Live
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPerformanceData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant={isRealTime ? "default" : "outline"}
              size="sm"
              onClick={toggleRealTime}
            >
              <Zap className="h-4 w-4 mr-1" />
              Real-time
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{latestData?.avgWaitTime.toFixed(1) || '0'}</div>
                  <p className="text-xs text-muted-foreground">Avg Wait Time (min)</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{latestData?.throughput || '0'}</div>
                  <p className="text-xs text-muted-foreground">Throughput/hour</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{latestData?.activeQueues || '0'}</div>
                  <p className="text-xs text-muted-foreground">Active Queues</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{latestData?.completedQueues || '0'}</div>
                  <p className="text-xs text-muted-foreground">Completed/hour</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="avgWaitTime" 
                  stroke="var(--color-avgWaitTime)" 
                  strokeWidth={2}
                  name="Wait Time (min)"
                />
                <Line 
                  type="monotone" 
                  dataKey="throughput" 
                  stroke="var(--color-throughput)" 
                  strokeWidth={2}
                  name="Throughput"
                />
              </LineChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString('th-TH', { hour: '2-digit' })}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="activeQueues" 
                  stackId="1"
                  stroke="var(--color-activeQueues)" 
                  fill="var(--color-activeQueues)"
                  fillOpacity={0.6}
                  name="Active Queues"
                />
                <Area 
                  type="monotone" 
                  dataKey="completedQueues" 
                  stackId="1"
                  stroke="var(--color-throughput)" 
                  fill="var(--color-throughput)"
                  fillOpacity={0.6}
                  name="Completed Queues"
                />
              </AreaChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>

        {performanceStatus === 'needs-attention' && latestData && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Performance Alert</span>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Current wait time is {latestData.avgWaitTime.toFixed(1)} minutes with {latestData.activeQueues} active queues. 
              Consider optimizing queue management.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;