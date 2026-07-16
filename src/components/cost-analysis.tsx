'use client';
import { analyzeMonthVariations } from "@/analytics/variation-analysis";
import MonthlyVariations from '@/components/MonthlyVariations';
import ProductStatisticsSheet from "@/components/ProductStatisticsSheet";
import { RecentReceipts } from "@/components/recent-receipts";
import { Input } from "@/components/ui/input";

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
import { ChevronLeft, ChevronRight, BarChart2,TrendingUp, TrendingDown, } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/context/data-context';
import { parseISO, getYear, getMonth, format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Product } from "@/types";


export function CostAnalysis() {
 const { receipts, products } = useData();

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
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);

const [productSearch, setProductSearch] = useState("");

  const today = new Date();
  const currentActualMonth = today.getMonth();
  const currentActualYear = today.getFullYear();
  
  const handlePrevPeriod = () => setPeriodStart(0);
  const handleNextPeriod = () => setPeriodStart(6);
  
  const allYearsFromReceipts = useMemo(() => {
      const years = new Set(receipts.map(r => getYear(parseISO(r.archivedAt)).toString()));
      if (years.size === 0) {
        return [new Date().getFullYear().toString()];
      }
      return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [receipts]);

  const [yearA, setYearA] = useState<string>(allYearsFromReceipts[0]);
  const [yearB, setYearB] = useState<string>(allYearsFromReceipts[1] || (parseInt(allYearsFromReceipts[0]) - 1).toString());

  const availableMonths = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", 
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];

  const [monthYearA, setMonthYearA] = useState<string>(allYearsFromReceipts[0]);
  const [monthA, setMonthA] = useState<string>(availableMonths[new Date().getMonth()]);
  const [monthYearB, setMonthYearB] = useState<string>(allYearsFromReceipts[1] || (parseInt(allYearsFromReceipts[0]) - 1).toString());
  const [monthB, setMonthB] = useState<string>(availableMonths[new Date().getMonth()]);

  const [variationMonth, setVariationMonth] = useState<string>(availableMonths[new Date().getMonth()]);
  const [variationYear, setVariationYear] = useState<string>(allYearsFromReceipts[0]);
  const [showAllProducts, setShowAllProducts] = useState(false);

  useEffect(() => {
    setYearA(allYearsFromReceipts[0]);
    setYearB(allYearsFromReceipts[1] || (parseInt(allYearsFromReceipts[0]) - 1).toString());
    setMonthYearA(allYearsFromReceipts[0]);
    setMonthYearB(allYearsFromReceipts[1] || (parseInt(allYearsFromReceipts[0]) - 1).toString());
    setVariationYear(allYearsFromReceipts[0]);
  }, [allYearsFromReceipts]);
  const [activeTab, setActiveTab] = useState("andamento");

  const monthShortNames: { [key: string]: string } = {
    "Gennaio": "Gen", "Febbraio": "Feb", "Marzo": "Mar", "Aprile": "Apr", "Maggio": "Mag", "Giugno": "Giu",
    "Luglio": "Lug", "Agosto": "Ago", "Settembre": "Set", "Ottobre": "Ott", "Novembre": "Nov", "Dicembre": "Dic"
  };
  const monthIndices: { [key: string]: number } = {
      Gennaio: 0, Febbraio: 1, Marzo: 2, Aprile: 3, Maggio: 4, Giugno: 5,
      Luglio: 6, Agosto: 7, Settembre: 8, Ottobre: 9, Novembre: 10, Dicembre: 11
  };

  const formatYAxis = (tick: number) => `€${tick.toLocaleString('it-IT')}`;
  
  const yearlyChartData = useMemo(() => {
      const totalA = receipts
          .filter(r => getYear(parseISO(r.archivedAt)) === parseInt(yearA))
          .reduce((sum, r) => sum + r.totalCost, 0);
      const totalB = receipts
          .filter(r => getYear(parseISO(r.archivedAt)) === parseInt(yearB))
          .reduce((sum, r) => sum + r.totalCost, 0);
          
      return [
          { name: yearA, total: totalA },
          { name: yearB, total: totalB }
      ].sort((a,b) => parseInt(a.name) - parseInt(b.name));
  }, [receipts, yearA, yearB]);

  const monthlyComparisonChartData = useMemo(() => {
    const monthIndexA = monthIndices[monthA];
    const monthIndexB = monthIndices[monthB];


    const totalA = receipts
        .filter(r => {
            const d = parseISO(r.archivedAt);
            return getYear(d) === parseInt(monthYearA) && getMonth(d) === monthIndexA;
        })
        .reduce((sum, r) => sum + r.totalCost, 0);
    
    const totalB = receipts
        .filter(r => {
            const d = parseISO(r.archivedAt);
            return getYear(d) === parseInt(monthYearB) && getMonth(d) === monthIndexB;
        })
        .reduce((sum, r) => sum + r.totalCost, 0);
        
    const data = [
      { 
        name: `${monthShortNames[monthA]} ${monthYearA.slice(2)}`, 
        total: totalA 
      },
      { 
        name: `${monthShortNames[monthB]} ${monthYearB.slice(2)}`, 
        total: totalB
      },
    ];
    
    return data.sort((a, b) => {
        const yearA_ = parseInt(a.name.split(' ')[1]) + 2000;
        const yearB_ = parseInt(b.name.split(' ')[1]) + 2000;
        if (yearA_ !== yearB_) return yearA_ - yearB_;

        const monthNameA_ = Object.keys(monthShortNames).find(key => monthShortNames[key] === a.name.split(' ')[0]) || '';
        const monthNameB_ = Object.keys(monthShortNames).find(key => monthShortNames[key] === b.name.split(' ')[0]) || '';
        return monthIndices[monthNameA_] - monthIndices[monthNameB_];
    });

  }, [receipts, monthA, monthYearA, monthB, monthB, monthIndices, monthShortNames]);
  
      const monthlyDifference =
  (monthlyComparisonChartData[1]?.total ?? 0) -
  (monthlyComparisonChartData[0]?.total ?? 0);

