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

export function CostAnalysis() {
  const [activeTab, setActiveTab] = useState('andamento');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(2); // March

  const formatYAxis = (tick: number) => `€${tick}`;

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
          <TabsContent value="anni"><p className="text-center text-muted-foreground p-8">Confronto annuale non ancora disponibile.</p></TabsContent>
          <TabsContent value="mesi"><p className="text-center text-muted-foreground p-8">Confronto mensile non ancora disponibile.</p></TabsContent>
          <TabsContent value="variazioni"><p className="text-center text-muted-foreground p-8">Analisi variazioni non ancora disponibile.</p></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
