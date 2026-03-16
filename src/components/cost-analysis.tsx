'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, BarChart2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const monthlyData = [
  { name: 'Gen', total: 0 },
  { name: 'Feb', total: 0 },
  { name: 'Mar', total: 110 },
  { name: 'Apr', total: 0 },
  { name: 'Mag', total: 0 },
  { name: 'Giu', total: 0 },
  { name: 'Lug', total: 0 },
  { name: 'Ago', total: 0 },
  { name: 'Set', total: 0 },
  { name: 'Ott', total: 0 },
  { name: 'Nov', total: 0 },
  { name: 'Dic', total: 0 },
];

// As the receipts data is very limited, I will create some mock data for yearly analysis.
const mockYearlyData: {[key: string]: number} = {
  '2026': 380,
  '2025': 285,
  '2024': 450,
  '2023': 320,
}

export function CostAnalysis() {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(2); // March

  const [yearA, setYearA] = useState<string>("2026");
  const [yearB, setYearB] = useState<string>("2025");
  
  const availableYears = Object.keys(mockYearlyData).sort((a,b) => parseInt(b) - parseInt(a));

  const formatYAxis = (tick: number) => `€${tick}`;
  
  const yearlyChartData = [
      { name: yearA, total: mockYearlyData[yearA] || 0 },
      { name: yearB, total: mockYearlyData[yearB] || 0 }
  ].sort((a,b) => parseInt(b.name) - parseInt(a.name));

  return (
    <Card className="shadow-lg rounded-3xl border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl font-bold">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <BarChart2 className="h-6 w-6 text-primary" />
          </div>
          Analisi Costi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="anni" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-full h-12 p-1.5">
            <TabsTrigger value="andamento" className="rounded-full text-sm data-[state=active]:bg-white data-[state=active]:shadow-md">ANDAMENTO</TabsTrigger>
            <TabsTrigger value="anni" className="rounded-full text-sm data-[state=active]:bg-white data-[state=active]:shadow-md">ANNI</TabsTrigger>
            <TabsTrigger value="mesi" className="rounded-full text-sm data-[state=active]:bg-white data-[state=active]:shadow-md">MESI</TabsTrigger>
            <TabsTrigger value="variazioni" className="rounded-full text-sm data-[state=active]:bg-white data-[state=active]:shadow-md">VARIAZIONI</TabsTrigger>
          </TabsList>
          <TabsContent value="andamento" className="mt-6 space-y-6">
            <div className="flex items-center justify-between p-2 rounded-full bg-gray-100">
              <Button variant="ghost" size="icon" className="rounded-full bg-white shadow">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="font-semibold text-sm">SPOSTA PERIODO</span>
              <Button variant="ghost" size="icon" className="rounded-full bg-white shadow">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData.slice(0, 8)} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={formatYAxis} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 rounded-lg shadow-lg">
                            <p className="font-bold text-primary">{`€${payload[0].value}`}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="total" barSize={25} radius={[10, 10, 10, 10]}>
                    {monthlyData.slice(0,8).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === currentMonthIndex ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.2)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="anni" className="mt-6 space-y-6">
             <div className="p-4 bg-gray-100 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-500">PERIODO A:</label>
                    <Select value={yearA} onValueChange={setYearA}>
                        <SelectTrigger className="w-[120px] rounded-lg bg-white font-bold border-gray-200">
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        {availableYears.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-500">PERIODO B:</label>
                    <Select value={yearB} onValueChange={setYearB}>
                        <SelectTrigger className="w-[120px] rounded-lg bg-white font-bold border-gray-200">
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        {availableYears.filter(y => y !== yearA).map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} barCategoryGap="20%">
                  <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={formatYAxis} tick={{ fill: '#6b7280', fontSize: 12 }} domain={[0, 'dataMax + 50']} />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--primary)/0.1)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background p-2 rounded-lg shadow-lg border">
                            <p className="font-bold text-primary">{`€${payload[0].value}`}</p>
                            <p className="text-xs text-muted-foreground">{`Totale ${payload[0].payload.name}`}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[10, 10, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="mesi"><p className="text-center text-muted-foreground p-8">Confronto mensile non ancora disponibile.</p></TabsContent>
          <TabsContent value="variazioni"><p className="text-center text-muted-foreground p-8">Analisi variazioni non ancora disponibile.</p></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
