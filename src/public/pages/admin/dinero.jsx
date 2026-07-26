import React, { useState, useEffect } from 'react';
import { AiOutlineDownload, AiOutlinePrinter } from "react-icons/ai";

const obtenerFechaLocalYMD = () => {
   const d = new Date();
   const offset = d.getTimezoneOffset();
   const localDate = new Date(d.getTime() - (offset * 60 * 1000));
   return localDate.toISOString().split('T')[0];
};

export default function Dinero() {
   const obtenerPrimerDiaMes = () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
   };

   const obtenerHoy = () => {
      return obtenerFechaLocalYMD();
   };

   const [desde, setDesde] = useState(obtenerPrimerDiaMes());
   const [hasta, setHasta] = useState(obtenerHoy());
   const [reporte, setReporte] = useState([]);
   const [loading, setLoading] = useState(true);
   const [hoveredMetodo, setHoveredMetodo] = useState(null);
   const [hoveredConcepto, setHoveredConcepto] = useState(null);

   const fetchReporte = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
         const response = await fetch(`/api/ingresos/reporte?desde=${desde}&hasta=${hasta}`, {
            headers: { 'auth-token': token }
         });
         if (response.ok) {
            const data = await response.json();
            setReporte(data);
         }
      } catch (error) {
         console.error('Error fetching reporte:', error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchReporte();
   }, [desde, hasta]);

   // Totales calculados
   const totalEfectivo = reporte
      .filter(r => r.metodo === 'efectivo')
      .reduce((acc, curr) => acc + Number(curr.monto), 0);

   const totalTarjeta = reporte
      .filter(r => r.metodo === 'tarjeta')
      .reduce((acc, curr) => acc + Number(curr.monto), 0);

   const totalRecaudado = totalEfectivo + totalTarjeta;

   const totalAnticipos = reporte
      .filter(r => r.categoria === 'anticipo')
      .reduce((acc, curr) => acc + Number(curr.monto), 0);

   const totalPendientes = reporte
      .filter(r => r.categoria === 'pendiente')
      .reduce((acc, curr) => acc + Number(curr.monto), 0);

   const totalExtras = reporte
      .filter(r => r.categoria === 'extra')
      .reduce((acc, curr) => acc + Number(curr.monto), 0);

   // Porcentajes para gráficos
   const totalConceptos = totalAnticipos + totalPendientes + totalExtras;
   const pctEfectivo = totalRecaudado > 0 ? (totalEfectivo / totalRecaudado) * 100 : 0;
   const pctTarjeta = totalRecaudado > 0 ? (totalTarjeta / totalRecaudado) * 100 : 0;
   const pctAnticipo = totalConceptos > 0 ? (totalAnticipos / totalConceptos) * 100 : 0;
   const pctPendiente = totalConceptos > 0 ? (totalPendientes / totalConceptos) * 100 : 0;
   const pctExtra = totalConceptos > 0 ? (totalExtras / totalConceptos) * 100 : 0;

   // Exportar a CSV
   const exportarCSV = () => {
      if (reporte.length === 0) {
         alert('No hay datos para exportar.');
         return;
      }

      // Encabezados
      const headers = ['Fecha de Pago', 'Cliente', 'Producto/Vestido', 'Renta #', 'Concepto', 'Método', 'Monto'];

      // Filas
      const rows = reporte.map(r => [
         new Date(r.fecha_pago).toISOString().split('T')[0],
         r.cliente_nombre || 'N/A',
         r.producto_nombre || 'N/A',
         r.venta_id,
         r.categoria.toUpperCase(),
         r.metodo.toUpperCase(),
         r.monto
      ]);

      // Formatear CSV
      const csvContent = [
         headers.join(','),
         ...rows.map(e => e.map(val => `"${val}"`).join(','))
      ].join('\n');

      // Crear archivo para descarga
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Reporte_Ingresos_${desde}_a_${hasta}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   // Imprimir reporte
   const imprimirReporte = () => {
      window.print();
   };

   return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
         {/* Cabecera (Se oculta al imprimir) */}
         <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
            <div>
               <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Control de Ingresos</h1>
               <p className="mt-1 text-sm text-gray-500">Consulta de abonos e historial de ingresos para reporte contable.</p>
            </div>
            <div className="flex flex-wrap gap-3">
               <button
                  onClick={exportarCSV}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 cursor-pointer"
               >
                  <AiOutlineDownload className="text-lg" />
                  Excel (CSV)
               </button>
               <button
                  onClick={imprimirReporte}
                  className="inline-flex items-center gap-2 rounded-full bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700 cursor-pointer"
               >
                  <AiOutlinePrinter className="text-lg" />
                  Imprimir PDF
               </button>
            </div>
         </div>

         {/* Filtros de Fecha (Se oculta al imprimir) */}
         <div className="mb-6 rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm print:hidden">
            <h2 className="mb-3 text-sm font-bold text-gray-700 uppercase tracking-wider">Filtrar Rango de Fechas</h2>
            <div className="grid gap-4 sm:grid-cols-2">
               <div className="min-w-0">
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Desde</label>
                  <input
                     type="date"
                     value={desde}
                     onChange={(e) => setDesde(e.target.value)}
                     className="mt-1 w-full max-w-full box-border appearance-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                     style={{ WebkitAppearance: 'none' }}
                  />
               </div>
               <div className="min-w-0">
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Hasta</label>
                  <input
                     type="date"
                     value={hasta}
                     onChange={(e) => setHasta(e.target.value)}
                     className="mt-1 w-full max-w-full box-border appearance-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                     style={{ WebkitAppearance: 'none' }}
                  />
               </div>
            </div>
         </div>

         {/* Vista de Impresión (Solo visible al imprimir) */}
         <div className="hidden print:block mb-8 border-b border-gray-300 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">Reporte de Ingresos - La Más Chispa</h1>
            <p className="text-sm text-gray-500">Rango de fechas: <span className="font-semibold">{desde}</span> al <span className="font-semibold">{hasta}</span></p>
         </div>

         {/* Tarjetas de Totales (Visibles en pantalla e impresión) */}
         <div className="grid gap-6 grid-cols-1 md:grid-cols-3 print:grid-cols-3 mb-8">
            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
               <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total en Efectivo</p>
               <p className="mt-2 text-3xl font-extrabold text-gray-800">${totalEfectivo.toFixed(2)}</p>
               <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                  <span>Dinero físico en caja</span>
               </div>
            </div>
            <div className="rounded-[28px] border border-pink-100 bg-pink-50/20 p-6 shadow-sm">
               <p className="text-xs font-bold text-pink-600 uppercase tracking-wider">Total en Tarjeta</p>
               <p className="mt-2 text-3xl font-extrabold text-pink-700">${totalTarjeta.toFixed(2)}</p>
               <div className="mt-3 flex items-center gap-2 text-xs text-pink-400">
                  <span>Transferencias y terminal</span>
               </div>
            </div>
            <div className="rounded-[28px] border border-gray-200 bg-gradient-to-br from-pink-600 to-pink-700 p-6 text-white shadow-md">
               <p className="text-xs font-bold text-pink-100 uppercase tracking-wider">Total Recaudado</p>
               <p className="mt-2 text-3xl font-black">${totalRecaudado.toFixed(2)}</p>
               <div className="mt-3 flex items-center gap-2 text-xs text-pink-200">
                  <span>Suma total de abonos en el período</span>
               </div>
            </div>
         </div>

         {/* Gráficos de Ingresos */}
         <div className="grid gap-6 md:grid-cols-2 mb-8 print:hidden">
            {/* Gráfico 1: Método de Pago */}
            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
               <div className="relative w-36 h-36 flex-shrink-0">
                  {totalRecaudado > 0 ? (
                     <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                        {/* Círculo fondo */}
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f3f4f6" strokeWidth="6" />
                        {/* Segmento Efectivo (Esmeralda) */}
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#10b981" 
                                strokeWidth={hoveredMetodo === 'efectivo' ? '8.5' : '6'}
                                opacity={hoveredMetodo && hoveredMetodo !== 'efectivo' ? '0.3' : '1'}
                                className="transition-all duration-300 cursor-pointer"
                                onMouseEnter={() => setHoveredMetodo('efectivo')}
                                onMouseLeave={() => setHoveredMetodo(null)}
                                strokeDasharray={`${pctEfectivo} ${100 - pctEfectivo}`} strokeDashoffset="25" />
                        {/* Segmento Tarjeta (Rosa) */}
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#db2777" 
                                strokeWidth={hoveredMetodo === 'tarjeta' ? '8.5' : '6'}
                                opacity={hoveredMetodo && hoveredMetodo !== 'tarjeta' ? '0.3' : '1'}
                                className="transition-all duration-300 cursor-pointer"
                                onMouseEnter={() => setHoveredMetodo('tarjeta')}
                                onMouseLeave={() => setHoveredMetodo(null)}
                                strokeDasharray={`${pctTarjeta} ${100 - pctTarjeta}`} strokeDashoffset={`${25 - pctEfectivo}`} />
                     </svg>
                  ) : (
                     <svg viewBox="0 0 42 42" className="w-full h-full">
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#e5e7eb" strokeWidth="6" />
                     </svg>
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
                     {hoveredMetodo ? (
                        <>
                           <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                              {hoveredMetodo}
                           </span>
                           <span className="text-sm font-black text-gray-800">
                              ${hoveredMetodo === 'efectivo' ? totalEfectivo.toFixed(0) : totalTarjeta.toFixed(0)}
                           </span>
                        </>
                     ) : (
                        <>
                           <span className="text-xs font-semibold text-gray-400">Métodos</span>
                           <span className="text-sm font-bold text-gray-700">{totalRecaudado > 0 ? 'Cobros' : 'N/A'}</span>
                        </>
                     )}
                  </div>
               </div>
               
               <div className="flex-1 w-full space-y-3">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">Desglose de Pago</h3>
                  <div 
                     onMouseEnter={() => setHoveredMetodo('efectivo')}
                     onMouseLeave={() => setHoveredMetodo(null)}
                     className={`flex items-center justify-between border-b border-gray-100 pb-1.5 text-sm cursor-pointer p-1 rounded-lg transition-all duration-200 ${
                        hoveredMetodo === 'efectivo' ? 'bg-emerald-50 scale-[1.02] px-2' : hoveredMetodo ? 'opacity-40' : ''
                     }`}
                  >
                     <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        <span className="text-gray-600 font-medium">Efectivo</span>
                     </div>
                     <span className="font-bold text-gray-800">${totalEfectivo.toFixed(2)} ({pctEfectivo.toFixed(0)}%)</span>
                  </div>
                  <div 
                     onMouseEnter={() => setHoveredMetodo('tarjeta')}
                     onMouseLeave={() => setHoveredMetodo(null)}
                     className={`flex items-center justify-between pb-1.5 text-sm cursor-pointer p-1 rounded-lg transition-all duration-200 ${
                        hoveredMetodo === 'tarjeta' ? 'bg-pink-50 scale-[1.02] px-2' : hoveredMetodo ? 'opacity-40' : ''
                     }`}
                  >
                     <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-pink-600"></span>
                        <span className="text-gray-600 font-medium">Tarjeta</span>
                     </div>
                     <span className="font-bold text-gray-800">${totalTarjeta.toFixed(2)} ({pctTarjeta.toFixed(0)}%)</span>
                  </div>
               </div>
            </div>

            {/* Gráfico 2: Concepto de Renta */}
            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
               <div className="relative w-36 h-36 flex-shrink-0">
                  {totalConceptos > 0 ? (
                     <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                        {/* Círculo fondo */}
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f3f4f6" strokeWidth="6" />
                        {/* Segmento Anticipo (Rosa) */}
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#db2777" 
                                strokeWidth={hoveredConcepto === 'anticipo' ? '8.5' : '6'}
                                opacity={hoveredConcepto && hoveredConcepto !== 'anticipo' ? '0.3' : '1'}
                                className="transition-all duration-300 cursor-pointer"
                                onMouseEnter={() => setHoveredConcepto('anticipo')}
                                onMouseLeave={() => setHoveredConcepto(null)}
                                strokeDasharray={`${pctAnticipo} ${100 - pctAnticipo}`} strokeDashoffset="25" />
                        {/* Segmento Pendiente (Esmeralda) */}
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#10b981" 
                                strokeWidth={hoveredConcepto === 'pendiente' ? '8.5' : '6'}
                                opacity={hoveredConcepto && hoveredConcepto !== 'pendiente' ? '0.3' : '1'}
                                className="transition-all duration-300 cursor-pointer"
                                onMouseEnter={() => setHoveredConcepto('pendiente')}
                                onMouseLeave={() => setHoveredConcepto(null)}
                                strokeDasharray={`${pctPendiente} ${100 - pctPendiente}`} strokeDashoffset={`${25 - pctAnticipo}`} />
                        {/* Segmento Extra (Amber) */}
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f59e0b" 
                                strokeWidth={hoveredConcepto === 'extra' ? '8.5' : '6'}
                                opacity={hoveredConcepto && hoveredConcepto !== 'extra' ? '0.3' : '1'}
                                className="transition-all duration-300 cursor-pointer"
                                onMouseEnter={() => setHoveredConcepto('extra')}
                                onMouseLeave={() => setHoveredConcepto(null)}
                                strokeDasharray={`${pctExtra} ${100 - pctExtra}`} strokeDashoffset={`${25 - pctAnticipo - pctPendiente}`} />
                     </svg>
                  ) : (
                     <svg viewBox="0 0 42 42" className="w-full h-full">
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#e5e7eb" strokeWidth="6" />
                     </svg>
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
                     {hoveredConcepto ? (
                        <>
                           <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                              {hoveredConcepto === 'extra' ? 'cargo extra' : hoveredConcepto}
                           </span>
                           <span className="text-sm font-black text-gray-800">
                              ${hoveredConcepto === 'anticipo' ? totalAnticipos.toFixed(0) :
                                hoveredConcepto === 'pendiente' ? totalPendientes.toFixed(0) :
                                totalExtras.toFixed(0)}
                           </span>
                        </>
                     ) : (
                        <>
                           <span className="text-xs font-semibold text-gray-400">Conceptos</span>
                           <span className="text-sm font-bold text-gray-700">{totalConceptos > 0 ? 'Firma' : 'N/A'}</span>
                        </>
                     )}
                  </div>
               </div>
               
               <div className="flex-1 w-full space-y-2">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">Desglose de Conceptos</h3>
                  <div 
                     onMouseEnter={() => setHoveredConcepto('anticipo')}
                     onMouseLeave={() => setHoveredConcepto(null)}
                     className={`flex items-center justify-between border-b border-gray-100 pb-1.5 text-sm cursor-pointer p-1 rounded-lg transition-all duration-200 ${
                        hoveredConcepto === 'anticipo' ? 'bg-pink-50 scale-[1.02] px-2' : hoveredConcepto ? 'opacity-40' : ''
                     }`}
                  >
                     <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-pink-600"></span>
                        <span className="text-gray-600 font-medium">Anticipos</span>
                     </div>
                     <span className="font-bold text-gray-800">${totalAnticipos.toFixed(2)} ({pctAnticipo.toFixed(0)}%)</span>
                  </div>
                  <div 
                     onMouseEnter={() => setHoveredConcepto('pendiente')}
                     onMouseLeave={() => setHoveredConcepto(null)}
                     className={`flex items-center justify-between border-b border-gray-100 pb-1.5 text-sm cursor-pointer p-1 rounded-lg transition-all duration-200 ${
                        hoveredConcepto === 'pendiente' ? 'bg-emerald-50 scale-[1.02] px-2' : hoveredConcepto ? 'opacity-40' : ''
                     }`}
                  >
                     <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        <span className="text-gray-600 font-medium">Pendientes</span>
                     </div>
                     <span className="font-bold text-gray-800">${totalPendientes.toFixed(2)} ({pctPendiente.toFixed(0)}%)</span>
                  </div>
                  <div 
                     onMouseEnter={() => setHoveredConcepto('extra')}
                     onMouseLeave={() => setHoveredConcepto(null)}
                     className={`flex items-center justify-between pb-1.5 text-sm cursor-pointer p-1 rounded-lg transition-all duration-200 ${
                        hoveredConcepto === 'extra' ? 'bg-amber-50 scale-[1.02] px-2' : hoveredConcepto ? 'opacity-40' : ''
                     }`}
                  >
                     <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                        <span className="text-gray-600 font-medium">Extras</span>
                     </div>
                     <span className="font-bold text-gray-800">${totalExtras.toFixed(2)} ({pctExtra.toFixed(0)}%)</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Detalle de Ingresos (Tabla) */}
         <div className="rounded-[28px] border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-5 flex items-center justify-between print:px-0">
               <h2 className="text-lg font-bold text-gray-800">Detalle de Transacciones</h2>
               <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 print:hidden">
                  {reporte.length} abonos
               </span>
            </div>

            {loading ? (
               <div className="p-8 text-center text-sm text-gray-500">Cargando reporte...</div>
            ) : reporte.length > 0 ? (
               <>
                  {/* VISTA TABLE: Desktop & Print */}
                  <div className="hidden md:block print:block overflow-x-auto print:overflow-visible">
                     <table className="w-full text-left text-sm text-gray-700">
                        <thead className="bg-gray-50/70 border-b border-gray-100">
                           <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              <th className="py-3 px-6 print:py-2 print:px-3">Fecha</th>
                              <th className="py-3 px-6 print:py-2 print:px-3">Cliente</th>
                              <th className="py-3 px-6 print:py-2 print:px-3">Renta #</th>
                              <th className="py-3 px-6 print:py-2 print:px-3">Producto/Vestido</th>
                              <th className="py-3 px-6 print:py-2 print:px-3">Concepto</th>
                              <th className="py-3 px-6 print:py-2 print:px-3">Método</th>
                              <th className="py-3 px-6 print:py-2 print:px-3 text-right">Monto</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {reporte.map((r) => (
                              <tr key={r.ids || r.id} className="hover:bg-gray-50/50 transition">
                                 <td className="py-4 px-6 print:py-2 print:px-3 print:text-xs whitespace-nowrap">{new Date(r.fecha_pago).toISOString().split('T')[0]}</td>
                                 <td className="py-4 px-6 print:py-2 print:px-3 print:text-xs font-medium text-gray-900">{r.cliente_nombre || 'Cliente sin nombre'}</td>
                                 <td className="py-4 px-6 print:py-2 print:px-3 print:text-xs">#{r.venta_id}</td>
                                 <td className="py-4 px-6 print:py-2 print:px-3 print:text-xs">{r.producto_nombre || 'N/A'}</td>
                                 <td className="py-4 px-6 print:py-2 print:px-3 print:text-xs">
                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${r.categoria === 'anticipo' ? 'bg-pink-100 text-pink-700' :
                                          r.categoria === 'pendiente' ? 'bg-emerald-100 text-emerald-700' :
                                             'bg-amber-100 text-amber-700'
                                       }`}>
                                       {r.categoria}
                                    </span>
                                 </td>
                                 <td className="py-4 px-6 print:py-2 print:px-3 print:text-xs capitalize">{r.metodo}</td>
                                 <td className="py-4 px-6 print:py-2 print:px-3 print:text-xs text-right font-bold text-gray-900">${Number(r.monto).toFixed(2)}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>

                  {/* VISTA MOBILE: Tarjetas responsivas (Se oculta al imprimir) */}
                  <div className="md:hidden print:hidden divide-y divide-gray-100">
                     {reporte.map((r) => (
                        <div key={r.ids || r.id} className="p-4 space-y-3 bg-white hover:bg-gray-50 transition-colors">
                           <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-gray-400">
                                 {new Date(r.fecha_pago).toISOString().split('T')[0]}
                              </span>
                              <span className="text-base font-bold text-pink-600">
                                 ${Number(r.monto).toFixed(2)}
                              </span>
                           </div>
                           
                           <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                 <span className="font-bold text-gray-800">{r.cliente_nombre || 'Cliente sin nombre'}</span>
                                 <span className="text-xs font-semibold text-gray-500">Renta #{r.venta_id}</span>
                              </div>
                              <p className="text-xs text-gray-600 font-medium">Vestido: {r.producto_nombre || 'N/A'}</p>
                           </div>

                           <div className="flex gap-2">
                              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                                 r.categoria.includes('anticipo') ? 'bg-pink-100 text-pink-700' :
                                 r.categoria.includes('pendiente') ? 'bg-emerald-100 text-emerald-700' :
                                 'bg-amber-100 text-amber-700'
                              }`}>
                                 {r.categoria}
                              </span>
                              <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-600 capitalize">
                                 {r.metodo}
                              </span>
                           </div>
                        </div>
                     ))}
                  </div>
               </>
            ) : (
               <div className="p-12 text-center">
                  <p className="text-sm text-gray-500">No se encontraron cobros en el rango de fechas seleccionado.</p>
               </div>
            )}
         </div>
      </div>
   );
}