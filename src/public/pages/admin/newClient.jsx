import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NewClient = () => {
   const [productos, setProductos] = useState([]);
   const [clientes, setClientes] = useState([]);
   const [form, setForm] = useState({
      id: null,
      name: '',
      precio_venta: '',
      precio_renta: '',
      silueta: '',
      mangas: '',
      color: '',
      talla: '',
      imagenes: [''],
      descripcion: '',
      vestido: true
   });
   const [clientForm, setClientForm] = useState({
      id: null,
      nombre: '',
      telefono: '',
      email: '',
      municipio: ''
   });
   const [reserveForm, setReserveForm] = useState({
      clienteId: '',
      name: '',
      productoId: '',
      bolso: false,
      aretes: false,
      ajuste: false,
      fechaAjustes: '',
      fechaRenta: '',
      fechaEntrega: '',
      fechaDevolucion: '',
      anticipo: '',
      pendiente: '',
      notas: '',
   });
   const [loading, setLoading] = useState(true);
   const [uploading, setUploading] = useState(false);
   const [error, setError] = useState(null);
   const [clientSearchTerm, setClientSearchTerm] = useState('');
   const navigate = useNavigate();
   const token = localStorage.getItem('token');

   // Función para limpiar sesión
   const clearSession = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
   };

   // Función para verificar si la respuesta es un error de autenticación
   const handleAuthError = (response) => {
      if (response.status === 401 || response.status === 403) {
         clearSession();
         return true;
      }
      return false;
   };

   useEffect(() => {
      // Verificar si hay token y si es admin
      const storedUser = localStorage.getItem('user');
      let parsedUser = null;
      try {
         parsedUser = storedUser ? JSON.parse(storedUser) : null;
      } catch {
         parsedUser = null;
      }

      if (!token || !parsedUser || (parsedUser.rol !== 'admin' && parsedUser.rol !== 'chispa1')) {
         clearSession();
         return;
      }

      // Validar que el token siga siendo válido en el servidor
      validateToken();
      fetchProductos();
      fetchClientes();
   }, [token, navigate]);

   // Función para validar el token con el servidor
   const validateToken = async () => {
      try {
         const response = await fetch('/auth/validate', {
            headers: { 'auth-token': token }
         });

         if (response.status === 401 || response.status === 403) {
            // Token inválido, expirado o no autorizado
            clearSession();
            return false;
         }

         return response.ok;
      } catch (err) {
         console.error('Error validating token:', err);
         return false;
      }
   };

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

   const fetchClientes = async () => {
      try {
         const response = await fetch('/api/clientes', {
            headers: { 'auth-token': token }
         });
         
         if (handleAuthError(response)) return;
         
         if (!response.ok) {
            console.error('Error fetching clientes:', response.status);
            setClientes([]);
            return;
         }
         
         const data = await response.json();
         setClientes(Array.isArray(data) ? data : []);
      } catch (err) {
         console.error('Error en fetchClientes:', err);
         setClientes([]);
      }
   };

   const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      const method = form.id ? 'PUT' : 'POST';
      const url = form.id ? `/api/productos/${form.id}` : '/api/productos';

      try {
         const response = await fetch(url, {
            method,
            headers: {
               'Content-Type': 'application/json',
               'auth-token': token
            },
            body: JSON.stringify(form)
         });

         if (handleAuthError(response)) return;

         if (response.ok) {
            alert(form.id ? 'Producto actualizado' : 'Producto creado');
            setForm({ id: null, name: '', precio_venta: '', precio_renta: '', color: '', talla: '', silueta:'', mangas:'', imagenes: [''], descripcion: '', vestido: true });
            fetchProductos();
         } else {
            const data = await response.json();
            alert(data.error || 'Error en la operación');
         }
      } catch (err) {
         alert('Error de conexión');
      }
   };

   const handleEdit = (v) => {
      setForm({
         ...v,
         vestido: v.vestido === '1' || v.vestido === true || v.vestido === 1,
         imagenes: v.imagenes && v.imagenes.length > 0 ? v.imagenes : ['']
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };

   const handleDelete = async (id) => {
      if (!window.confirm('¿Seguro que quieres eliminar este producto?')) return;

      try {
         const response = await fetch(`/api/productos/${id}`, {
            method: 'DELETE',
            headers: { 'auth-token': token }
         });

         if (handleAuthError(response)) return;

         if (response.ok) {
            fetchProductos();
         } else {
            alert('No se pudo eliminar');
         }
      } catch (err) {
         alert('Error de conexión');
      }
   };

   const handleImageChange = (index, value) => {
      const newImagenes = [...form.imagenes];
      newImagenes[index] = value;
      setForm({ ...form, imagenes: newImagenes });
   };

   const addImageInput = () => {
      setForm({ ...form, imagenes: [...form.imagenes, ''] });
   };

   const removeImageInput = (index) => {
      if (form.imagenes.length > 1) {
         const newImagenes = form.imagenes.filter((_, i) => i !== index);
         setForm({ ...form, imagenes: newImagenes });
      }
   };

   const handleFileUpload = async (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      
      setUploading(true);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
          formData.append('images', files[i]);
      }

      try {
          const response = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'auth-token': token },
              body: formData
          });
          const data = await response.json();
          if (response.ok) {
              const filteredImagenes = form.imagenes.filter(img => img.trim() !== '');
              setForm({ ...form, imagenes: [...filteredImagenes, ...data.filenames] });
          } else {
              alert(data.error || 'Error al subir imágenes');
          }
      } catch (err) {
          alert('Error de conexión al subir imágenes');
      } finally {
          setUploading(false);
      }
   };

   const handleClientChange = (e) => {
      setClientForm({ ...clientForm, [e.target.name]: e.target.value });
   };

   const handleClientSubmit = async (e) => {
      e.preventDefault();
      const isEditing = !!clientForm.id;
      const url = isEditing ? `/api/clientes/${clientForm.id}` : '/api/clientes';
      const method = isEditing ? 'PUT' : 'POST';

      try {
         const response = await fetch(url, {
            method,
            headers: {
               'Content-Type': 'application/json',
               'auth-token': token
            },
            body: JSON.stringify(clientForm)
         });

         if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'No se pudo guardar el cliente');
         }

         const savedClient = await response.json();
         if (isEditing) {
            setClientes(clientes.map(c => c.id === savedClient.id ? savedClient : c));
            alert('Cliente actualizado correctamente');
         } else {
            setClientes([...clientes, savedClient]);
            alert('Cliente registrado correctamente');
         }
         
         setClientForm({ id: null, nombre: '', telefono: '', email: '', municipio: '' });
      } catch (err) {
         alert(err.message);
      }
   };

   const handleClientEdit = (cliente) => {
      setClientForm({
         id: cliente.id,
         nombre: cliente.nombre || '',
         telefono: cliente.telefono || '',
         email: cliente.email || '',
         municipio: cliente.municipio || ''
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };

   const handleClientDelete = async (id) => {
      if (!window.confirm('¿Seguro que quieres eliminar este cliente?')) return;

      try {
         const response = await fetch(`/api/clientes/${id}`, {
            method: 'DELETE',
            headers: { 'auth-token': token }
         });

         if (handleAuthError(response)) return;

         if (response.ok) {
            fetchClientes();
            alert('Cliente eliminado');
         } else {
            const data = await response.json();
            alert(data.error || 'No se pudo eliminar');
         }
      } catch (err) {
         alert('Error de conexión');
      }
   };

   const handleReserveChange = (e) => {
      const { name, value, type, checked } = e.target;
      setReserveForm({ 
         ...reserveForm, 
         [name]: type === 'checkbox' ? checked : value 
      });
   };

   const handleReserveItemChange = (index, field, value) => {
      const newItems = [...reserveForm.items];
      newItems[index][field] = value;
      setReserveForm({ ...reserveForm, items: newItems });
   };

   const addReserveItem = () => {
      setReserveForm({
         ...reserveForm,
         items: [...reserveForm.items, { productoId: '', cantidad: 1, rol: 'vestido', estadoItem: 'pendiente', precioUnitario: '', notas: '' }]
      });
   };

   const removeReserveItem = (index) => {
      if (reserveForm.items.length === 1) return;
      const newItems = reserveForm.items.filter((_, i) => i !== index);
      setReserveForm({ ...reserveForm, items: newItems });
   };

   const handleReserveSubmit = async (e) => {
      e.preventDefault();
      try {
         const body = {
            clienteId: Number(reserveForm.clienteId),
            name: reserveForm.name,
            productoId: Number(reserveForm.productoId),
            bolso: reserveForm.bolso,
            aretes: reserveForm.aretes,
            ajuste: reserveForm.ajuste,
            fechaAjustes: reserveForm.fechaAjustes || null,
            fechaRenta: reserveForm.fechaRenta,
            fechaEntrega: reserveForm.fechaEntrega,
            fechaDevolucion: reserveForm.fechaDevolucion,
            anticipo: Number(reserveForm.anticipo),
            pendiente: Number(reserveForm.pendiente),
            notas: reserveForm.notas
         };

         const response = await fetch('/api/ventas', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'auth-token': token
            },
            body: JSON.stringify(body)
         });

         if (!response.ok) {
            const text = await response.text();
            try {
               const data = JSON.parse(text);
               throw new Error(data.error || 'No se pudo crear la venta');
            } catch (parseErr) {
               console.error('Error response:', text);
               throw new Error('Error del servidor al crear la venta');
            }
         }

         alert('Venta registrada correctamente');
         setReserveForm({
            clienteId: '',
            name: '',
            productoId: '',
            bolso: false,
            aretes: false,
            ajuste: false,
            fechaAjustes: '',
            fechaRenta: '',
            fechaEntrega: '',
            fechaDevolucion: '',
            anticipo: '',
            pendiente: '',
            notas: '',
         });
         alert('venta registrada correctamente');
      } catch (err) {
         alert(err.message);
      }
   };

   const logout = () => {
      localStorage.clear();
      navigate('/login');
   };

   if (loading) return <div className="text-center p-24 text-2xl text-gray-500">Cargando panel...</div>;

   const clientesFiltrados = clientes.filter((c) => {
      if (!clientSearchTerm) return true;
      return c.nombre && c.nombre.toLowerCase().includes(clientSearchTerm.toLowerCase());
   });

   return (
      <div className="max-w-5xl mx-auto my-5 md:my-10 p-2.5 md:p-5">

         <section className="bg-white p-5 md:p-8 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{clientForm.id ? 'Editar Cliente' : 'Registrar nuevo cliente'}</h2>
            <form onSubmit={handleClientSubmit}>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="flex flex-col">
                     <label className="text-sm font-bold text-gray-600 mb-1">Nombre</label>
                     <input name="nombre" value={clientForm.nombre} onChange={handleClientChange} required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400" />
                  </div>
                  <div className="flex flex-col">
                     <label className="text-sm font-bold text-gray-600 mb-1">Teléfono</label>
                     <input name="telefono" value={clientForm.telefono} onChange={handleClientChange} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400" />
                  </div>
                  <div className="flex flex-col">
                     <label className="text-sm font-bold text-gray-600 mb-1">Email</label>
                     <input type="email" name="email" value={clientForm.email} onChange={handleClientChange} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400" />
                  </div>
                  <div className="flex flex-col">
                     <label className="text-sm font-bold text-gray-600 mb-1">Municipio</label>
                     <input name="municipio" value={clientForm.municipio} onChange={handleClientChange} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400" />
                  </div>
               </div>
               <div className="mt-6 flex flex-col md:flex-row gap-2.5">
                  <button type="submit" className="bg-pink-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-pink-700 transition w-full md:w-auto">{clientForm.id ? 'Guardar Cambios' : 'Registrar Cliente'}</button>
                  {clientForm.id && (
                     <button type="button" onClick={() => setClientForm({ id: null, nombre: '', telefono: '', email: '', municipio: '' })} className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition w-full md:w-auto font-bold">Cancelar</button>
                  )}
               </div>
            </form>
         </section>

         <section className="bg-white p-5 md:p-8 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
               <h2 className="text-2xl font-bold text-gray-800">Clientes Registrados</h2>
               <div className="relative">
                  <input 
                     type="text" 
                     placeholder="Buscar por nombre..." 
                     value={clientSearchTerm}
                     onChange={(e) => setClientSearchTerm(e.target.value)}
                     className="w-full md:w-64 p-2.5 pl-10 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
                  />
                  <span className="absolute left-3 top-3 text-gray-400">🔍</span>
               </div>
            </div>
            <div className="hidden md:block bg-white rounded-2xl overflow-x-auto shadow-sm border border-gray-100 min-h-[400px]">
               <table className="w-full border-collapse min-w-[600px]">
                  <thead>
                     <tr>
                        <th className="p-2.5 md:p-4 text-left border-b border-gray-200 bg-pink-50 text-pink-600 font-semibold text-sm md:text-base">ID</th>
                        <th className="p-2.5 md:p-4 text-left border-b border-gray-200 bg-pink-50 text-pink-600 font-semibold text-sm md:text-base">Nombre</th>
                        <th className="p-2.5 md:p-4 text-left border-b border-gray-200 bg-pink-50 text-pink-600 font-semibold text-sm md:text-base">Teléfono</th>
                        <th className="p-2.5 md:p-4 text-left border-b border-gray-200 bg-pink-50 text-pink-600 font-semibold text-sm md:text-base">Email</th>
                        <th className="p-2.5 md:p-4 text-left border-b border-gray-200 bg-pink-50 text-pink-600 font-semibold text-sm md:text-base">Municipio</th>
                        <th className="p-2.5 md:p-4 text-left border-b border-gray-200 bg-pink-50 text-pink-600 font-semibold text-sm md:text-base">Acciones</th>
                     </tr>
                  </thead>
                  <tbody>
                     {clientesFiltrados.map(cliente => (
                        <tr key={cliente.id} className="hover:bg-pink-100 transition-colors duration-200">
                           <td className="p-2.5 md:p-4 text-left border-b border-gray-100 text-sm md:text-base">{cliente.id}</td>
                           <td className="p-2.5 md:p-4 text-left border-b border-gray-100 text-sm md:text-base">{cliente.nombre}</td>
                           <td className="p-2.5 md:p-4 text-left border-b border-gray-100 text-sm md:text-base">{cliente.telefono}</td>
                           <td className="p-2.5 md:p-4 text-left border-b border-gray-100 text-sm md:text-base">{cliente.email}</td>
                           <td className="p-2.5 md:p-4 text-left border-b border-gray-100 text-sm md:text-base">{cliente.municipio}</td>
                           <td className="p-2.5 md:p-4 text-left border-b border-gray-100">
                              <button onClick={() => handleClientEdit(cliente)} className="bg-blue-500 text-white py-1.5 px-3 rounded-md hover:bg-blue-600 transition mb-1 md:mb-0 md:mr-1 block md:inline-block w-full md:w-auto text-sm">Editar</button>
                              <button onClick={() => handleClientDelete(cliente.id)} className="bg-red-500 text-white py-1.5 px-3 rounded-md hover:bg-red-600 transition block md:inline-block w-full md:w-auto text-sm">Eliminar</button>
                           </td>
                        </tr>
                     ))}
                     {clientesFiltrados.length === 0 && (
                        <tr>
                           <td colSpan="6" className="p-8 text-center text-gray-500">
                              {clientes.length === 0 ? 'No hay clientes registrados' : 'No se encontraron clientes'}
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>

            {/* VISTA MÓVIL (Tarjetas) */}
            <div className="md:hidden grid grid-cols-1 gap-4">
               {clientesFiltrados.map(cliente => (
                  <div key={cliente.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                     <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-gray-800 text-lg">{cliente.nombre}</span>
                        <span className="bg-pink-100 text-pink-600 text-xs font-bold px-2 py-1 rounded-full">ID: {cliente.id}</span>
                     </div>
                     <div className="text-sm text-gray-600 flex flex-col gap-1 mb-4">
                        <p><span className="font-semibold text-gray-700">Teléfono:</span> {cliente.telefono || 'N/A'}</p>
                        <p><span className="font-semibold text-gray-700">Email:</span> {cliente.email || 'N/A'}</p>
                        <p><span className="font-semibold text-gray-700">Municipio:</span> {cliente.municipio || 'N/A'}</p>
                     </div>
                     <div className="flex gap-2 border-t border-gray-100 pt-3">
                        <button type="button" onClick={(e) => { e.preventDefault(); handleClientEdit(cliente); }} className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition text-sm">Editar</button>
                        <button type="button" onClick={(e) => { e.preventDefault(); handleClientDelete(cliente.id); }} className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition text-sm">Eliminar</button>
                     </div>
                  </div>
               ))}
               {clientesFiltrados.length === 0 && (
                  <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
                     {clientes.length === 0 ? 'No hay clientes registrados' : 'No se encontraron clientes'}
                  </div>
               )}
            </div>
         </section>

      </div>
   );
};

export default NewClient;
