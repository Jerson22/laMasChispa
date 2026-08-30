import { Outlet, Link, useLocation } from "react-router-dom";
import { FaTiktok, FaInstagram, FaFacebookF, FaWhatsapp } from 'react-icons/fa'
import { IoPersonCircle } from "react-icons/io5";
import { useState, useEffect } from "react";
import { NavLink } from 'react-router-dom';

export default function Layout() {
   const location = useLocation();
   const [open, setOpen] = useState(false);
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [isAdmin, setIsAdmin] = useState(false);

   useEffect(() => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      setIsLoggedIn(!!token);
      try {
         const parsed = user ? JSON.parse(user) : null;
         setIsAdmin(parsed?.rol === 'admin' || parsed?.rol === 'chispa1');
      } catch {
         setIsAdmin(false);
      }
   }, [location]);


   return (
      <>
         <nav className="navbar">
            <div className="nav-left">
               <NavLink to="/">
                  <img src="/images/logo.png" alt="" width="200" height="auto" />
               </NavLink>
               <NavLink to="https://www.instagram.com/lamaschispa/profilecard/?igsh=emdmdXV3bm9vcW0=" target="_blank" className="social-icon"><FaInstagram /></NavLink>
               <NavLink to="https://www.facebook.com/share/15crZa7MWF/?mibextid=wwXIfr" target="_blank" className="social-icon"><FaFacebookF /></NavLink>
               <NavLink to="https://www.tiktok.com/@lamaschispa?_t=8sNw0oVLf1R&_r=1" target="_blank" className="social-icon"><FaTiktok /></NavLink>
               <NavLink to="https://wa.me/528120281520" target="_blank" className="social-icon"><FaWhatsapp /></NavLink>
            </div>
            {/* Boton toggle */}
            <button className="hamburger" onClick={() => setOpen(!open)}>
               ☰
            </button>
            <div className={`nav-right ${open ? "open" : ""} items-center gap-5`}>
               <Link to="/vestidos" onClick={() => setOpen(false)}>Vestidos</Link>
               <Link to="/talla" onClick={() => setOpen(false)}>¿Cuál es mi talla?</Link>
               <Link to="/preguntas" onClick={() => setOpen(false)}>Preguntas</Link>
               <Link to="/contacto" onClick={() => setOpen(false)}>Contacto</Link>
               <Link to="/" onClick={() => setOpen(false)}>Nosotras</Link>
               {isAdmin ? (
                  <>
                     {/* <Link to="/rentas" onClick={() => setOpen(false)}>Rentas</Link> */}
                     <Link to="/admin" onClick={() => setOpen(false)} style={{ color: '#e83d9c', fontSize: '2.5rem' }}><IoPersonCircle /></Link>
                  </>
               ) : (
                  <Link to="/login" onClick={() => setOpen(false)} style={{ color: '#e83d9c', fontSize: '2.5rem' }}><IoPersonCircle /></Link>
               )}
            </div>
         </nav >
         <div>
            <Outlet />
         </div>
      </>
   )
}