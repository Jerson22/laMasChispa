import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";

export default function Accesorios() {
   const [accesorios, setAccesorios] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const [searchTerm, setSearchTerm] = useState('');
   const [selectedColor, setSelectedColor] = useState('');
   const [selectedTalla, setSelectedTalla] = useState('');

   useEffect(() => {
      const fetchAccesorios = async () => {
         try {
            const response = await fetch('/api/accesorios');
            if (!response.ok) {
               throw new Error('Error al cargar los accesorios');
            }
            const data = await response.json();
            setAccesorios(data);
         } catch (err) {
            setError(err.message);
         } finally {
            setLoading(false);
         }
      };

      fetchAccesorios();
   }, []);

   const uniqueColors = [...new Set(accesorios.map(a => a.color).filter(Boolean))];
   const uniqueTallas = [...new Set(accesorios.map(a => a.talla).filter(Boolean))];

   const accesoriosFiltrados = accesorios.filter((accesorio) => {
      const matchesSearch = 
         accesorio.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         (accesorio.descripcion && accesorio.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesColor = selectedColor === '' || accesorio.color === selectedColor;
      const matchesTalla = selectedTalla === '' || accesorio.talla === selectedTalla;

      return matchesSearch && matchesColor && matchesTalla;
   });

   if (loading) return <div className="loading">Cargando accesorios...</div>;
   if (error) return <div className="error">Error: {error}</div>;

   return (
      <div className="vestidos-container ">
         <div className="text-center">
            <h1 className="font-bodoni text-4xl sm:text-5xl md:text-6xl text-[#2c2c2c] tracking-[0.2em] font-normal mb-8 uppercase">Accesorios</h1>
         </div>

         <div className="filtros-container max-[1023px]:flex-nowrap! max-[1023px]:gap-2! max-[1023px]:px-2.5!">
            <input 
               type="text" 
               className="filtro-input max-[1023px]:min-w-0! max-[1023px]:px-2.5! max-[1023px]:text-xs!"
               placeholder="Buscar por nombre o descripción..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select className="filtro-select max-[1023px]:min-w-0! max-[1023px]:w-[28%]! max-[1023px]:px-1.5! max-[1023px]:text-xs!" value={selectedTalla} onChange={(e) => setSelectedTalla(e.target.value)}>
               <option value="">Todas las Tallas</option>
               {uniqueTallas.map(talla => (
                  <option key={talla} value={talla}>{talla}</option>
               ))}
            </select>

            <select className="filtro-select max-[1023px]:min-w-0! max-[1023px]:w-[28%]! max-[1023px]:px-1.5! max-[1023px]:text-xs!" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
               <option value="">Todos los Colores</option>
               {uniqueColors.map(color => (
                  <option key={color} value={color}>{color}</option>
               ))}
            </select>
         </div>

         <div className="vestidos-grid">
            {accesoriosFiltrados.length > 0 ? (
               accesoriosFiltrados.map((accesorio) => (
                  <ProductCard key={accesorio.id} product={accesorio} />
               ))
            ) : (
               <p className="no-data">No se encontraron accesorios con esos filtros.</p>
            )}
         </div>
      </div>
   );
}