const variationReport = useMemo(() => {

  return analyzeMonthVariations(
    receipts,
    products,
    monthIndices[variationMonth],
    parseInt(variationYear)
  );

}, [
  receipts,
  products,
  variationMonth,
  variationYear
]);

  const { totalIncreases, totalSavings } = useMemo(() => {
    const monthIndex = monthIndices[variationMonth];
    const year = parseInt(variationYear);
    
    let increases = 0;
    let savings = 0;
    
    receipts
      .filter(r => {
        const d = parseISO(r.archivedAt);
        return getYear(d) === year && getMonth(d) === monthIndex;
      })
      .forEach(r => {
        r.items.forEach(item => {
          if (item.basePrice !== null && item.basePrice !== undefined && item.basePrice > 0) {
            const diff = item.price - item.basePrice;
            if (diff > 0) {
              increases += diff * item.quantity;
            } else if (diff < 0) {
              savings += Math.abs(diff) * item.quantity;
            }
          }
        });
      });
      
    return { totalIncreases: increases, totalSavings: savings };
  }, [receipts, variationMonth, variationYear, monthIndices]);

  const variationsData = [
    { name: 'Aumenti', value: totalIncreases, color: 'hsl(var(--destructive))' },
    { name: 'Risparmi', value: totalSavings, color: 'hsl(var(--primary))' },
  ];
