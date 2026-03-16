'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { useData } from '@/context/data-context';
import { parseISO, getYear, getMonth, format } from 'date-fns';
import { it } from 'date-fns/locale';

// As the receipts data is very limited, I will create some mock data for yearly analysis.
const mockYearlyData: {[key: string]: number} = {
  '2026': 380,
  '2025': 285,
  '2024': 450,
  '2023': 320,
}

// New mock data for monthly comparison
const mockMonthlyComparisonData: {[key: string]: {[key:string]: number}} = {
    '2026': { 'Marzo': 170 },
    '2025': { 'Marzo': 0 },
    '2024': { 'Marzo': 110 }
};

export function CostAnalysis() {
  const { receipts } = useData();

  // State for "Andamento" tab
  const viewYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth();
  const [periodStart, setPeriodStart] = useState(currentMonthIndex < 6 ? 0 : 6);

  const monthlyTotals = useMemo(() => {
    const data = Array.from({ length: 12 }, (_, i) => ({
      name: format(new Date(viewYear, i), 'LLL', { locale: it }),
      total: 0,
    }));

    receipts.forEach(receipt => {
      const receiptDate = parseISO(receipt.archivedAt);
      if (getYear(receiptDate) === viewYear) {
        const monthIndex = getMonth(receiptDate);
        data[monthIndex].total += receipt.totalCost;
      }
    });
    return data;
  }, [receipts, viewYear]);
  
  const andamentoChartData = monthlyTotals.slice(periodStart, periodStart + 6);
  
  const today = new Date();
  const currentActualMonth = today.getMonth();
  const currentActualYear = today.getFullYear();
  
  const handlePrevPeriod = () => setPeriodStart(0);
  const handleNextPeriod = () => setPeriodStart(6);
  // End of state for "Andamento" tab


  const [yearA, setYearA] = useState<string>("2026");
  const [yearB, setYearB] = useState<string>("2025");

  // State for the "Mesi" tab
  const [monthYearA, setMonthYearA] = useState<string>("2026");
  const [monthA, setMonthA] = useState<string>("Marzo");
  const [monthYearB, setMonthYearB] = useState<string>("2025");
  const [monthB, setMonthB] = useState<string>("Marzo");

  // State for the "Variazioni" tab
  const [variationMonth, setVariationMonth] = useState<string>('Marzo');
  const [variationYear, setVariationYear] = useState<string>('2026');
  
  const availableYears = Object.keys(mockYearlyData).sort((a,b) => parseInt(b) - parseInt(a));
  const availableMonths = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", 
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];
  const monthShortNames: { [key: string]: string } = {
    "Gennaio": "Gen", "Febbraio": "Feb", "Marzo": "Mar", "Aprile": "Apr", "Maggio": "Mag", "Giugno": "Giu",
    "Luglio": "Lug", "Agosto": "Ago", "Settembre": "Set", "Ottobre": "Ott", "Novembre": "Nov", "Dicembre": "Dic"
  };

  const formatYAxis = (tick: number) => `€${tick.toLocaleString('it-IT')}`;
  
  const yearlyChartData = [
      { name: yearA, total: mockYearlyData[yearA] || 0 },
      { name: yearB, total: mockYearlyData[yearB] || 0 }
  ].sort((a,b) => parseInt(a.name) - parseInt(b.name));

  const monthlyComparisonChartData = [
    { 
      name: `${monthShortNames[monthA]} ${monthYearA.slice(2)}`, 
      total: mockMonthlyComparisonData[monthYearA]?.[monthA] || 0 
    },
    { 
      name: `${monthShortNames[monthB]} ${monthYearB.slice(2)}`, 
      total: mockMonthlyComparisonData[monthYearB]?.[monthB] || 0
    },
  ].sort((a, b) => {
    const yearA = parseInt(a.name.split(' ')[1]);
    const yearB = parseInt(b.name.split(' ')[1]);
    return yearA - yearB;
  });

  const variationsData = [
    { name: 'Aumenti', value: 0.74, color: 'hsl(var(--destructive))' },
    { name: 'Risparmi', value: 2.79, color: 'hsl(var(--primary))' },
  ];

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
        <Tabs defaultValue="andamento" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-full h-12 p-1.5">
            <TabsTrigger value="andamento" className="rounded-full text-sm data-[state=active]:bg-white data-[state=active]:shadow-md">ANDAMENTO</TabsTrigger>
            <TabsTrigger value="anni" className="rounded-full text-sm data-[state=active]:bg-white data-[state=active]:shadow-md">ANNI</TabsTrigger>
            <TabsTrigger value="mesi" className="rounded-full text-sm data-[state=active]:bg-white data-[state=active]:shadow-md">MESI</TabsTrigger>
            <TabsTrigger value="variazioni" className="rounded-full text-sm data-[state=active]:bg-white data-[state=active]:shadow-md">VARIAZIONI</TabsTrigger>
          </TabsList>
          <TabsContent value="andamento" className="mt-6 space-y-6">
            <div className="flex items-center justify-between p-2 rounded-full bg-gray-100">
              <Button variant="ghost" size="icon" className="rounded-full bg-white shadow" onClick={handlePrevPeriod} disabled={periodStart === 0}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="font-semibold text-sm">SPOSTA PERIODO</span>
              <Button variant="ghost" size="icon" className="rounded-full bg-white shadow" onClick={handleNextPeriod} disabled={periodStart === 6}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={andamentoChartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} tick={{ fill: '#6b7280', fontSize: 12, textTransform: 'capitalize' }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={formatYAxis} tick={{ fill: '#6b7280', fontSize: 12 }} domain={[0, 'dataMax + 45']} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 rounded-lg shadow-lg">
                            <p className="font-bold text-primary">{`€${payload[0].value?.toLocaleString('it-IT', {minimumFractionDigits: 2})}`}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="total" barSize={25} radius={[10, 10, 10, 10]}>
                    {andamentoChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={(index + periodStart) === currentActualMonth && viewYear === currentActualYear ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.2)'} />
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
          <TabsContent value="mesi" className="mt-6 space-y-6">
            <div className="p-4 bg-gray-100 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-500">PERIODO A:</label>
                    <div className="flex items-center gap-2">
                        <Select value={monthYearA} onValueChange={setMonthYearA}>
                            <SelectTrigger className="w-[120px] rounded-lg bg-white font-bold border-gray-200">
                            <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                            {availableYears.map(year => <SelectItem key={`A-${year}`} value={year}>{year}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={monthA} onValueChange={setMonthA}>
                            <SelectTrigger className="w-[120px] rounded-lg bg-white font-bold border-gray-200">
                            <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                            {availableMonths.map(month => <SelectItem key={`A-${month}`} value={month}>{month}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-500">PERIODO B:</label>
                    <div className="flex items-center gap-2">
                        <Select value={monthYearB} onValueChange={setMonthYearB}>
                            <SelectTrigger className="w-[120px] rounded-lg bg-white font-bold border-gray-200">
                            <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                            {availableYears.map(year => <SelectItem key={`B-${year}`} value={year}>{year}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={monthB} onValueChange={setMonthB}>
                            <SelectTrigger className="w-[120px] rounded-lg bg-white font-bold border-gray-200">
                            <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                            {availableMonths.map(month => <SelectItem key={`B-${month}`} value={month}>{month}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyComparisonChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} barCategoryGap="20%">
                    <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={formatYAxis} tick={{ fill: '#6b7280', fontSize: 12 }} domain={[0, 'dataMax + 50']} />
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--primary)/0.1)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                              return (
                              <div className="bg-background p-2 rounded-lg shadow-lg border">
                                  <p className="font-bold text-primary">{`€${payload[0].value?.toLocaleString('it-IT', {minimumFractionDigits: 2})}`}</p>
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
          <TabsContent value="variazioni" className="mt-6 space-y-6">
            <div className="p-4 bg-gray-100 rounded-2xl flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-500">MESE:</label>
              <div className="flex items-center gap-2">
                <Select value={variationMonth} onValueChange={setVariationMonth}>
                    <SelectTrigger className="w-[120px] rounded-lg bg-white font-bold border-gray-200">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {availableMonths.map(month => <SelectItem key={`V-${month}`} value={month}>{month}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={variationYear} onValueChange={setVariationYear}>
                    <SelectTrigger className="w-[120px] rounded-lg bg-white font-bold border-gray-200">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {availableYears.map(year => <SelectItem key={`V-${year}`} value={year}>{year}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
            </div>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={variationsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} barCategoryGap="35%">
                  <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={formatYAxis} tick={{ fill: '#6b7280', fontSize: 12 }} domain={[0, 'dataMax + 0.5']} />
                   <Tooltip
                    cursor={{ fill: 'hsl(var(--foreground)/0.05)' }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const data = payload[0];
                            return (
                                <div className="bg-white p-3 rounded-xl shadow-lg border">
                                    <div className="font-bold mb-2">{data.payload.name}</div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: data.payload.color }} />
                                        <span className="text-muted-foreground">value</span>
                                        <span className="font-bold ml-auto">{data.value?.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={80}>
                    {variationsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
                <Card className="bg-destructive/10 border-destructive/20 rounded-2xl">
                    <CardContent className="p-4">
                        <p className="text-xs font-bold text-destructive">IMPATTO AUMENTI</p>
                        <p className="text-3xl font-bold text-destructive">€0.74</p>
                        <p className="text-xs text-destructive/80">COSTO EXTRA RISPETTO AI PREZZI BASE PRECEDENTI</p>
                    </CardContent>
                </Card>
                 <Card className="bg-primary/10 border-primary/20 rounded-2xl">
                    <CardContent className="p-4">
                        <p className="text-xs font-bold text-primary">RISPARMIO OFFERTE</p>
                        <p className="text-3xl font-bold text-primary">€2.79</p>
                        <p className="text-xs text-primary/80">SCONTO TOTALE OTTENUTO DALLE PROMOZIONI</p>
                    </CardContent>
                </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
