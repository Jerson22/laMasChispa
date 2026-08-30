import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { AiOutlineClear } from "react-icons/ai";

const Vestidos = () => {
   const [vestidos, setVestidos] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const [searchTerm, setSearchTerm] = useState('');
   const [selectedColor, setSelectedColor] = useState('');
   const [selectedTalla, setSelectedTalla] = useState('');
   const [selectedSilueta, setSelectedSilueta] = useState('');
   const [selectedMangas, setSelectedMangas] = useState('');

   useEffect(() => {
      const fetchVestidos = async () => {
         try {
            const response = await fetch('/api/vestidos');
            if (!response.ok) {
               throw new Error('Error al cargar los vestidos');
            }
            const data = await response.json();
            setVestidos(data);
         } catch (err) {
            setError(err.message);
         } finally {
            setLoading(false);
         }
      };

      fetchVestidos();
   }, []);

   const uniqueColors = [...new Set(vestidos.map(v => v.color).filter(Boolean))].sort((a, b) => a.localeCompare(b));
   const uniqueTallas = [...new Set(vestidos.map(v => v.talla).filter(Boolean))].sort((a, b) => parseInt(a) - parseInt(b));
   const uniqueSiluetas = [...new Set(vestidos.map(v => v.silueta).filter(Boolean))];
   const uniqueMangas = [...new Set(vestidos.map(v => v.mangas).filter(Boolean))];

   const vestidosFiltrados = vestidos.filter((vestido) => {
      const matchesSearch =
         vestido.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (vestido.descripcion && vestido.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesColor = selectedColor === '' || vestido.color === selectedColor;
      const matchesTalla = selectedTalla === '' || vestido.talla === selectedTalla;
      const matchesSilueta = selectedSilueta === '' || vestido.silueta === selectedSilueta;
      const matchesMangas = selectedMangas === '' || vestido.mangas === selectedMangas;

      return matchesSearch && matchesColor && matchesTalla && matchesSilueta && matchesMangas;
   });

   if (loading) return <div className="flex justify-center items-center h-64 text-xl text-gray-600">Cargando vestidos...</div>;
   if (error) return <div className="text-center text-red-500 p-4">Error: {error}</div>;

   const mayus = (texto) => {
      if (!texto) return '';
      return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
   };
   
   const clearFilters = ()=>{
      setSelectedColor('');
      setSelectedTalla('');
      setSelectedSilueta('');
      setSelectedMangas('');
      setSearchTerm('');
   };

   return (
      <div className="container mx-auto px-1 py-8 max-w-7xl">
         {/* Banner Promocional "En La Más Chispa..." */}
         <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden bg-[#9c2868] mb-10 shadow-xl min-h-[300px] flex items-center">
            

            <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between p-6 sm:p-10 md:p-12 pl-14 sm:pl-24 md:pl-32 gap-8">
               {/* Texto Izquierdo */}
               <div className="flex-1 max-w-2xl text-left">
                  <h2 className="font-bodoni text-2xl sm:text-3xl md:text-4xl text-white italic leading-tight mb-4">
                     En La Más Chispa creemos que todas las mujeres merecen sentirse increíbles.
                  </h2>
                  <p className="font-poppins text-xs sm:text-sm md:text-base text-white/90 leading-relaxed mb-6 max-w-xl">
                     Sin importar la talla, el cuerpo o las reglas que alguien más haya inventado. Aquí celebramos la autenticidad, la confianza y la libertad de usar lo que te haga sentir tú.
                  </p>
                  
                  {/* Badge Amarillo/Dorado */}
                  <div className="bg-[#fcad26] text-white font-poppins font-bold text-xs sm:text-sm md:text-base px-6 py-2.5 rounded-full inline-flex flex-wrap items-center gap-2 sm:gap-4 shadow-md">
                     <span>Tu Renta incluye:</span>
                     <span>Tintorería</span>
                     <span>Ajustes</span>
                     <span>Accesorios: Bolsa y Aretes</span>
                  </div>
               </div>

               {/* Imagen de Modelos (amigas final.png que ya contiene el círculo rosa) */}
               <div className="lg:justify-end w-full max-w-[420px] lg:max-w-[500px] float-right">
                  <img 
                     src="/images/amigas final.png" 
                     alt="Amigas La Más Chispa" 
                     className="w-full h-auto object-contain"
                  />
               </div>
            </div>
         </div>

         <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <input
               type="text"
               className="w-full lg:flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
               placeholder="Buscar por nombre o descripción..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="grid grid-cols-4 gap-2 w-full lg:flex-[2]">
               <select className="w-full px-1 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white" value={selectedTalla} onChange={(e) => setSelectedTalla(e.target.value)}>
                  <option value="">Tallas</option>
                  {uniqueTallas.map(talla => (
                     <option key={talla} value={talla}>{talla.toUpperCase()}</option>
                  ))}
               </select>

               <select className="w-full px-1 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
                  <option value="">Colores</option>
                  {uniqueColors.map(color => (
                     <option key={color} value={color}>{mayus(color)}</option>
                  ))}
               </select>

               <select className="w-full px-1 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white" value={selectedSilueta} onChange={(e) => setSelectedSilueta(e.target.value)}>
                  <option value="">Siluetas</option>
                  {uniqueSiluetas.map(silueta => (
                     <option key={silueta} value={silueta}>Corte {mayus(silueta)}</option>
                  ))}
               </select>

               <select className="w-full px-1 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white" value={selectedMangas} onChange={(e) => setSelectedMangas(e.target.value)}>
                  <option value="">Mangas</option>
                  {uniqueMangas.map(mangas => (
                     <option key={mangas} value={mangas}>{mayus(mangas)}</option>
                  ))}
               </select>
            </div>

            <button className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 hover:bg-pink-200 rounded-md transition-colors font-medium" onClick={clearFilters}>
               <AiOutlineClear />
               <span>Limpiar</span>
            </button>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2 md:gap-6">
            {vestidosFiltrados.length > 0 ? (
               vestidosFiltrados.map((vestido) => (
                  <ProductCard key={vestido.id} product={vestido} />
               ))
            ) : (
               <p className="col-span-full text-center text-gray-500 py-8">No se encontraron vestidos con esos filtros.</p>
            )}
         </div>
      </div>
   );
};

export default Vestidos;