const filteredProducts = products
  .filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  )
  .sort((a, b) => a.name.localeCompare(b.name, "it"));
  const visibleProducts =
  productSearch || showAllProducts
    ? filteredProducts
    : filteredProducts.slice(0, 3);

    const yearlyDifference =
  (yearlyChartData[1]?.total ?? 0) -
  (yearlyChartData[0]?.total ?? 0);

  return (
    <>
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
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-full h-12 p-1.5">
            <TabsTrigger value="andamento" className="rounded-full text-xs font-bold sm:text-base sm:font-normal data-[state=active]:bg-white data-[state=active]:shadow-md">ANDAMENTO</TabsTrigger>
            <TabsTrigger value="variazioni" className="rounded-full text-xs font-bold sm:text-base sm:font-normal data-[state=active]:bg-white data-[state=active]:shadow-md">VARIAZIONI</TabsTrigger>
            <TabsTrigger value="confronto" className="rounded-full text-xs font-bold sm:text-base sm:font-normal data-[state=active]:bg-white data-[state=active]:shadow-md">CONFRONTO</TabsTrigger>
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
          <TabsContent value="confronto" className="mt-6 space-y-6">
            <Card className="shadow-none border-none">
  <CardHeader>
    <CardTitle className="text-base font-bold">
      CONFRONTO MENSILE
    </CardTitle>
  </CardHeader>

  <CardContent className="space-y-6 -mx-4 px-4">

      <div className="p-4 bg-gray-100 rounded-2xl space-y-6">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-500">PERIODO A:</label>
                    <div className="flex items-center gap-2">
                        <Select value={monthYearA} onValueChange={setMonthYearA}>
                            <SelectTrigger className="w-[100px] rounded-lg bg-white font-bold border-gray-200">
                            <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                            {allYearsFromReceipts.map(year => <SelectItem key={`A-${year}`} value={year}>{year}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={monthA} onValueChange={setMonthA}>
                            <SelectTrigger className="w-[100px] rounded-lg bg-white font-bold border-gray-200">
                            <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                            {availableMonths.map(month => <SelectItem key={`A-${month}`} value={month}>{month}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-500">PERIODO B:</label>
                    <div className="flex items-center gap-2">
                        <Select value={monthYearB} onValueChange={setMonthYearB}>
                            <SelectTrigger className="w-[100px] rounded-lg bg-white font-bold border-gray-200">
                            <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                            {allYearsFromReceipts.map(year => <SelectItem key={`B-${year}`} value={year}>{year}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={monthB} onValueChange={setMonthB}>
                            <SelectTrigger className="w-[100px] rounded-lg bg-white font-bold border-gray-200">
                            <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                            {availableMonths.map(month => <SelectItem key={`B-${month}`} value={month}>{month}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <div className="space-y-4">

  <div className="flex justify-between items-center border-b pb-3">
    <span className="font-medium">
      {monthlyComparisonChartData[0]?.name}
    </span>

    <span className="text-l font-bold">
      €{monthlyComparisonChartData[0]?.total.toFixed(2)}
    </span>
  </div>

  <div className="flex justify-between items-center border-b pb-3">
    <span className="font-medium">
      {monthlyComparisonChartData[1]?.name}
    </span>

    <span className="text-l font-bold">
      €{monthlyComparisonChartData[1]?.total.toFixed(2)}
    </span>
  </div>

  <div className="flex justify-between items-center rounded-xl bg-muted px-4 py-3">
    <span className="font-semibold">
      Differenza
    </span>

    <span
  className={`text-xl font-bold ${
    monthlyDifference > 0
      ? "text-red-500"
      : monthlyDifference < 0
      ? "text-green-600"
      : ""
  }`}
>
  {monthlyDifference > 0 ? "+" : ""}
  €{monthlyDifference.toFixed(2)}
</span>

  </div>
  </div>
            </CardContent>
</Card>
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
                        {allYearsFromReceipts.map(year => <SelectItem key={`V-${year}`} value={year}>{year}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
            </div>

            <div className="h-[100px] w-full">
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
                                        <span className="font-bold ml-auto">€{data.value?.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
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
                        <p className="text-3xl font-bold text-destructive">€{totalIncreases.toFixed(2)}</p>
                        <p className="text-xs text-destructive/80">COSTO EXTRA RISPETTO AI PREZZI BASE PRECEDENTI</p>
                    </CardContent>
                </Card>
                 <Card className="bg-primary/10 border-primary/20 rounded-2xl">
                    <CardContent className="p-4">
                        <p className="text-xs font-bold text-primary">RISPARMIO OFFERTE</p>
                        <p className="text-3xl font-bold text-primary">€{totalSavings.toFixed(2)}</p>
                        <p className="text-xs text-primary/80">SCONTO TOTALE OTTENUTO DALLE PROMOZIONI</p>
                    </CardContent>
                </Card>
            </div>

          </TabsContent>
          
        </Tabs>

      </CardContent>

    </Card>


{activeTab === "variazioni" && (
  <Card className="shadow-lg rounded-3xl border-none mt-6">
    <CardHeader>
      <CardTitle>Variazioni del mese</CardTitle>
    </CardHeader>

    <CardContent>
      <MonthlyVariations
        variationReport={variationReport}
      />
    </CardContent>
  </Card>
)}



    {activeTab === "variazioni" && (
      <Card className="shadow-lg rounded-3xl border-none mt-6">
        <CardHeader>
          <CardTitle>Timeline prezzi</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <Input
  placeholder="Cerca un prodotto..."
  value={productSearch}
  onChange={(e) => setProductSearch(e.target.value)}
/>
{visibleProducts.map((product) => (
    <div
  key={product.id}
  onClick={() => {
    setSelectedProduct(product);
    setIsStatisticsOpen(true);
  }}
  className="flex items-center justify-between p-3 rounded-xl border hover:bg-gray-50 cursor-pointer transition-colors"
>
      <div>
        <p className="font-semibold">{product.name}</p>
        <p className="text-sm text-muted-foreground">
          {product.category}
        </p>
      </div>

      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </div>
  ))}
{filteredProducts.length > 3 && (
  <button
    onClick={() => setShowAllProducts(!showAllProducts)}
    className="w-full pt-2 text-sm font-medium text-primary hover:underline"
  >
    {showAllProducts
      ? "Mostra meno"
      : `Mostra tutti i ${filteredProducts.length} prodotti`}
  </button>
)}
</CardContent>
      </Card>
    )}

 {activeTab === "confronto" && (
<Card className="border-none">
  <CardHeader>
    <CardTitle className="text-base font-bold">
      CONFRONTO ANNUALE
    </CardTitle>
  </CardHeader>

  <CardContent className="space-y-6">
             <div className="p-4 bg-gray-100 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-500">PERIODO A:</label>
                    <Select value={yearA} onValueChange={setYearA}>
                        <SelectTrigger className="w-[120px] rounded-lg bg-white font-bold border-gray-200">
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        {allYearsFromReceipts.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-500">PERIODO B:</label>
                    <Select value={yearB} onValueChange={setYearB}>
                        <SelectTrigger className="w-[120px] rounded-lg bg-white font-bold border-gray-200">
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        {allYearsFromReceipts.filter(y => y !== yearA).map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
<div className="space-y-4">

  <div className="flex justify-between items-center border-b pb-3">
    <span className="font-medium">
      {yearlyChartData[0]?.name}
    </span>

    <span className="text-l font-bold">
      €{yearlyChartData[0]?.total.toFixed(2)}
    </span>
  </div>

  <div className="flex justify-between items-center border-b pb-3">
    <span className="font-medium">
      {yearlyChartData[1]?.name}
    </span>

    <span className="text-l font-bold">
      €{yearlyChartData[1]?.total.toFixed(2)}
    </span>
  </div>

  <div className="flex justify-between items-center rounded-xl bg-muted px-4 py-3">
    <span className="font-semibold">
      Differenza
    </span>

    <span
  className={`text-xl font-bold ${
    yearlyDifference > 0
      ? "text-red-500"
      : yearlyDifference < 0
      ? "text-green-600"
      : ""
  }`}
>
  {yearlyDifference > 0 ? "+" : ""}
  €{yearlyDifference.toFixed(2)}
</span>

  </div>

</div>
  </CardContent>
</Card>
)}
          
    {activeTab !== "variazioni" && (
  <RecentReceipts receipts={receipts} />
)}

<ProductStatisticsSheet
  open={isStatisticsOpen}
  onOpenChange={setIsStatisticsOpen}
  product={selectedProduct}
/>
  </>
  
);
}
