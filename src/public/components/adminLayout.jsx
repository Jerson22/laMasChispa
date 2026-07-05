import { Outlet, useNavigate, NavLink } from "react-router-dom";
import React, { useEffect } from 'react';
// Importamos los iconos para la versión móvil
import { FaPlus, FaClipboardList, FaUserPlus, FaBoxes, FaSignOutAlt } from 'react-icons/fa';

export default function AdminLayout() {
   const navigate = useNavigate();
   const token = localStorage.getItem('token');

   const clearSession = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
   };

   const validateToken = async () => {
      try {
         const response = await fetch('/auth/validate', {
            headers: { 'auth-token': token }
         });

         if (response.status === 401 || response.status === 403) {
            clearSession();
            return false;
         }

         return response.ok;
      } catch (err) {
         console.error('Error validating token:', err);
         return false;
      }
   };

   useEffect(() => {
      const storedUser = localStorage.getItem('user');
      let parsedUser = null;
      try {
         parsedUser = storedUser ? JSON.parse(storedUser) : null;
      } catch {
         parsedUser = null;
      }

      if (!token || !parsedUser || parsedUser.rol !== 'admin') {
         clearSession();
         return;
      }

      validateToken();
   }, [token, navigate]);

   // 🖥️ ESTILOS: Barra Lateral (Escritorio)
   const desktopLinkStyles = ({ isActive }) => 
      `block py-2.5 px-3 rounded-lg font-medium text-[0.95rem] transition-all duration-200 ease-in-out ${
         isActive 
            ? "bg-pink-100 text-pink-600 font-bold pl-4" 
            : "text-gray-600 hover:bg-pink-100 hover:text-pink-600 hover:pl-4"
      }`;

   // 📱 ESTILOS: Barra Inferior (Móvil)
   const mobileLinkStyles = ({ isActive }) =>
      `flex flex-col items-center justify-center min-w-[80px] flex-1 h-full snap-center text-[0.7rem] font-semibold transition-colors ease-in-out ${
         isActive 
            ? "text-pink-600 bg-pink-50/60" 
            : "text-gray-500 hover:text-pink-600"
      }`;

   return (
      <div className="group flex min-h-screen flex-col lg:flex-row">
         
         {/* ==========================================
             1. BARRA ESCRITORIO (hidden lg:flex)
             Solo se muestra en pantallas grandes (computadoras)
            ========================================== */}
         <aside className="hidden lg:flex w-[180px] bg-[#fff4fb] text-gray-800 py-6 px-4 sticky top-[90px] h-[calc(100vh-90px)] border-r border-purple-100 flex-col gap-5 box-border">
            <h2 className="text-[1.2rem] m-0 pl-3 text-pink-600 font-bold">
               Panel Admin
            </h2>
            <nav className="flex flex-col gap-2 flex-1 box-border">
               <NavLink to="/admin" end className={desktopLinkStyles}>Nueva Renta</NavLink>
               <NavLink to="/admin/rentas" className={desktopLinkStyles}>Rentas</NavLink>
               <NavLink to="/admin/nuevo-cliente" className={desktopLinkStyles}>Nuevo Cliente</NavLink>
               <NavLink to="/admin/inventario" className={desktopLinkStyles}>Inventario</NavLink>

               <button 
                  onClick={clearSession} 
                  className="bg-gray-600 text-white py-2.5 px-[15px] rounded-lg cursor-pointer mt-auto font-medium transition-colors duration-200 ease-in-out hover:bg-pink-600"
               >
                  Cerrar Sesión
               </button>
            </nav>
         </aside>

         {/* ==========================================
             2. BARRA MÓVIL (lg:hidden)
             Solo se muestra en celulares y tablets.
             Soporta scroll horizontal e inmune al teclado.
            ========================================== */}
         <nav className="
            fixed bottom-0 left-0 right-0 h-16 bg-[#fff4fb] border-t border-purple-100 z-50 
            flex flex-nowrap overflow-x-auto snap-x scrollbar-none lg:hidden
            group-has-[input:focus]:hidden group-has-[textarea:focus]:hidden
         ">
            <NavLink to="/admin" end className={mobileLinkStyles}>
               <FaPlus className="text-lg mb-0.5" />
               <span>Nueva Renta</span>
            </NavLink>
            
            <NavLink to="/admin/rentas" className={mobileLinkStyles}>
               <FaClipboardList className="text-lg mb-0.5" />
               <span>Rentas</span>
            </NavLink>
            
            <NavLink to="/admin/nuevo-cliente" className={mobileLinkStyles}>
               <FaUserPlus className="text-lg mb-0.5" />
               <span>Cliente</span>
            </NavLink>
            
            <NavLink to="/admin/inventario" className={mobileLinkStyles}>
               <FaBoxes className="text-lg mb-0.5" />
               <span>Inventario</span>
            </NavLink>

            {/* Puedes seguir agregando más NavLinks aquí y se podrán ver arrastrando el dedo */}

            <button 
               onClick={clearSession} 
               className="flex flex-col items-center justify-center min-w-[80px] flex-1 h-full snap-center text-[0.7rem] font-semibold text-gray-500 hover:text-red-500"
            >
               <FaSignOutAlt className="text-lg mb-0.5" />
               <span>Salir</span>
            </button>
         </nav>

         {/* ==========================================
             3. CONTENEDOR DINÁMICO DEL ADMIN
             Agregamos pb-20 en móvil para que la barra inferior no tape los formularios
            ========================================== */}
         <main className="flex-1 p-5 pb-20 lg:pb-5">
            <Outlet context={{ token }} /> 
         </main>
      </div>
   );
}