import React, { useState, useEffect } from 'react';
import { MdEdit, MdDelete } from "react-icons/md";
import { AiOutlineClear } from "react-icons/ai";
import { useNavigate } from 'react-router-dom';
import { IoReceiptOutline } from "react-icons/io5";

// 💡 FUNCIÓN ASISTENTE CORREGIDA: Extrae estrictamente la fecha textual (YYYY-MM-DD) e ignora la zona horaria
const formatearFechaSafe = (fechaString, opciones) => {
   if (!fechaString) return 'N/A';

   // Tomamos solo los primeros 10 caracteres (YYYY-MM-DD), ignorando 'T', horas o 'Z'
   const fechaLimpia = fechaString.slice(0, 10);

   if (fechaLimpia.includes('-') && fechaLimpia.length === 10) {
      const [year, month, day] = fechaLimpia.split('-').map(Number);
      // Creamos la fecha en modo local estricto (año, mes base 0, día)
      return new Date(year, month - 1, day).toLocaleDateString('es-ES', opciones);
   }

   return new Date(fechaString).toLocaleDateString('es-ES', opciones);
};

export default function Rentas() {
   const [rentas, setRentas] = useState([]);
   const [resumenAbierto, setResumenAbierto] = useState(null);
   const navigate = useNavigate();

   const [filtros, setFiltros] = useState({
      tipoFecha: 'todas',
      preset: 'todos',
      fechaInicio: '',
      fechaFin: '',
      soloPendientesLiquidar: false
   });
   const [searchQuery, setSearchQuery] = useState('');
   const [showFiltersMobile, setShowFiltersMobile] = useState(false);

   useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const fetchData = async () => {
         try {
            const responseRentas = await fetch('/api/rentas2', {
               headers: { 'auth-token': token }
            });
            const dataRentas = await responseRentas.json();
            setRentas(dataRentas);

         } catch (error) {
            console.error('Error fetching data:', error);
         }
      };

      fetchData();
   }, []);

   const opciones = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
   };

   const obtenerRentasFiltradas = () => {
      if (!Array.isArray(rentas)) return [];

      const filtradas = rentas.filter((renta) => {
         if (searchQuery.trim() !== '') {
            const searchLower = searchQuery.toLowerCase();
            const matchName = renta.name && renta.name.toLowerCase().includes(searchLower);
            const matchProduct = renta.producto_nombre && renta.producto_nombre.toLowerCase().includes(searchLower);
            if (!matchName && !matchProduct) return false;
         }

         if (filtros.soloPendientesLiquidar) {
            const esLiquidado = renta.liquidado === true || renta.liquidado === 1 || renta.liquidado === '1' || renta.liquidado === 'true';
            if (esLiquidado) return false;
         }

         if (filtros.tipoFecha !== 'todas' && !renta[filtros.tipoFecha]) {
            return false;
         }

         if (filtros.preset === 'todos') return true;

         const verificarFechaIndividual = (fechaString) => {
            if (!fechaString) return false;

            // 🛠️ CORRECCIÓN AQUÍ: Extraemos el formato YYYY-MM-DD directamente del texto.
            // Esto evita que JavaScript reste un día al intentar convertir la hora UTC a local.
            const stringRenta = fechaString.slice(0, 10);

            // 2. Obtener la fecha de HOY en formato estricto LOCAL
            const hoy = new Date();
            const stringHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

            // Filtro: Hoy
            if (filtros.preset === 'hoy') {
               return stringRenta === stringHoy;
            }

            // Filtro: Mañana
            if (filtros.preset === 'manana') {
               const manana = new Date(hoy);
               manana.setDate(manana.getDate() + 1);
               const stringManana = `${manana.getFullYear()}-${String(manana.getMonth() + 1).padStart(2, '0')}-${String(manana.getDate()).padStart(2, '0')}`;
               return stringRenta === stringManana;
            }

            // Para rangos estables creamos objetos Date locales a mediodía
            const [rYear, rMonth, rDay] = stringRenta.split('-').map(Number);
            const fRentaComparar = new Date(rYear, rMonth - 1, rDay, 12, 0, 0);

            // Filtro: Esta Semana
            if (filtros.preset === 'semana') {
               const tempHoy = new Date();
               tempHoy.setHours(0, 0, 0, 0);

               const diaSemana = tempHoy.getDay();
               const diferenciaLunes = tempHoy.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
               const lunes = new Date(tempHoy.getFullYear(), tempHoy.getMonth(), diferenciaLunes, 0, 0, 0);

               const domingo = new Date(lunes);
               domingo.setDate(lunes.getDate() + 6);
               domingo.setHours(23, 59, 59, 999);

               return fRentaComparar >= lunes && fRentaComparar <= domingo;
            }

            // Filtro: Siguiente Semana
            if (filtros.preset === 'siguienteSemana') {
               const tempHoy = new Date();
               tempHoy.setHours(0, 0, 0, 0);

               const diaSemana = tempHoy.getDay();
               const diferenciaLunes = tempHoy.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1) + 7;
               const lunesSig = new Date(tempHoy.getFullYear(), tempHoy.getMonth(), diferenciaLunes, 0, 0, 0);

               const domingoSig = new Date(lunesSig);
               domingoSig.setDate(lunesSig.getDate() + 6);
               domingoSig.setHours(23, 59, 59, 999);

               return fRentaComparar >= lunesSig && fRentaComparar <= domingoSig;
            }

            // Filtro: Rango Personalizado
            if (filtros.preset === 'personalizado') {
               if (!filtros.fechaInicio || !filtros.fechaFin) return true;

               const [iYear, iMonth, iDay] = filtros.fechaInicio.split('-').map(Number);
               const inicio = new Date(iYear, iMonth - 1, iDay, 0, 0, 0);

               const [fYear, fMonth, fDay] = filtros.fechaFin.split('-').map(Number);
               const fin = new Date(fYear, fMonth - 1, fDay, 23, 59, 59, 999);

               return fRentaComparar >= inicio && fRentaComparar <= fin;
            }

            return false;
         };

         if (filtros.tipoFecha === 'todas') {
            return (
               verificarFechaIndividual(renta.fechaEntrega) ||
               verificarFechaIndividual(renta.fechaDevolucion) ||
               verificarFechaIndividual(renta.fechaAjuste) ||
               verificarFechaIndividual(renta.fechaRenta)
            );
         }

         return verificarFechaIndividual(renta[filtros.tipoFecha]);
      });

      return filtradas;
   };

   const rentasFiltradas = obtenerRentasFiltradas();

   const handleEstadoChange = async (rentaId, nuevoEstado) => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
         const response = await fetch(`/api/rentas/${rentaId}`, {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
               'auth-token': token
            },
            body: JSON.stringify({ estado: nuevoEstado })
         });
         if (response.ok) {
            setRentas(prevRentas =>
               prevRentas.map(renta =>
                  renta.id === rentaId ? { ...renta, estado: nuevoEstado } : renta
               )
            );
            alert(`Renta ${rentaId} actualizada a: ${nuevoEstado}`);
         } else {
            const errData = await response.json();
            alert(errData.error || 'Error al actualizar el estado de la renta');
         }
      } catch (error) {
         console.error('Error en la conexión:', error);
      }
   };

   const handleDelete = async (rentaId) => {
      const token = localStorage.getItem('token');
      if (!token) return;
      if (!window.confirm('¿Estás seguro de que quieres eliminar esta renta?')) return;

      try {
         const response = await fetch(`/api/rentas/${rentaId}`, {
            method: 'DELETE',
            headers: { 'auth-token': token }
         });
         if (response.ok) {
            setRentas(prevRentas => prevRentas.filter(renta => renta.id !== rentaId));
            alert(`Renta ${rentaId} eliminada`);
         }
      } catch (error) {
         console.error('Error en la conexión:', error);
      }
   };

   const handleDownloadPdf = async (renta) => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
         const response = await fetch('/api/reciboPdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'auth-token': token },
            body: JSON.stringify(renta)
         });

         if (!response.ok) throw new Error("Error en el servidor");

         const blob = await response.blob();
         const urlDescarga = window.URL.createObjectURL(blob);
         const linkTemporal = document.createElement('a');
         linkTemporal.href = urlDescarga;
         linkTemporal.download = `Recibo_Renta_${renta.id}.pdf`;

         document.body.appendChild(linkTemporal);
         linkTemporal.click();
         linkTemporal.remove();
         window.URL.revokeObjectURL(urlDescarga);

      } catch (error) {
         console.error("Error al descargar:", error);
         alert("Hubo un error al generar el PDF.");
      }
   };

   const clearFilters = () => {
      setSearchQuery('');
      setFiltros({
         tipoFecha: 'todas',
         preset: 'todos',
         fechaInicio: '',
         fechaFin: '',
         soloPendientesLiquidar: false
      });
   };

   return (
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

         <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-pink-100 bg-white/90 p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end sm:gap-6 sm:p-6">
            <div className="flex flex-1 flex-col gap-2 w-full sm:w-auto">
               <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-500">Buscar por cliente o vestido</label>
                  <button
                     className="text-xs font-semibold text-pink-600 sm:hidden"
                     onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                  >
                     {showFiltersMobile ? 'Ocultar filtros' : 'Filtros de fecha'}
                  </button>
               </div>
               <input
                  type="text"
                  placeholder="Ej. María o Sirena..."
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-inner outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-200 sm:min-w-[220px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            <div className={`${showFiltersMobile ? 'flex' : 'hidden'} sm:flex flex-1 flex-col gap-2`}>
               <label className="text-sm font-semibold text-gray-500">¿Qué fecha revisar?</label>
               <select
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-inner outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-200 sm:min-w-[220px]"
                  value={filtros.tipoFecha}
                  onChange={(e) => setFiltros({ ...filtros, tipoFecha: e.target.value })}
               >
                  <option value="todas">Todas las fechas (Cualquiera)</option>
                  <option value="fechaEntrega">Fecha de Entrega</option>
                  <option value="fechaDevolucion">Fecha de Devolución</option>
                  <option value="fechaAjuste">Fecha de Ajuste</option>
                  <option value="fechaRenta">Fecha de Renta</option>
               </select>
            </div>

            <div className={`${showFiltersMobile ? 'flex' : 'hidden'} sm:flex flex-1 flex-col gap-2`}>
               <label className="text-sm font-semibold text-gray-500">Rango de Tiempo</label>
               <select
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-inner outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-200 sm:min-w-[220px]"
                  value={filtros.preset}
                  onChange={(e) => setFiltros({ ...filtros, preset: e.target.value })}
               >
                  <option value="todos">Ver Todas</option>
                  <option value="hoy">Hoy</option>
                  <option value="manana">Mañana</option>
                  <option value="semana">Esta Semana</option>
                  <option value="siguienteSemana">Siguiente Semana</option>
                  <option value="personalizado">Rango Personalizado 📅</option>
               </select>
            </div>

            {filtros.preset === 'personalizado' && (
               <div className={`${showFiltersMobile ? 'flex' : 'hidden'} sm:flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-3`}>
                  <div className="flex flex-1 flex-col gap-2">
                     <label className="text-sm font-semibold text-gray-500">Desde:</label>
                     <input
                        type="date"
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-inner outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
                        value={filtros.fechaInicio}
                        onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                     />
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                     <label className="text-sm font-semibold text-gray-500">Hasta:</label>
                     <input
                        type="date"
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-inner outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
                        value={filtros.fechaFin}
                        onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                     />
                  </div>
               </div>
            )}

            <div className={`${showFiltersMobile ? 'flex' : 'hidden'} sm:flex flex-col gap-2`}>
               <label className="text-sm font-semibold text-gray-500 hidden sm:block opacity-0 select-none">Filtro</label>
               <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-inner cursor-pointer hover:border-pink-300 transition h-[38px]">
                  <input
                     type="checkbox"
                     checked={filtros.soloPendientesLiquidar}
                     onChange={(e) => setFiltros({ ...filtros, soloPendientesLiquidar: e.target.checked })}
                     className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                  />
                  <span>Por Liquidar</span>
               </label>
            </div>

            <button
               className={`${showFiltersMobile ? 'flex' : 'hidden'} sm:flex w-full sm:w-auto h-[38px] items-center justify-center gap-2 rounded-xl bg-pink-100 px-4 py-2 text-sm font-medium text-pink-700 transition-colors hover:bg-pink-200 shadow-sm`}
               onClick={clearFilters}
            >
               <AiOutlineClear />
               <span>Limpiar</span>
            </button>
         </div>

         <div className="mb-3 px-1">
            <p className="text-sm font-medium text-gray-600">{rentasFiltradas.length} rentas encontradas</p>
         </div>

         <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:block">
            <table className="min-w-full border-collapse text-left">
               <thead>
                  <tr className="bg-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-600">
                     <th className="px-4 py-3">ID</th>
                     <th className="px-4 py-3 text-center">Liquidado</th>
                     <th className="px-4 py-3">Vestido</th>
                     <th className="px-4 py-3">Cliente</th>
                     <th className="px-4 py-3">Fecha de Entrega</th>
                     <th className="px-4 py-3">Estado</th>
                     <th className="px-4 py-3">Fecha de Devolución</th>
                     <th className="px-4 py-3">Acciones</th>
                  </tr>
               </thead>
               <tbody>
                  {Array.isArray(rentasFiltradas) && rentasFiltradas.map((renta, index) => {
                     const nombreVestido = renta.producto_nombre ? renta.producto_nombre : 'No especificado / Cargando...';
                     const precioDeRenta = renta.precio_renta ? Number(renta.precio_renta || 0) : 0;
                     const totalAnticipos = Number(renta.anticipoEfectivo || 0) + Number(renta.anticipoTarjeta || 0) + Number(renta.pendienteEfectivo || 0) + Number(renta.pendienteTarjeta || 0);
                     const faltaPorPagarCalculado = precioDeRenta - totalAnticipos;
                     const esLiquidado = renta.liquidado === true || renta.liquidado === 1 || renta.liquidado === '1' || renta.liquidado === 'true';
                     const tieneAjuste = renta.ajuste === true || renta.ajuste === 1 || renta.ajuste === '1' || renta.ajuste === 'true';
                     const tieneNotas = renta.notes || renta.notas;
                     const mostrarHaciaArriba = index >= rentasFiltradas.length - 2;
                     const abiertoDesktop = resumenAbierto === renta.id;

                     return (
                        <tr key={renta.id} className="border-b border-gray-100 last:border-b-0 hover:bg-pink-100 transition-colors">
                           <td className="relative px-4 py-4">
                              <button
                                 type="button"
                                 className="inline-block text-sm font-bold text-pink-600 transition-all duration-300 hover:text-pink-800 hover:scale-125 focus:outline-none"
                                 onClick={() => setResumenAbierto(abiertoDesktop ? null : renta.id)}
                              >
                                 {renta.id}
                              </button>

                              {abiertoDesktop ? (
                                 <>
                                    <button
                                       type="button"
                                       className="fixed inset-0 z-40 bg-black/30 md:block"
                                       onClick={() => setResumenAbierto(null)}
                                       aria-label="Cerrar resumen"
                                    />
                                    <div className="fixed left-1/2 top-[130px] z-50 mx-auto max-h-[calc(100vh-180px)] w-[min(90vw,60rem)] -translate-x-1/2 overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl md:block">
                                       <div className="mb-3 flex items-start justify-between gap-3 border-b border-pink-100 pb-2">
                                          <h4 className="text-base font-semibold text-pink-600">Resumen de Renta {renta.id}</h4>
                                          <button
                                             type="button"
                                             className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                                             onClick={() => setResumenAbierto(null)}
                                          >
                                             ✕
                                          </button>
                                       </div>
                                       <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                          <div>
                                             <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">📏 Ajustes</p>
                                             {tieneAjuste && renta.fechaAjuste ? (
                                                <p className="mb-2 inline-block rounded-md bg-rose-50 px-2 py-1 text-xs text-rose-700">📅 {formatearFechaSafe(renta.fechaAjuste, { day: 'numeric', month: 'short' })}</p>
                                             ) : null}
                                             {tieneAjuste ? (
                                                <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-2 text-xs text-gray-600">
                                                   <p><strong>Bastilla:</strong> {renta.bastilla || '—'}</p>
                                                   <p><strong>Busto:</strong> {renta.busto || '—'}</p>
                                                   <p><strong>Tirantes:</strong> {renta.tirantes || '—'}</p>
                                                   <p><strong>Manga/P:</strong> {renta.mangaPuno || '—'}</p>
                                                   <p><strong>Cintura:</strong> {renta.cintura || '—'}</p>
                                                   <p><strong>Espalda:</strong> {renta.espalda || '—'}</p>
                                                </div>
                                             ) : (
                                                <p className="rounded-lg bg-gray-50 p-2 text-xs text-gray-500">❌ Sin modificaciones de costura.</p>
                                             )}
                                          </div>

                                          <div className="md:max-w-[220px]">
                                             <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Vestido</p>
                                             <p className="mb-2 rounded-lg bg-pink-50 px-2 py-1 text-sm font-semibold text-pink-700">✨ {nombreVestido}</p>
                                             <div className="aspect-[5/7] w-full overflow-hidden rounded-xl bg-gray-100">
                                                <img className="h-full w-full object-cover" src={renta.imagen_nombre ? `/images/${renta.imagen_nombre}` : '/images/default.jpg'} alt="Vestido" />
                                             </div>
                                          </div>

                                          <div>
                                             <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">📍 Cliente</p>
                                             <div className="mb-3 rounded-lg bg-pink-50/70 p-2 text-sm text-gray-700">
                                                <p><strong>Nombre:</strong> {renta.name}</p>
                                                <p><strong>Teléfono:</strong> {renta.telefono}</p>
                                                <p><strong>Fecha Renta:</strong> {formatearFechaSafe(renta.fechaRenta, opciones)}</p>
                                                <p><strong>Fecha Entrega:</strong> {formatearFechaSafe(renta.fechaEntrega, opciones)}</p>
                                                <p><strong>Fecha Devolución:</strong> {formatearFechaSafe(renta.fechaDevolucion, opciones)}</p>
                                             </div>
                                             <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-2 text-sm text-gray-700">
                                                <p><strong>Precio Renta:</strong> ${precioDeRenta}</p>
                                                <p className="mt-1"><strong>Anticipo Total:</strong> ${totalAnticipos}</p>
                                                <div className="mt-2 flex items-center justify-between border-t border-emerald-100 pt-2 text-sm font-semibold">
                                                   <span>Falta por pagar:</span>
                                                   <span className="text-red-600">${faltaPorPagarCalculado}</span>
                                                </div>
                                             </div>
                                          </div>

                                          <div>
                                             <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">👜 Complementos</p>
                                             <div className="mb-3 grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-2 text-xs text-gray-600">
                                                <p><strong>Bolso:</strong> {renta.bolso || '—'}</p>
                                                <p><strong>Aretes:</strong> {renta.aretes || '—'}</p>
                                             </div>
                                             {tieneNotas ? (
                                                <div className="rounded-lg border border-amber-100 bg-amber-50 p-2">
                                                   <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">📝 Notas</p>
                                                   <p className="max-h-24 overflow-y-auto text-sm text-amber-900">{renta.notes || renta.notas}</p>
                                                </div>
                                             ) : null}
                                          </div>
                                       </div>
                                    </div>
                                 </>
                              ) : null}
                           </td>

                           <td className="px-4 py-4 text-center">
                              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${esLiquidado ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                 {esLiquidado ? '✔' : '✕'}
                              </span>
                           </td>
                           <td className="px-4 py-4 text-sm text-gray-700">{renta.producto_nombre}</td>
                           <td className="px-4 py-4 text-sm text-gray-700">{renta.name}</td>
                           <td className="px-4 py-4 text-sm text-gray-700">{formatearFechaSafe(renta.fechaEntrega, opciones)}</td>
                           <td className="px-4 py-4">
                              <select
                                 className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
                                 value={renta.estado}
                                 onChange={(e) => handleEstadoChange(renta.id, e.target.value)}
                              >
                                 <option value="cita de ajustes">Cita de Ajustes</option>
                                 <option value="ajustes">Ajustes</option>
                                 <option value="planchado">Planchado</option>
                                 <option value="entregado">Entregado</option>
                                 <option value="devuelto">Devuelto</option>
                                 <option value="tintoreria">Tintorería</option>
                                 <option value="en tienda">En tienda</option>
                              </select>
                           </td>
                           <td className="px-4 py-4 text-sm text-gray-700">{formatearFechaSafe(renta.fechaDevolucion, opciones)}</td>
                           <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                 <button className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-lg text-pink-700 shadow-sm transition hover:bg-pink-200 hover:text-pink-700 shadow-sm" onClick={() => handleDownloadPdf(renta)}>
                                    <IoReceiptOutline />
                                 </button>
                                 <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg text-gray-600 shadow-sm transition hover:bg-pink-50 hover:text-pink-600" onClick={() => navigate(`/admin/renta/${renta.id}`)}>
                                    <MdEdit />
                                 </button>
                                 <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg text-gray-600 shadow-sm transition hover:bg-rose-50 hover:text-rose-600" onClick={() => handleDelete(renta.id)}>
                                    <MdDelete />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>

         <div className="space-y-3 md:hidden">
            {Array.isArray(rentasFiltradas) && rentasFiltradas.map((renta) => {
               const nombreVestido = renta.producto_nombre ? renta.producto_nombre : 'No especificado / Cargando...';
               const precioDeRenta = renta.precio_renta ? Number(renta.precio_renta || 0) : 0;
               const totalAnticipos = Number(renta.anticipoEfectivo || 0) + Number(renta.anticipoTarjeta || 0) + Number(renta.pendienteEfectivo || 0) + Number(renta.pendienteTarjeta || 0);
               const faltaPorPagarCalculado = precioDeRenta - totalAnticipos;
               const esLiquidado = renta.liquidado === true || renta.liquidado === 1 || renta.liquidado === '1' || renta.liquidado === 'true';
               const tieneAjuste = renta.ajuste === true || renta.ajuste === 1 || renta.ajuste === '1' || renta.ajuste === 'true';
               const tieneNotas = renta.notes || renta.notas;
               const abierto = resumenAbierto === renta.id;

               return (
                  <div key={renta.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                     <div className="flex items-start justify-between gap-3">
                        <div>
                           <p className="text-sm font-semibold text-pink-600">Renta #{renta.id}</p>
                           <p className="mt-1 text-sm font-medium text-gray-800">{nombreVestido}</p>
                           <p className="text-xs text-gray-500">{renta.name}</p>
                        </div>
                        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${esLiquidado ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                           {esLiquidado ? '✔' : '✕'}
                        </span>
                     </div>

                     <div className="mt-3 grid gap-2 text-sm text-gray-600">
                        <p><span className="font-semibold text-gray-700">Entrega:</span> {formatearFechaSafe(renta.fechaEntrega, opciones)}</p>
                        <p><span className="font-semibold text-gray-700">Devolución:</span> {formatearFechaSafe(renta.fechaDevolucion, opciones)}</p>
                        <p><span className="font-semibold text-gray-700">Estado:</span> {renta.estado}</p>
                     </div>

                     <div className="mt-3 flex items-center gap-2">
                        <select
                           className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none"
                           value={renta.estado}
                           onChange={(e) => handleEstadoChange(renta.id, e.target.value)}
                        >
                           <option value="cita de ajustes">Cita de Ajustes</option>
                           <option value="ajustes">Ajustes</option>
                           <option value="planchado">Planchado</option>
                           <option value="entregado">Entregado</option>
                           <option value="devuelto">Devuelto</option>
                           <option value="tintoreria">Tintorería</option>
                           <option value="en tienda">En tienda</option>
                        </select>
                        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-lg text-pink-700 shadow-sm transition hover:bg-pink-200 hover:text-pink-700 shadow-sm" onClick={() => handleDownloadPdf(renta)}>
                           <IoReceiptOutline />
                        </button>
                        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg text-gray-600 shadow-sm" onClick={() => navigate(`/admin/renta/${renta.id}`)}>
                           <MdEdit />
                        </button>
                        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg text-gray-600 shadow-sm" onClick={() => handleDelete(renta.id)}>
                           <MdDelete />
                        </button>
                     </div>

                     <button className="mt-3 text-sm font-semibold text-pink-600" onClick={() => setResumenAbierto(abierto ? null : renta.id)}>
                        {abierto ? 'Ocultar resumen' : 'Ver resumen'}
                     </button>

                     {abierto ? (
                        <div className="mt-3 space-y-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                           <p><strong>Cliente:</strong> {renta.name}</p>
                           <p><strong>Teléfono:</strong> {renta.telefono}</p>
                           <p><strong>Precio renta:</strong> ${precioDeRenta}</p>
                           <p><strong>Anticipo:</strong> ${totalAnticipos}</p>
                           <p><strong>Falta por pagar:</strong> ${faltaPorPagarCalculado}</p>
                           {tieneAjuste ? <p><strong>Ajuste:</strong> Sí</p> : <p><strong>Ajuste:</strong> No</p>}
                           {tieneNotas ? <p><strong>Notas:</strong> {renta.notes || renta.notas}</p> : null}
                        </div>
                     ) : null}
                  </div>
               );
            })}
         </div>
      </div>
   );
}