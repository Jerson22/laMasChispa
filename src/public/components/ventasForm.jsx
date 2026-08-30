import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useParams, useLocation } from 'react-router-dom';

const obtenerFechaLocalYMD = () => {
   const d = new Date();
   const offset = d.getTimezoneOffset();
   const localDate = new Date(d.getTime() - (offset * 60 * 1000));
   return localDate.toISOString().split('T')[0];
};

export default function VentasForm() {
   const { id } = useParams();
   const location = useLocation();
   const [productos, setProductos] = useState([]);
   const [clientes, setClientes] = useState([]);

   const [ventasForm, setVentasForm] = useState({
      id: '',
      name: '',
      productId: '',
      bolso: false,
      aretes: false,
      ajuste: false,
      fechaAjuste: '',
      fechaRenta: obtenerFechaLocalYMD(),
      fechaEntrega: '',
      fechaDevolucion: '',
      anticipoEfectivo: '',
      anticipoTarjeta: '',
      pendienteEfectivo: '',
      pendienteTarjeta: '',
      extraEfectivo: '',
      extraTarjeta: '',
      liquidado: false,
      notas: '',
      telefono: '',
      bastilla: '',
      busto: '',
      tirantes: '',
      mangaPuno: '',
      cintura: '',
      espalda: ''
   });
   const [loading, setLoading] = useState(true);
   const [uploading, setUploading] = useState(false);
   const [error, setError] = useState(null);
   const [searchTerm, setSearchTerm] = useState('');
   const [editandoFlag, setEditandoFlag] = useState(false);

   // NUEVOS ESTADOS PARA EL BUSCADOR DE PRODUCTOS CON IMAGEN
   const [productSearch, setProductSearch] = useState('');
   const [showDropdown, setShowDropdown] = useState(false);
   const [selectedProduct, setSelectedProduct] = useState(null);
   const [showClientDropdown, setShowClientDropdown] = useState(false);

   // Estados para token y navigate
   const navigate = useNavigate();
   const { token } = useOutletContext();

   // ESTADOS PARA HISTORIAL DE ABONOS (OPCIÓN 2)
   const [pagos, setPagos] = useState([]);
   const [nuevoPago, setNuevoPago] = useState({
      categoria: 'pendiente',
      metodo: 'efectivo',
      monto: '',
      fecha_pago: obtenerFechaLocalYMD()
   });

   const fetchPagos = async () => {
      if (!id) return;
      try {
         const res = await fetch(`/api/ventas/${id}/pagos`, {
            headers: { 'auth-token': token }
         });
         if (res.ok) {
            const data = await res.json();
            setPagos(data);
         }
      } catch (err) {
         console.error('Error fetching pagos:', err);
      }
   };

   const handleAgregarPago = async () => {
      if (!nuevoPago.monto || parseFloat(nuevoPago.monto) <= 0) {
         alert('Por favor introduce un monto válido.');
         return;
      }
      try {
         const response = await fetch(`/api/ventas/${id}/pagos`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'auth-token': token
            },
            body: JSON.stringify(nuevoPago)
         });
         if (response.ok) {
            setNuevoPago(prev => ({
               ...prev,
               monto: '',
               fecha_pago: obtenerFechaLocalYMD()
            }));
            await fetchPagos();
            
            // Actualizar el formulario con los nuevos totales sincronizados
            const ventaRes = await fetch(`/api/renta/${id}`, {
               headers: { 'auth-token': token }
            });
            if (ventaRes.ok) {
               const data = await ventaRes.json();
               setVentasForm(prev => ({
                  ...prev,
                  anticipoEfectivo: data.anticipoEfectivo || '',
                  anticipoTarjeta: data.anticipoTarjeta || '',
                  pendienteEfectivo: data.pendienteEfectivo || '',
                  pendienteTarjeta: data.pendienteTarjeta || '',
                  extraEfectivo: data.extraEfectivo || '',
                  extraTarjeta: data.extraTarjeta || '',
                  liquidado: data.liquidado === "1"
               }));
            }
         } else {
            const err = await response.json();
            alert(err.error || 'Error al agregar pago');
         }
      } catch (error) {
         console.error(error);
         alert('Error al conectar con el servidor');
      }
   };

   const handleEliminarPago = async (pagoId) => {
      if (!confirm('¿Estás seguro de que deseas eliminar este pago del historial?')) return;
      try {
         const response = await fetch(`/api/pagos/${pagoId}`, {
            method: 'DELETE',
            headers: { 'auth-token': token }
         });
         if (response.ok) {
            await fetchPagos();
            const ventaRes = await fetch(`/api/renta/${id}`, {
               headers: { 'auth-token': token }
            });
            if (ventaRes.ok) {
               const data = await ventaRes.json();
               setVentasForm(prev => ({
                  ...prev,
                  anticipoEfectivo: data.anticipoEfectivo || '',
                  anticipoTarjeta: data.anticipoTarjeta || '',
                  pendienteEfectivo: data.pendienteEfectivo || '',
                  pendienteTarjeta: data.pendienteTarjeta || '',
                  extraEfectivo: data.extraEfectivo || '',
                  extraTarjeta: data.extraTarjeta || '',
                  liquidado: data.liquidado === "1"
               }));
            }
         } else {
            alert('Error al eliminar el pago');
         }
      } catch (error) {
         console.error(error);
      }
   };



   useEffect(() => {
      const fetchVenta = async () => {
         // solo buscamos si hay ID (modo edición)
         if (!id) return;

         try {
            const response = await fetch(`/api/renta/${id}`, {
               headers: { 'auth-token': token }
            });
            if (!response.ok) {
               throw new Error('No se pudo cargar la venta');
            }
            const data = await response.json();
            // console.log('Respuesta de Venta: ', data);
            // rellenar el formulario si hay datos
            setVentasForm({
               id: data.id || id,
               name: data.name || '',
               productId: data.productId || '',
               bolso: data.bolso === "1",
               aretes: data.aretes === "1",
               ajuste: data.ajuste === "1",
               fechaAjuste: data.fechaAjuste ? data.fechaAjuste.split('T')[0] : '',
               fechaRenta: data.fechaRenta ? data.fechaRenta.split('T')[0] : '',
               fechaEntrega: data.fechaEntrega ? data.fechaEntrega.split('T')[0] : '',
               fechaDevolucion: data.fechaDevolucion ? data.fechaDevolucion.split('T')[0] : '',
               anticipoEfectivo: data.anticipoEfectivo || '',
               anticipoTarjeta: data.anticipoTarjeta || '',
               pendienteEfectivo: data.pendienteEfectivo || '',
               pendienteTarjeta: data.pendienteTarjeta || '',
               extraEfectivo: data.extraEfectivo || '',
               extraTarjeta: data.extraTarjeta || '',
               liquidado: data.liquidado === "1",
               notas: data.notas || '',
               telefono: data.telefono || '',
               bastilla: data.bastilla || '',
               busto: data.busto || '',
               tirantes: data.tirantes || '',
               mangaPuno: data.mangaPuno || '',
               cintura: data.cintura || '',
               espalda: data.espalda || '',
            });
            setEditandoFlag(true);
         } catch (err) {
            console.error('Error fetching ventas:', err);
            setError('Error al cargar ventas');
         }
      };
      fetchProductos();
      fetchClientes();
      fetchVenta();
      fetchPagos();
   }, [id, token]);

   // Si venimos de la página de un producto con ?productId=XX, preseleccionarlo
   useEffect(() => {
      if (!id) {
         const searchParams = new URLSearchParams(location.search);
         const paramProductId = searchParams.get('productId') || location.state?.productId;
         if (paramProductId) {
            setVentasForm(prev => ({ ...prev, productId: Number(paramProductId) }));
         }
      }
   }, [id, location.search, location.state]);

   // Este se dispara cuando cambia el productId (que viene de la BD o parámetro) o la lista de productos
   useEffect(() => {
      if (ventasForm.productId && productos.length > 0) {
         const p = productos.find(prod => prod.id === Number(ventasForm.productId));
         if (p) {
            setSelectedProduct(p);
            setProductSearch(p.name);
         }
      }
   }, [ventasForm.productId, productos]);

   // Traer Productos para el input Producto
   const fetchProductos = async () => {
      try {
         const response = await fetch('/api/productos');

         if (!response.ok) {
            console.error('Error fetching productos:', response.status);
            setProductos([]);
            setLoading(false);
            return;
         }

         const data = await response.json();
         setProductos(Array.isArray(data) ? data : []);
      } catch (err) {
         console.error('Error en fetchProductos:', err);
         setError('Error al cargar productos');
         setProductos([]);
      } finally {
         setLoading(false);
      }
   };

   // Traer Clientes
   const fetchClientes = async () => {
      try {
         const response = await fetch('/api/clientes', {
            headers: { 'auth-token': token }
         });

         if (response.ok) {
            const data = await response.json();
            setClientes(Array.isArray(data) ? data : []);
         }
      } catch (err) {
         console.error('Error fetching clientes:', err);
      }
   };

   // Manejar cuando cambia el formulario
   const handleVentasChange = (e) => {
      const { name, value, type, checked } = e.target;

      // Interceptamos específicamente el campo 'ajuste'
      if (name === 'ajuste') {
         if (!checked) {
            // SI SE DESMARCA: Desactivamos el ajuste y limpiamos todas las medidas a vacías
            setVentasForm((prev) => ({
               ...prev,
               ajuste: false,
               fechaAjuste: '',
               bastilla: '',
               busto: '',
               tirantes: '',
               mangaPuno: '',
               cintura: '',
               espalda: ''
            }));
         } else {
            // SI SE MARCA: Solo activamos el ajuste (mantiene los datos existentes si venían del update)
            setVentasForm((prev) => ({
               ...prev,
               ajuste: true
            }));
         }
      } else {
         // LÓGICA ORIGINAL: Para cualquier otro input (texto, números u otros checkboxes)
         setVentasForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
         }));
      }
   };

   // FUNCIÓN CUANDO SE SELECCIONA UN PRODUCTO DEL DESPLEGABLE Productos
   const handleSelectProduct = (producto) => {
      setVentasForm({
         ...ventasForm,
         productId: producto.id // Guarda el ID numérico en tu formulario original
      });
      setProductSearch(producto.name); // Muestra el nombre en el input de búsqueda
      setSelectedProduct(producto); // Guarda el objeto para renderizar la foto
      setShowDropdown(false); // Cierra el menú
   };

   // FUNCIÓN CUANDO SE SELECCIONA UN CLIENTE DEL DESPLEGABLE
   const handleSelectCliente = (cliente) => {
      setVentasForm({
         ...ventasForm,
         name: cliente.nombre,
         telefono: cliente.telefono || ''
      });
      setShowClientDropdown(false);
   };

   // Para envio de Formulario
   const handleVentaSubmit = async (e) => {
      e.preventDefault();

      // 1. Determinar si estamos editando o creando
      const isEditing = !!id; // Esto es true si existe id, false si es undefined

      if (!ventasForm.fechaRenta) {
         alert('⚠️ Por favor, selecciona la Fecha de Renta.');
         return;
      }

      // 2. Validar disponibilidad de fechas primero
      if (ventasForm.productId && ventasForm.fechaEntrega && ventasForm.fechaDevolucion) {
         try {
            const valRes = await fetch('/api/validar-disponibilidad', {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  'auth-token': token
               },
               body: JSON.stringify({
                  productId: Number(ventasForm.productId),
                  fechaEntrega: ventasForm.fechaEntrega,
                  fechaDevolucion: ventasForm.fechaDevolucion,
                  excludeId: isEditing ? id : null
               })
            });
            const valData = await valRes.json();

            if (!valRes.ok) throw new Error(valData.error || 'Error al validar fechas');

            if (!valData.disponible) {
               alert(`⚠️ El vestido seleccionado ya está ocupado en esas fechas.\n\nChoque con la renta #${valData.conflicto.id} (a nombre de ${valData.conflicto.name}), que abarca del ${valData.conflicto.fechaEntrega.split('T')[0]} al ${valData.conflicto.fechaDevolucion.split('T')[0]}.\n\nPor favor, cambia las fechas o selecciona otro vestido.`);
               return; // Detenemos el guardado
            }
         } catch (error) {
            console.error('Error de validación:', error);
            alert('Error al verificar la disponibilidad de las fechas.');
            return;
         }
      }

      const url = isEditing ? `/api/ventas/${id}` : '/api/ventas';
      const method = isEditing ? 'PUT' : 'POST';

      try {
         const body = {
            name: ventasForm.name,
            productId: Number(ventasForm.productId),
            bolso: ventasForm.bolso ? "1" : "0", // Convertimos bool a "1"/"0" para tu BD
            aretes: ventasForm.aretes ? "1" : "0",
            ajuste: ventasForm.ajuste ? "1" : "0",
            fechaAjuste: ventasForm.fechaAjuste || null,
            fechaRenta: ventasForm.fechaRenta,
            fechaEntrega: ventasForm.fechaEntrega,
            fechaDevolucion: ventasForm.fechaDevolucion,
            anticipoEfectivo: Number(ventasForm.anticipoEfectivo),
            pendienteEfectivo: Number(ventasForm.pendienteEfectivo),
            anticipoTarjeta: Number(ventasForm.anticipoTarjeta),
            pendienteTarjeta: Number(ventasForm.pendienteTarjeta),
            extraEfectivo: Number(ventasForm.extraEfectivo),
            extraTarjeta: Number(ventasForm.extraTarjeta),
            liquidado: ventasForm.liquidado ? "1" : "0",
            notas: ventasForm.notas,
            telefono: ventasForm.telefono,
            bastilla: ventasForm.bastilla,
            busto: ventasForm.busto,
            tirantes: ventasForm.tirantes,
            mangaPuno: ventasForm.mangaPuno,
            cintura: ventasForm.cintura,
            espalda: ventasForm.espalda
         };

         const response = await fetch(url, {
            method: method,
            headers: {
               'Content-Type': 'application/json',
               'auth-token': token
            },
            body: JSON.stringify(body)
         });

         if (!response.ok) throw new Error('Error al guardar la venta');

         alert(isEditing ? 'Venta actualizada correctamente' : 'Venta registrada correctamente');

         // Si fue una creación, limpiamos el form
         if (!isEditing) {
            setVentasForm({
               name: '',
               productId: '',
               bolso: false,
               aretes: false,
               ajuste: false,
               fechaAjuste: '',
               fechaRenta: '',
               fechaEntrega: '',
               fechaDevolucion: '',
               anticipoEfectivo: '',
               anticipoTarjeta: '',
               pendienteEfectivo: '',
               pendienteTarjeta: '',
               extraEfectivo: '',
               extraTarjeta: '',
               liquidado: false,
               notas: '',
               telefono: '',
               bastilla: '',
               busto: '',
               tirantes: '',
               mangaPuno: '',
               cintura: '',
               espalda: ''
            });
            setProductSearch('');
            setSelectedProduct(null);
         }
         navigate('/admin/rentas');

      } catch (err) {
         alert(err.message);
      }
   };

   if (loading) return <div className="admin-msg">Cargando panel...</div>;

   // Filtrado dinámico en tiempo real para las sugerencias del desplegable
   const sugerenciasProductos = productos.filter((p) => {
      const term = productSearch.toLowerCase();
      return (
         p.name.toLowerCase().includes(term) ||
         p.id.toString().includes(term) ||
         (p.talla && p.talla.toLowerCase().includes(term))
      );
   });

   const sugerenciasClientes = clientes.filter((c) => {
      const term = ventasForm.name.toLowerCase();
      return (
         c.nombre && c.nombre.toLowerCase().includes(term)
      );
   });


   const handleEnviarRecibo = async (ventasForm) => {
      try {
         const response = await fetch('/api/reciboPdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'auth-token': token },
            body: JSON.stringify(ventasForm)
         });

         if (!response.ok) throw new Error("Error en el servidor");

         // ⚠️ CRÍTICO: Esto transforma la respuesta del servidor en un archivo descargable
         const blob = await response.blob();

         // Crear el enlace invisible en el navegador para forzar la descarga
         const urlDescarga = window.URL.createObjectURL(blob);
         const linkTemporal = document.createElement('a');
         linkTemporal.href = urlDescarga;
         linkTemporal.download = `Recibo_Venta.pdf`; // Nombre del archivo

         document.body.appendChild(linkTemporal);
         linkTemporal.click(); // Simula el clic de descarga
         linkTemporal.remove();
         window.URL.revokeObjectURL(urlDescarga);

         // alert("¡Recibo generado y descargado con éxito!");

      } catch (error) {
         console.error("Error al descargar:", error);
         alert("No se pudo descargar el recibo");
      }
   };

   return (
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
         <section className="rounded-[28px] bg-white p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            <form onSubmit={handleVentaSubmit} className="space-y-6">
               <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
                  <h2 className="text-2xl font-semibold text-gray-900">{editandoFlag ? `Tarjeta #${id}` : 'Nueva Venta'}</h2>

                  {/* Desktop Fecha de Renta */}
                  <div className="hidden lg:flex items-center gap-3">
                     <label className="block text-sm font-semibold text-gray-600 whitespace-nowrap">Fecha de Renta</label>
                     <input
                        type="date"
                        name="fechaRenta"
                        value={ventasForm.fechaRenta}
                        onChange={handleVentasChange}
                        className="block w-48 appearance-none rounded-3xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                        style={{ WebkitAppearance: 'none' }}
                     />
                  </div>
               </div>

               <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                  <div className="space-y-6 order-1 lg:order-none">
                     <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-3 relative">
                           <label className="block text-sm font-semibold text-gray-600">Cliente (Escribe para buscar)</label>
                           <input
                              type="text"
                              name="name"
                              value={ventasForm.name}
                              onChange={(e) => {
                                 handleVentasChange(e);
                                 setShowClientDropdown(true);
                              }}
                              onFocus={() => setShowClientDropdown(true)}
                              onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                              required
                              className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                           />

                           {showClientDropdown && ventasForm.name.length > 0 && (
                              <div className="absolute inset-x-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl">
                                 {sugerenciasClientes.length > 0 ? (
                                    sugerenciasClientes.map((c) => (
                                       <button
                                          key={c.id}
                                          type="button"
                                          onMouseDown={() => handleSelectCliente(c)}
                                          className="flex w-full flex-col border-b border-gray-100 px-4 py-3 text-left transition hover:bg-pink-50"
                                       >
                                          <p className="text-sm font-semibold text-gray-800">{c.nombre}</p>
                                          <p className="text-xs text-gray-500">{c.telefono || 'Sin teléfono'} · {c.email || 'Sin correo'}</p>
                                       </button>
                                    ))
                                 ) : (
                                    <div className="px-4 py-3 text-sm text-gray-500">No se encontraron clientes</div>
                                 )}
                              </div>
                           )}
                        </div>
                        <div className="space-y-3">
                           <label className="block text-sm font-semibold text-gray-600">Teléfono</label>
                           <input
                              type="text"
                              name="telefono"
                              value={ventasForm.telefono}
                              onChange={handleVentasChange}
                              required
                              className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                           />
                        </div>
                     </div>

                     {/* Mobile Fecha de Renta */}
                     <div className="block lg:hidden space-y-3">
                        <label className="block text-sm font-semibold text-gray-600">Fecha de Renta</label>
                        <input
                           type="date"
                           name="fechaRenta"
                           value={ventasForm.fechaRenta}
                           onChange={handleVentasChange}
                           className="block w-full appearance-none rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                           style={{ WebkitAppearance: 'none' }}
                        />
                     </div>

                     <div className="relative">
                        <label className="block text-sm font-semibold text-gray-600">Producto (Escribe para buscar)</label>
                        <input
                           type="text"
                           placeholder="Buscar por nombre, ID o talla..."
                           value={productSearch}
                           onChange={(e) => {
                              setProductSearch(e.target.value);
                              setShowDropdown(true);
                           }}
                           onFocus={() => setShowDropdown(true)}
                           required
                           className="mt-2 w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                        />

                        {showDropdown && productSearch.length > 0 && (
                           <div className="absolute inset-x-0 top-full z-30 mt-3 max-h-72 overflow-y-auto rounded-3xl border border-gray-200 bg-white shadow-2xl">
                              {sugerenciasProductos.length > 0 ? (
                                 sugerenciasProductos.map((p) => (
                                    <button
                                       key={p.id}
                                       type="button"
                                       onClick={() => handleSelectProduct(p)}
                                       className="flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left transition hover:bg-pink-50"
                                    >
                                       <img
                                          src={p.imagenes && p.imagenes[0] ? `/images/${p.imagenes[0]}` : 'https://via.placeholder.com/40x50?text=No+Img'}
                                          alt={p.name}
                                          className="h-14 w-11 rounded-xl object-cover"
                                       />
                                       <div className="min-w-0">
                                          <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                                          <p className="text-xs text-gray-500">ID: {p.id}{p.talla ? ` · Talla: ${p.talla}` : ''}</p>
                                       </div>
                                    </button>
                                 ))
                              ) : (
                                 <div className="px-4 py-3 text-sm text-gray-500">No se encontraron productos</div>
                              )}
                           </div>
                        )}
                     </div>

                     {selectedProduct && (
                        <div className="flex flex-col gap-4 rounded-[24px] border border-pink-100 bg-pink-50/70 p-4 shadow-sm sm:flex-row">
                           <img
                              src={selectedProduct.imagenes && selectedProduct.imagenes[0] ? `/images/${selectedProduct.imagenes[0]}` : 'https://via.placeholder.com/100x130?text=No+Foto'}
                              alt="Vista previa"
                              className="h-32 w-24 flex-none rounded-3xl object-cover"
                           />
                           <div className="space-y-1 text-sm text-gray-700">
                              <h4 className="text-base font-semibold text-pink-700">{selectedProduct.name}</h4>
                              {selectedProduct.talla && <p><span className="font-semibold text-gray-800">Talla:</span> {selectedProduct.talla}</p>}
                              {selectedProduct.precio_vestido && <p><span className="font-semibold text-gray-800">Precio Vestido:</span> ${selectedProduct.precio_vestido}</p>}
                              {selectedProduct.precio_renta && <p><span className="font-semibold text-gray-800">Precio Renta:</span> ${selectedProduct.precio_renta}</p>}
                              {selectedProduct.precio_venta && <p><span className="font-semibold text-gray-800">Precio Venta:</span> ${selectedProduct.precio_venta}</p>}
                           </div>
                        </div>
                     )}

                     <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-3 rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 transition hover:border-pink-300">
                           <input
                              type="checkbox"
                              name="bolso"
                              checked={ventasForm.bolso}
                              onChange={handleVentasChange}
                              className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                           />
                           Bolso
                        </label>
                        <label className="flex items-center gap-3 rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 transition hover:border-pink-300">
                           <input
                              type="checkbox"
                              name="aretes"
                              checked={ventasForm.aretes}
                              onChange={handleVentasChange}
                              className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                           />
                           Aretes
                        </label>
                     </div>

                     <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-end">
                        <label className="flex items-center gap-3 rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                           <input
                              type="checkbox"
                              name="ajuste"
                              checked={ventasForm.ajuste}
                              onChange={handleVentasChange}
                              className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                           />
                           Ajustes
                        </label>
                        <div className="space-y-2 min-w-0">
                           <label className="block text-sm font-semibold text-gray-600">Fecha de Ajuste</label>
                           <input
                              type="date"
                              name="fechaAjuste"
                              value={ventasForm.fechaAjuste}
                              onChange={handleVentasChange}
                              className="block w-full max-w-full shrink appearance-none rounded-3xl border border-gray-200 bg-gray-50 px-3 sm:px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                              style={{ WebkitAppearance: 'none' }}
                           />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6 order-3 lg:order-none">
                     <div className="space-y-3 min-w-0">
                        <label className="block text-sm font-semibold text-gray-600">Fecha de Entrega</label>
                        <input
                           type="date"
                           name="fechaEntrega"
                           value={ventasForm.fechaEntrega}
                           onChange={handleVentasChange}
                           className="block w-full max-w-full shrink appearance-none rounded-3xl border border-gray-200 bg-gray-50 px-3 sm:px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                           style={{ WebkitAppearance: 'none' }}
                        />
                     </div>
                     <div className="space-y-3 min-w-0">
                        <label className="block text-sm font-semibold text-gray-600">Fecha de Devolución</label>
                        <input
                           type="date"
                           name="fechaDevolucion"
                           value={ventasForm.fechaDevolucion}
                           onChange={handleVentasChange}
                           className="block w-full max-w-full shrink appearance-none rounded-3xl border border-gray-200 bg-gray-50 px-3 sm:px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                           style={{ WebkitAppearance: 'none' }}
                        />
                     </div>
                  </div>

                  {ventasForm.ajuste && (
                     <div className="grid gap-4 rounded-[28px] border border-gray-200 bg-gray-50 p-6 md:grid-cols-3 order-2 lg:order-none lg:col-span-2">
                        <div className="space-y-3">
                           <div>
                              <label className="block text-sm font-semibold text-gray-600">Bastilla</label>
                              <input
                                 type="text"
                                 name="bastilla"
                                 value={ventasForm.bastilla}
                                 onChange={handleVentasChange}
                                 className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-semibold text-gray-600">Busto</label>
                              <input
                                 type="text"
                                 name="busto"
                                 value={ventasForm.busto}
                                 onChange={handleVentasChange}
                                 className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                              />
                           </div>
                        </div>

                        <div className="space-y-3">
                           <div>
                              <label className="block text-sm font-semibold text-gray-600">Tirantes</label>
                              <input
                                 type="text"
                                 name="tirantes"
                                 value={ventasForm.tirantes}
                                 onChange={handleVentasChange}
                                 className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-semibold text-gray-600">Manga/Puño</label>
                              <input
                                 type="text"
                                 name="mangaPuno"
                                 value={ventasForm.mangaPuno}
                                 onChange={handleVentasChange}
                                 className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                              />
                           </div>
                        </div>

                        <div className="space-y-3">
                           <div>
                              <label className="block text-sm font-semibold text-gray-600">Cintura</label>
                              <input
                                 type="text"
                                 name="cintura"
                                 value={ventasForm.cintura}
                                 onChange={handleVentasChange}
                                 className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-semibold text-gray-600">Espalda</label>
                              <input
                                 type="text"
                                 name="espalda"
                                 value={ventasForm.espalda}
                                 onChange={handleVentasChange}
                                 className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                              />
                           </div>
                        </div>
                     </div>
                  )}
               </div>

               <div className="space-y-4 border-t border-gray-200 pt-6">
                  <div className="space-y-3">
                     <label className="block text-sm font-semibold text-gray-600">Notas</label>
                     <textarea
                        name="notas"
                        value={ventasForm.notas}
                        onChange={handleVentasChange}
                        placeholder="Opcional"
                        className="min-h-[112px] w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                     />
                  </div>

                  {!editandoFlag ? (
                     // MODO CREACIÓN: Campos estáticos simplificados
                     <div className="grid gap-6 md:grid-cols-3">
                        <div className="rounded-[28px] border border-gray-200 bg-gray-50 p-6">
                           <h3 className="mb-4 text-base font-bold text-gray-900">Pago Inicial (Anticipo)</h3>
                           <div className="space-y-4">
                              <div>
                                 <label className="block text-sm font-semibold text-gray-600">Efectivo</label>
                                 <input
                                    type="number"
                                    name="anticipoEfectivo"
                                    value={ventasForm.anticipoEfectivo}
                                    onChange={handleVentasChange}
                                    placeholder="0"
                                    className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                                 />
                              </div>
                              <div>
                                 <label className="block text-sm font-semibold text-gray-600">Tarjeta</label>
                                 <input
                                    type="number"
                                    name="anticipoTarjeta"
                                    value={ventasForm.anticipoTarjeta}
                                    onChange={handleVentasChange}
                                    placeholder="0"
                                    className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                                 />
                              </div>

                              <div className="border-t border-gray-200 pt-4 mt-4">
                                 <h4 className="text-sm font-bold text-gray-700 mb-3">Cargos Días Extra (Opcional)</h4>
                                 <div className="grid gap-3 grid-cols-2">
                                    <div>
                                       <label className="block text-xs font-semibold text-gray-500">Efectivo</label>
                                       <input
                                          type="number"
                                          name="extraEfectivo"
                                          value={ventasForm.extraEfectivo}
                                          onChange={handleVentasChange}
                                          placeholder="0"
                                          className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none transition focus:border-pink-400 focus:ring-1 focus:ring-pink-100"
                                       />
                                    </div>
                                    <div>
                                       <label className="block text-xs font-semibold text-gray-500">Tarjeta</label>
                                       <input
                                          type="number"
                                          name="extraTarjeta"
                                          value={ventasForm.extraTarjeta}
                                          onChange={handleVentasChange}
                                          placeholder="0"
                                          className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none transition focus:border-pink-400 focus:ring-1 focus:ring-pink-100"
                                       />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="rounded-[28px] border border-pink-100 bg-pink-50/30 p-6 flex flex-col justify-between">
                           <div>
                              <h3 className="mb-4 text-base font-bold text-pink-700">Resumen de Renta</h3>
                              <div className="space-y-3 text-sm text-gray-700">
                                 <div className="flex justify-between border-b border-pink-100 pb-1.5">
                                    <span>Precio Vestido:</span>
                                    <span className="font-bold text-gray-900">${selectedProduct ? selectedProduct.precio_renta : '0.00'}</span>
                                 </div>
                                 <div className="flex justify-between border-b border-pink-100 pb-1.5">
                                    <span>Días Extra:</span>
                                    <span className="font-bold text-gray-900">${Number(ventasForm.extraEfectivo || 0) + Number(ventasForm.extraTarjeta || 0)}</span>
                                 </div>
                                 <div className="flex justify-between border-b border-pink-100 pb-1.5">
                                    <span>Anticipo Registrado:</span>
                                    <span className="font-bold text-emerald-600">${Number(ventasForm.anticipoEfectivo || 0) + Number(ventasForm.anticipoTarjeta || 0)}</span>
                                 </div>
                                 <div className="flex justify-between pt-1">
                                    <span className="font-semibold text-gray-800">Resta al Entregar:</span>
                                    <span className="font-extrabold text-red-600">
                                       ${selectedProduct ? Math.max(0, Number(selectedProduct.precio_renta) - (Number(ventasForm.anticipoEfectivo || 0) + Number(ventasForm.anticipoTarjeta || 0))) : '0.00'}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex flex-col justify-center items-center rounded-[28px] border border-gray-200 bg-gray-50 p-6">
                           <label className="flex items-center gap-3 rounded-3xl border border-gray-200 bg-white px-5 py-4 text-sm font-semibold text-gray-700 shadow-sm cursor-pointer hover:border-pink-300 transition">
                              <input
                                 type="checkbox"
                                 name="liquidado"
                                 checked={ventasForm.liquidado}
                                 onChange={handleVentasChange}
                                 className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                              />
                              Liquidado
                           </label>
                        </div>
                     </div>
                  ) : (
                     // MODO EDICIÓN: Historial de Abonos Interactivo (Opción 2)
                     <div className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-4">
                           <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-center">
                              <p className="text-xs font-semibold text-gray-500 uppercase">Precio Renta</p>
                              <p className="text-xl font-bold text-gray-800">${selectedProduct ? selectedProduct.precio_renta : '0'}</p>
                           </div>
                           <div className="rounded-2xl border border-pink-100 bg-pink-50/50 p-4 text-center">
                              <p className="text-xs font-semibold text-pink-600 uppercase">Total Pagado</p>
                              <p className="text-xl font-bold text-pink-700">
                                 ${Number(ventasForm.anticipoEfectivo || 0) + Number(ventasForm.anticipoTarjeta || 0) + Number(ventasForm.pendienteEfectivo || 0) + Number(ventasForm.pendienteTarjeta || 0)}
                              </p>
                           </div>
                           <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-center">
                              <p className="text-xs font-semibold text-gray-500 uppercase">Pendiente</p>
                              <p className="text-xl font-bold text-red-600">
                                 ${selectedProduct ? Math.max(0, Number(selectedProduct.precio_renta) - (Number(ventasForm.anticipoEfectivo || 0) + Number(ventasForm.anticipoTarjeta || 0) + Number(ventasForm.pendienteEfectivo || 0) + Number(ventasForm.pendienteTarjeta || 0))) : '0'}
                              </p>
                           </div>
                           <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-4">
                              <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 cursor-pointer">
                                 <input
                                    type="checkbox"
                                    name="liquidado"
                                    checked={ventasForm.liquidado}
                                    onChange={handleVentasChange}
                                    className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                 />
                                 Liquidado
                              </label>
                           </div>
                        </div>

                        <div className="rounded-[28px] border border-gray-200 bg-gray-50 p-6">
                           <h3 className="mb-4 text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">Historial de Abonos</h3>
                           
                           {pagos.length > 0 ? (
                              <div className="overflow-x-auto">
                                 <table className="w-full text-left text-sm text-gray-700">
                                    <thead>
                                       <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                                          <th className="py-2 px-3">Fecha</th>
                                          <th className="py-2 px-3">Concepto</th>
                                          <th className="py-2 px-3">Método</th>
                                          <th className="py-2 px-3 text-right">Monto</th>
                                          <th className="py-2 px-3 text-center">Acciones</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                       {pagos.map((p) => (
                                          <tr key={p.ids} className="hover:bg-white/50 transition">
                                             <td className="py-2.5 px-3 whitespace-nowrap">{new Date(p.fecha_pago).toISOString().split('T')[0]}</td>
                                             <td className="py-2.5 px-3 capitalize font-semibold">{p.categoria}</td>
                                             <td className="py-2.5 px-3 capitalize">{p.metodo}</td>
                                             <td className="py-2.5 px-3 text-right font-bold text-pink-600">${p.monto}</td>
                                             <td className="py-2.5 px-3 text-center">
                                                <button
                                                   type="button"
                                                   onClick={() => handleEliminarPago(p.ids)}
                                                   className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition"
                                                >
                                                   Eliminar
                                                </button>
                                             </td>
                                          </tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                           ) : (
                              <p className="text-sm text-gray-500 py-2">No se han registrado abonos para esta renta.</p>
                           )}

                           <div className="mt-6 border-t border-gray-200 pt-6">
                              <h4 className="mb-4 text-sm font-bold text-gray-800 uppercase">Registrar Nuevo Abono</h4>
                              <div className="grid gap-4 sm:grid-cols-5 items-end">
                                 <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase">Concepto</label>
                                    <select
                                       value={nuevoPago.categoria}
                                       onChange={(e) => setNuevoPago({ ...nuevoPago, categoria: e.target.value })}
                                       className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                                    >
                                       <option value="anticipo">Anticipo</option>
                                       <option value="pendiente">Pendiente</option>
                                       <option value="extra">Extra</option>
                                    </select>
                                 </div>
                                 <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase">Método</label>
                                    <select
                                       value={nuevoPago.metodo}
                                       onChange={(e) => setNuevoPago({ ...nuevoPago, metodo: e.target.value })}
                                       className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                                    >
                                       <option value="efectivo">Efectivo</option>
                                       <option value="tarjeta">Tarjeta</option>
                                    </select>
                                 </div>
                                 <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase">Monto</label>
                                    <input
                                       type="number"
                                       value={nuevoPago.monto}
                                       onChange={(e) => setNuevoPago({ ...nuevoPago, monto: e.target.value })}
                                       placeholder="Monto"
                                       className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                                    />
                                 </div>
                                 <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase">Fecha de Pago</label>
                                    <input
                                       type="date"
                                       value={nuevoPago.fecha_pago}
                                       onChange={(e) => setNuevoPago({ ...nuevoPago, fecha_pago: e.target.value })}
                                       className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                                    />
                                 </div>
                                 <div>
                                    <button
                                       type="button"
                                       onClick={handleAgregarPago}
                                       className="w-full rounded-full bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-700"
                                    >
                                       Agregar Pago
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}
               </div>

               <div className="flex flex-col gap-4 sm:flex-row">
                  <button
                     type="submit"
                     className="inline-flex w-full items-center justify-center rounded-full bg-pink-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-700 sm:w-auto"
                  >
                     {editandoFlag ? 'Guardar Cambios' : 'Registrar Renta'}
                  </button>
               </div>
            </form>
         </section>

         {showDropdown && (
            <div
               className="fixed inset-0 z-20 bg-transparent"
               onClick={() => setShowDropdown(false)}
            />
         )}
      </div>
   );
};
