// 1. Importaciones de librerías externas (Node y npm)
import { CrearReciboPDF } from './services/pdfService.js';
import path from 'path';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url'; // <-- Necesario para recuperar __dirname

// 2. Importaciones de tus archivos locales
// ⚠️ NOTA CRÍTICA: En modo "import", es OBLIGATORIO poner el ".js" al final de la ruta.
import db from './db/connection.js';
import authRoutes from './routes/auth.js';
import { verificarToken, esAdmin } from './middlewares/auth.js';

// 3. Recreamos __dirname (Ya que en ES Modules no existe por defecto)
// Esto evita que Multer falle al buscar la carpeta 'public'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 4. Inicialización de Express y variables
const app = express();
const port = 3000;

// 5. Configuración de Multer (Se queda exactamente igual gracias al paso 3)
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      const dir = path.join(__dirname, 'public', 'images');
      if (!fs.existsSync(dir)) {
         fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
   },
   filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
   }
});
const upload = multer({ storage: storage });


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public', 'dist')));

// Inicialización de pagos_renta y migración histórica
async function inicializarBaseDatos() {
   try {
      await db.query(`
         CREATE TABLE IF NOT EXISTS public.pagos_renta (
            id SERIAL PRIMARY KEY,
            venta_id integer NOT NULL REFERENCES public.ventas(id) ON DELETE CASCADE,
            categoria character varying(50) NOT NULL,
            metodo character varying(50) NOT NULL,
            monto numeric(10,2) NOT NULL,
            fecha_pago date NOT NULL DEFAULT CURRENT_DATE,
            created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
         );
      `);
      console.log('✅ Tabla pagos_renta verificada/creada');

      const checkRes = await db.query('SELECT COUNT(*) FROM public.pagos_renta');
      const count = parseInt(checkRes.rows[0].count, 10);

      if (count === 0) {
         console.log('🔄 Ejecutando migración inicial de pagos históricos...');
         const ventas = await db.query('SELECT id, "fechaRenta", "fechaEntrega", "fechaDevolucion", "anticipoEfectivo", "anticipoTarjeta", "pendienteEfectivo", "pendienteTarjeta", "extraEfectivo", "extraTarjeta" FROM public.ventas');
         
         const formatearFecha = (fRaw) => {
            if (!fRaw) return new Date().toISOString().split('T')[0];
            if (fRaw instanceof Date) return fRaw.toISOString().split('T')[0];
            return String(fRaw).split('T')[0];
         };

         for (const v of ventas.rows) {
            const fRenta = formatearFecha(v.fechaRenta);
            const fEntrega = formatearFecha(v.fechaEntrega);
            const fDevolucion = formatearFecha(v.fechaDevolucion);

            if (parseFloat(v.anticipoEfectivo || 0) > 0) {
               await db.query('INSERT INTO public.pagos_renta (venta_id, categoria, metodo, monto, fecha_pago) VALUES ($1, $2, $3, $4, $5)', [v.id, 'anticipo', 'efectivo', v.anticipoEfectivo, fRenta]);
            }
            if (parseFloat(v.anticipoTarjeta || 0) > 0) {
               await db.query('INSERT INTO public.pagos_renta (venta_id, categoria, metodo, monto, fecha_pago) VALUES ($1, $2, $3, $4, $5)', [v.id, 'anticipo', 'tarjeta', v.anticipoTarjeta, fRenta]);
            }
            if (parseFloat(v.pendienteEfectivo || 0) > 0) {
               await db.query('INSERT INTO public.pagos_renta (venta_id, categoria, metodo, monto, fecha_pago) VALUES ($1, $2, $3, $4, $5)', [v.id, 'pendiente', 'efectivo', v.pendienteEfectivo, fEntrega]);
            }
            if (parseFloat(v.pendienteTarjeta || 0) > 0) {
               await db.query('INSERT INTO public.pagos_renta (venta_id, categoria, metodo, monto, fecha_pago) VALUES ($1, $2, $3, $4, $5)', [v.id, 'pendiente', 'tarjeta', v.pendienteTarjeta, fEntrega]);
            }
            if (parseFloat(v.extraEfectivo || 0) > 0) {
               await db.query('INSERT INTO public.pagos_renta (venta_id, categoria, metodo, monto, fecha_pago) VALUES ($1, $2, $3, $4, $5)', [v.id, 'extra', 'efectivo', v.extraEfectivo, fDevolucion]);
            }
            if (parseFloat(v.extraTarjeta || 0) > 0) {
               await db.query('INSERT INTO public.pagos_renta (venta_id, categoria, metodo, monto, fecha_pago) VALUES ($1, $2, $3, $4, $5)', [v.id, 'extra', 'tarjeta', v.extraTarjeta, fDevolucion]);
            }
         }
         console.log('✅ Migración inicial completada con éxito');
      }
   } catch (error) {
      console.error('❌ Error al inicializar base de datos / pagos_renta:', error);
   }
}
inicializarBaseDatos();

//Para Login y registrar usuarios nuevos
app.use('/auth', authRoutes);

// Endpoint para subir imágenes rápidamente
app.post('/api/upload', verificarToken, esAdmin, upload.array('images', 10), (req, res) => {
   try {
      const filenames = req.files.map(f => f.filename);
      res.json({ filenames });
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al subir las imágenes' });
   }
});

// 1. CREAR un producto
app.post('/api/productos', verificarToken, esAdmin, async (req, res) => {
   const { name, precio_vestido, precio_venta, precio_renta, color, talla, silueta, mangas, descripcion, vestido, imagenes } = req.body;
   try {
      await db.query('BEGIN');
      const query = 'INSERT INTO productos (name, precio_vestido, precio_venta, precio_renta, color, talla, silueta, mangas, descripcion, vestido) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *';
      const values = [name, precio_vestido, precio_venta, precio_renta, color, talla, silueta, mangas, descripcion, vestido ? '1' : '0'];
      // console.log("Values:", values);
      const result = await db.query(query, values);
      const producto_id = result.rows[0].id;

      let imagesInserted = [];
      if (imagenes && imagenes.length > 0) {
         for (let i = 0; i < imagenes.length; i++) {
            if (!imagenes[i]) continue;
            const imgQuery = 'INSERT INTO imagen_productos (id_imagen, name, orden) VALUES ($1, $2, $3) RETURNING name';
            const imgResult = await db.query(imgQuery, [producto_id, imagenes[i], i + 1]);
            imagesInserted.push(imgResult.rows[0].name);
         }
      }
      await db.query('COMMIT');
      res.status(201).json({ mensaje: "Producto creado", producto: { ...result.rows[0], imagenes: imagesInserted } });
   } catch (error) {
      await db.query('ROLLBACK');
      console.error(error);
      res.status(500).json({ error: 'Error al crear el producto' });
   }
});

// 2. ACTUALIZAR un producto
app.put('/api/productos/:id', verificarToken, esAdmin, async (req, res) => {
   const { id } = req.params;
   const { name, precio_vestido, precio_venta, precio_renta, color, talla, silueta, mangas, descripcion, vestido, imagenes } = req.body;
   try {
      await db.query('BEGIN');
      const query = 'UPDATE productos SET name=$1, precio_vestido=$2, precio_venta=$3, precio_renta=$4, color=$5, talla=$6, silueta=$7, mangas=$8, descripcion=$9, vestido=$10 WHERE id=$11 RETURNING *';
      const values = [name, precio_vestido, precio_venta, precio_renta, color, talla, silueta, mangas, descripcion, vestido ? '1' : '0', id];
      // console.log("Values:", values);
      const result = await db.query(query, values);

      if (result.rows.length === 0) {
         await db.query('ROLLBACK');
         return res.status(404).json({ error: "Producto no encontrado" });
      }

      await db.query('DELETE FROM imagen_productos WHERE id_imagen = $1', [id]);
      let imagesInserted = [];
      if (imagenes && imagenes.length > 0) {
         for (let i = 0; i < imagenes.length; i++) {
            if (!imagenes[i]) continue;
            const imgQuery = 'INSERT INTO imagen_productos (id_imagen, name, orden) VALUES ($1, $2, $3) RETURNING name';
            const imgResult = await db.query(imgQuery, [id, imagenes[i], i + 1]);
            imagesInserted.push(imgResult.rows[0].name);
         }
      }
      await db.query('COMMIT');
      res.json({ mensaje: "Producto actualizado", producto: { ...result.rows[0], imagenes: imagesInserted } });
   } catch (error) {
      await db.query('ROLLBACK');
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar' });
   }
});

// 3. BORRAR un producto
app.delete('/api/productos/:id', verificarToken, esAdmin, async (req, res) => {
   const { id } = req.params;
   try {
      await db.query('BEGIN');
      await db.query('DELETE FROM imagen_productos WHERE id_imagen = $1', [id]);
      await db.query('DELETE FROM productos WHERE id = $1', [id]);
      await db.query('COMMIT');
      res.json({ mensaje: "Producto eliminado correctamente" });
   } catch (error) {
      await db.query('ROLLBACK');
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar' });
   }
});

// Endpoint para obtener TODOS los productos (para Admin)
app.get('/api/productos', async (req, res) => {
   try {
      const query = `
         SELECT p.*, 
               COALESCE(
                  (SELECT json_agg(ia.name ORDER BY ia.orden) 
                  FROM imagen_productos ia 
                  WHERE ia.id_imagen = p.id), 
                  '[]'
               ) as imagenes
         FROM productos p 
         ORDER BY p.id ASC
      `;
      const result = await db.query(query);
      res.json(result.rows);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los productos' });
   }
});

// Endpoint para obtener un producto por ID
app.get('/api/productos/:id', async (req, res) => {
   const { id } = req.params;
   try {
      const query = `
         SELECT p.*, 
               COALESCE(
                  (SELECT json_agg(ia.name ORDER BY ia.orden) 
                  FROM imagen_productos ia 
                  WHERE ia.id_imagen = p.id), 
                  '[]'
               ) as imagenes
         FROM productos p 
         WHERE p.id = $1
      `;
      const result = await db.query(query, [id]);

      if (result.rows.length === 0) {
         return res.status(404).json({ error: "Producto no encontrado" });
      }

      res.json(result.rows[0]);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener el producto' });
   }
});

// Endpoint para obtener una renta por ID
app.get('/api/renta/:id', verificarToken, esAdmin, async (req, res) => {
   const { id } = req.params;
   console.log('El id recivido es: ', id);
   try {
      const result = await db.query('SELECT * FROM ventas WHERE id = $1', [id]);

      if (result.rows.length === 0) {
         return res.status(404).json({ error: "Renta no encontrada" });
      }
      // console.log('Resultados enviados');
      // console.log(result.rows[0]);
      res.json(result.rows[0]);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener la renta' });
   }
});

app.get('/api/clientes', verificarToken, esAdmin, async (req, res) => {
   try {
      const result = await db.query('SELECT * FROM clientes ORDER BY id ASC');
      res.json(result.rows);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los clientes' });
   }
});

app.post('/api/clientes', verificarToken, esAdmin, async (req, res) => {
   const { nombre, telefono, email, municipio } = req.body;
   try {
      const result = await db.query(
         'INSERT INTO clientes (nombre, telefono, email, municipio) VALUES ($1, $2, $3, $4) RETURNING *',
         [nombre, telefono, email, municipio]
      );
      res.status(201).json(result.rows[0]);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear el cliente' });
   }
});

app.put('/api/clientes/:id', verificarToken, esAdmin, async (req, res) => {
   const { id } = req.params;
   const { nombre, telefono, email, municipio } = req.body;
   try {
      const result = await db.query(
         'UPDATE clientes SET nombre = $1, telefono = $2, email = $3, municipio = $4 WHERE id = $5 RETURNING *',
         [nombre, telefono, email, municipio, id]
      );
      if (result.rows.length === 0) {
         return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      res.json(result.rows[0]);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar el cliente' });
   }
});

app.delete('/api/clientes/:id', verificarToken, esAdmin, async (req, res) => {
   const { id } = req.params;
   try {
      const result = await db.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
         return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      res.json({ message: 'Cliente eliminado correctamente' });
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar el cliente. Es posible que tenga ventas o reservas asociadas.' });
   }
});

// Endpoint para validar disponibilidad de un vestido
app.post('/api/validar-disponibilidad', verificarToken, esAdmin, async (req, res) => {
   const { productId, fechaEntrega, fechaDevolucion, excludeId } = req.body;

   if (!productId || !fechaEntrega || !fechaDevolucion) {
      return res.status(400).json({ error: 'Faltan datos para validar.' });
   }

   try {
      // Un rango (A, B) choca con (C, D) si A <= D y B >= C
      let query = `
         SELECT id, "fechaEntrega", "fechaDevolucion", "name"
         FROM ventas
         WHERE "productId" = $1
           AND "fechaEntrega" <= $2
           AND "fechaDevolucion" >= $3
      `;
      const params = [productId, fechaDevolucion, fechaEntrega];

      if (excludeId) {
         query += ` AND id != $4`;
         params.push(excludeId);
      }

      const result = await db.query(query, params);

      if (result.rows.length > 0) {
         return res.json({ disponible: false, conflicto: result.rows[0] });
      }

      res.json({ disponible: true });
   } catch (error) {
      console.error('Error al validar disponibilidad:', error);
      res.status(500).json({ error: 'Error al validar la disponibilidad del vestido.' });
   }
});

// insertar ventas
app.post('/api/ventas', verificarToken, esAdmin, async (req, res) => {
   console.log("Datos recibidos para venta:", req.body);
   const { name, productId, bolso, aretes, ajuste, fechaAjustes, fechaRenta, fechaEntrega, fechaDevolucion, anticipoEfectivo, anticipoTarjeta, pendienteEfectivo, pendienteTarjeta, extraEfectivo, extraTarjeta, liquidado, notas, telefono, bastilla, busto, tirantes, mangaPuno, cintura, espalda } = req.body;
   if (!name || !fechaRenta || !fechaEntrega || !fechaDevolucion || anticipoEfectivo === undefined && anticipoTarjeta === undefined) {
      return res.status(400).json({ error: 'Datos incompletos para crear la venta' });
   }
   try {
      const isTrue = (val) => val === true || val === 1 || val === '1';
      const estado = isTrue(ajuste) ? 'cita de ajustes' : 'planchado';
      const ventasResult = await db.query(
         'INSERT INTO ventas ( "name", "productId", "bolso", "aretes", "ajuste", "fechaAjuste", "estado", "fechaRenta", "fechaEntrega", "fechaDevolucion", "anticipoEfectivo", "anticipoTarjeta", "pendienteEfectivo", "pendienteTarjeta", "extraEfectivo", "extraTarjeta", "liquidado", "notas", "telefono", "bastilla", "busto", "tirantes", "mangaPuno", "cintura", "espalda") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25) RETURNING *',
         [name, productId || null, isTrue(bolso) ? '1' : '0', isTrue(aretes) ? '1' : '0', isTrue(ajuste) ? '1' : '0', fechaAjustes || null, estado, fechaRenta || null, fechaEntrega || null, fechaDevolucion || null, anticipoEfectivo, anticipoTarjeta, pendienteEfectivo, pendienteTarjeta, extraEfectivo, extraTarjeta, isTrue(liquidado) ? '1' : '0', notas, telefono, bastilla, busto, tirantes, mangaPuno, cintura, espalda]
      );
      const reservaId = ventasResult.rows[0].id;

      // Insertar anticipos en pagos_renta si son mayores a 0
      const fRenta = fechaRenta ? String(fechaRenta).split('T')[0] : new Date().toISOString().split('T')[0];
      if (parseFloat(anticipoEfectivo || 0) > 0) {
         await db.query('INSERT INTO pagos_renta (venta_id, categoria, metodo, monto, fecha_pago) VALUES ($1, $2, $3, $4, $5)', [reservaId, 'anticipo', 'efectivo', parseFloat(anticipoEfectivo), fRenta]);
      }
      if (parseFloat(anticipoTarjeta || 0) > 0) {
         await db.query('INSERT INTO public.pagos_renta (venta_id, categoria, metodo, monto, fecha_pago) VALUES ($1, $2, $3, $4, $5)', [reservaId, 'anticipo', 'tarjeta', parseFloat(anticipoTarjeta), fRenta]);
      }

      // Insertar cargos extra en pagos_renta si son mayores a 0
      if (parseFloat(extraEfectivo || 0) > 0) {
         await db.query('INSERT INTO pagos_renta (venta_id, categoria, metodo, monto, fecha_pago) VALUES ($1, $2, $3, $4, $5)', [reservaId, 'extra', 'efectivo', parseFloat(extraEfectivo), fRenta]);
      }
      if (parseFloat(extraTarjeta || 0) > 0) {
         await db.query('INSERT INTO pagos_renta (venta_id, categoria, metodo, monto, fecha_pago) VALUES ($1, $2, $3, $4, $5)', [reservaId, 'extra', 'tarjeta', parseFloat(extraTarjeta), fRenta]);
      }

      res.status(201).json({ mensaje: 'Venta creada', reservaId });
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear la venta' });
   }
});

// Endpoint para actualizar formulario de ventas
app.put('/api/ventas/:id', verificarToken, esAdmin, async (req, res) => {
   const { id } = req.params; // Obtenemos el ID de la URL
   const { name, productId, bolso, aretes, ajuste, fechaAjuste, fechaRenta, fechaEntrega, fechaDevolucion, anticipoEfectivo, anticipoTarjeta, pendienteEfectivo, pendienteTarjeta, extraEfectivo, extraTarjeta, liquidado, notas, telefono, bastilla, busto, tirantes, mangaPuno, cintura, espalda } = req.body;
   console.log('Parametros recividos', req.body);
   try {
      const isTrue = (val) => val === true || val === 1 || val === '1';
      const result = await db.query(
         `UPDATE ventas SET 
            "name" = $1, 
            "productId" = $2, 
            "bolso" = $3, 
            "aretes" = $4, 
            "ajuste" = $5, 
            "fechaAjuste" = $6, 
            "fechaRenta" = $7, 
            "fechaEntrega" = $8, 
            "fechaDevolucion" = $9, 
            "anticipoEfectivo" = $10, 
            "anticipoTarjeta" = $11, 
            "pendienteEfectivo" = $12, 
            "pendienteTarjeta" = $13, 
            "extraEfectivo" = $14,
            "extraTarjeta" = $15,
            "liquidado" = $16, 
            "notas" = $17, 
            "telefono" = $18,
            "bastilla" = $19,
            "busto" = $20,
            "tirantes" = $21,
            "mangaPuno" = $22,
            "cintura" = $23,
            "espalda" = $24
          WHERE id = $25 RETURNING *`,
         [
            name,
            productId || null,
            isTrue(bolso) ? '1' : '0',
            isTrue(aretes) ? '1' : '0',
            isTrue(ajuste) ? '1' : '0',
            fechaAjuste || null,
            fechaRenta || null,
            fechaEntrega || null,
            fechaDevolucion || null,
            anticipoEfectivo,
            anticipoTarjeta,
            pendienteEfectivo,
            pendienteTarjeta,
            extraEfectivo,
            extraTarjeta,
            isTrue(liquidado) ? '1' : '0',
            notas,
            telefono,
            bastilla,
            busto,
            tirantes,
            mangaPuno,
            cintura,
            espalda,
            id // El ID para la cláusula WHERE
         ]
      );

      if (result.rowCount === 0) {
         return res.status(404).json({ error: 'Venta no encontrada' });
      }

      res.status(200).json({ mensaje: 'Venta actualizada correctamente', venta: result.rows[0] });
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar la venta' });
   }
});

// Traer ventas para la tabla rentas
app.get('/api/rentas', verificarToken, esAdmin, async (req, res) => {
   try {
      const result = await db.query('SELECT * FROM ventas ORDER BY "fechaEntrega" ASC');
      res.json(result.rows);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener las rentas' });
   }
});

app.get('/api/rentas2', verificarToken, esAdmin, async (req, res) => {
   try {
      const query = `select 
         v.*, 
         p.name as producto_nombre,
         p.precio_renta,
         ip.name as imagen_nombre
         from ventas v inner join productos p on v."productId" = p.id
         left join imagen_productos ip on p.id=ip.id_imagen where ip.orden = 1
         order by v.id desc`;
      const result = await db.query(query);
      res.json(result.rows);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al conseguir Rentas 2' })
   }
});

// Endpoint para actualizar el estado de una renta
app.put('/api/rentas/:id', verificarToken, esAdmin, async (req, res) => {
   const { id } = req.params;       // Captura el ID desde la URL
   const { estado } = req.body;     // Captura el nuevo estado enviado desde React

   // 1. Validación básica (opcional pero recomendada)
   const estadosValidos = ['cita de ajustes', 'ajustes', 'planchado', 'entregado', 'devuelto', 'devolucion', 'tintoreria', 'en tienda'];
   if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
   }

   try {
      // 2. Consulta SQL usando marcadores ($1, $2) para evitar inyección SQL
      // Nota: Aquí usamos tu tabla real llamada 'ventas'
      const queryText = `
         UPDATE ventas 
         SET estado = $1 
         WHERE id = $2 
         RETURNING *;
      `;
      const values = [estado, id];

      // 3. Ejecutar la consulta en la base de datos
      const result = await db.query(queryText, values);

      // 4. Si la consulta no afectó a ninguna fila, significa que el ID no existe
      if (result.rows.length === 0) {
         return res.status(404).json({ error: 'La venta/renta no existe.' });
      }

      // 5. Responder al frontend con éxito y pasar el registro modificado
      res.json({
         message: 'Estado actualizado con éxito',
         ventaActualizada: result.rows[0]
      });

   } catch (error) {
      console.error('Error al actualizar la base de datos:', error);
      res.status(500).json({ error: 'Error interno del servidor al actualizar el estado' });
   }
});

// Función auxiliar para sincronizar acumulados de pagos en la tabla ventas
async function syncVentaPagos(ventaId) {
   const pagosRes = await db.query('SELECT categoria, metodo, monto FROM pagos_renta WHERE venta_id = $1', [ventaId]);
   
   let anticipoEfectivo = 0;
   let anticipoTarjeta = 0;
   let pendienteEfectivo = 0;
   let pendienteTarjeta = 0;
   let extraEfectivo = 0;
   let extraTarjeta = 0;

   for (const p of pagosRes.rows) {
      const m = parseFloat(p.monto || 0);
      if (p.categoria === 'anticipo') {
         if (p.metodo === 'efectivo') anticipoEfectivo += m;
         else if (p.metodo === 'tarjeta') anticipoTarjeta += m;
      } else if (p.categoria === 'pendiente') {
         if (p.metodo === 'efectivo') pendienteEfectivo += m;
         else if (p.metodo === 'tarjeta') pendienteTarjeta += m;
      } else if (p.categoria === 'extra') {
         if (p.metodo === 'efectivo') extraEfectivo += m;
         else if (p.metodo === 'tarjeta') extraTarjeta += m;
      }
   }

   await db.query(
      `UPDATE public.ventas 
       SET "anticipoEfectivo" = $1, "anticipoTarjeta" = $2, "pendienteEfectivo" = $3, "pendienteTarjeta" = $4, "extraEfectivo" = $5, "extraTarjeta" = $6 
       WHERE id = $7`,
      [anticipoEfectivo, anticipoTarjeta, pendienteEfectivo, pendienteTarjeta, extraEfectivo, extraTarjeta, ventaId]
   );
}

// Función auxiliar para agrupar pagos del mismo día y método, excluyendo la agrupación entre anticipo y pendiente
function agruparPagos(pagos) {
   const grupos = {};
   for (const p of pagos) {
      const fecha = p.fecha_pago instanceof Date 
         ? p.fecha_pago.toISOString().split('T')[0] 
         : String(p.fecha_pago).split('T')[0];
      
      const key = `${p.venta_id || ''}_${fecha}_${p.metodo}`;
      if (!grupos[key]) {
         grupos[key] = [];
      }
      grupos[key].push(p);
   }

   const resultado = [];
   for (const key in grupos) {
      const lista = grupos[key];
      const anticipos = lista.filter(x => x.categoria === 'anticipo');
      const pendientes = lista.filter(x => x.categoria === 'pendiente');
      const extras = lista.filter(x => x.categoria === 'extra');

      if (anticipos.length > 0 && pendientes.length > 0) {
         // Grupo 1: Anticipo + Extras
         const montoA = anticipos.reduce((acc, c) => acc + parseFloat(c.monto || 0), 0) + 
                        extras.reduce((acc, c) => acc + parseFloat(c.monto || 0), 0);
         const idsA = [...anticipos, ...extras].map(x => x.id).join(',');
         const catsA = ['anticipo', ...extras.map(() => 'extra')].filter((v, i, a) => a.indexOf(v) === i).join(', ');
         
         resultado.push({
            ...anticipos[0],
            monto: montoA,
            categoria: catsA,
            ids: idsA
         });

         // Grupo 2: Pendiente
         const montoP = pendientes.reduce((acc, c) => acc + parseFloat(c.monto || 0), 0);
         const idsP = pendientes.map(x => x.id).join(',');
         
         resultado.push({
            ...pendientes[0],
            monto: montoP,
            categoria: 'pendiente',
            ids: idsP
         });
      } else {
         const montoTotal = lista.reduce((acc, c) => acc + parseFloat(c.monto || 0), 0);
         const idsTotal = lista.map(x => x.id).join(',');
         const catsTotal = lista.map(x => x.categoria).filter((v, i, a) => a.indexOf(v) === i).join(', ');

         resultado.push({
            ...lista[0],
            monto: montoTotal,
            categoria: catsTotal,
            ids: idsTotal
         });
      }
   }
   return resultado;
}

// Endpoints para Historial de Pagos
app.get('/api/ventas/:id/pagos', verificarToken, esAdmin, async (req, res) => {
   const { id } = req.params;
   try {
      const result = await db.query('SELECT * FROM pagos_renta WHERE venta_id = $1 ORDER BY fecha_pago ASC, id ASC', [id]);
      const agrupados = agruparPagos(result.rows);
      res.json(agrupados);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los pagos de la renta' });
   }
});

app.post('/api/ventas/:id/pagos', verificarToken, esAdmin, async (req, res) => {
   const { id } = req.params;
   const { categoria, metodo, monto, fecha_pago } = req.body;
   
   if (!categoria || !metodo || isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) {
      return res.status(400).json({ error: 'Datos de pago inválidos o incompletos' });
   }

   try {
      await db.query(
         'INSERT INTO pagos_renta (venta_id, categoria, metodo, monto, fecha_pago) VALUES ($1, $2, $3, $4, $5)',
         [id, categoria, metodo, parseFloat(monto), fecha_pago || new Date().toISOString().split('T')[0]]
      );
      
      await syncVentaPagos(id);
      res.status(201).json({ mensaje: 'Pago registrado y sincronizado con éxito' });
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al registrar el pago' });
   }
});

app.delete('/api/pagos/:ids', verificarToken, esAdmin, async (req, res) => {
   const { ids } = req.params; // ids puede ser "12" o "12,13"
   const idList = ids.split(',').map(Number);
   try {
      const pagoRes = await db.query('SELECT venta_id FROM pagos_renta WHERE id = ANY($1)', [idList]);
      if (pagoRes.rows.length === 0) {
         return res.status(404).json({ error: 'Pago no encontrado' });
      }
      const ventaId = pagoRes.rows[0].venta_id;

      await db.query('DELETE FROM pagos_renta WHERE id = ANY($1)', [idList]);
      await syncVentaPagos(ventaId);
      res.json({ mensaje: 'Pago(s) eliminado(s) y sincronizado(s) con éxito' });
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar el pago' });
   }
});

// Endpoint para Reportes Contables (Agrupado por día, método y renta)
app.get('/api/ingresos/reporte', verificarToken, esAdmin, async (req, res) => {
   const { desde, hasta } = req.query;
   try {
      let query = `
         SELECT 
            pr.id,
            pr.venta_id,
            pr.fecha_pago,
            pr.metodo,
            pr.monto,
            pr.categoria,
            v.name as cliente_nombre, 
            p.name as producto_nombre
         FROM pagos_renta pr
         INNER JOIN ventas v ON pr.venta_id = v.id
         LEFT JOIN productos p ON v."productId" = p.id
      `;
      const params = [];
      let whereClauses = [];
      
      if (desde) {
         params.push(desde);
         whereClauses.push(`pr.fecha_pago >= $${params.length}`);
      }
      if (hasta) {
         params.push(hasta);
         whereClauses.push(`pr.fecha_pago <= $${params.length}`);
      }

      if (whereClauses.length > 0) {
         query += ` WHERE ` + whereClauses.join(' AND ');
      }

      query += ` ORDER BY pr.fecha_pago DESC, pr.id DESC`;

      const result = await db.query(query, params);
      const agrupados = agruparPagos(result.rows);
      res.json(agrupados);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener el reporte de ingresos' });
   }
});

// Endpoint para eliminar una renta
app.delete('/api/rentas/:id', verificarToken, esAdmin, async (req, res) => {
   const { id } = req.params;
   try {
      const result = await db.query('DELETE FROM ventas WHERE id = $1 RETURNING *', [id]);
      res.json({
         message: 'Renta eliminada con éxito',
         ventaEliminada: result.rows[0]
      });
   } catch (error) {
      console.error('Error al eliminar la renta:', error);
      res.status(500).json({ error: 'Error interno del servidor al eliminar la renta' });
   }
});

// Endpoint para traer las ventas por ID de producto
app.get('/api/ventas/:id', verificarToken, esAdmin, async (req, res) => {
   const { id } = req.params;
   try {
      const result = await db.query('SELECT * FROM ventas WHERE "productId" = $1 ORDER BY id ASC', [id]);
      res.json(result.rows);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener las ventas por ID' });
   }
});

app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'dist', 'index.html'));
});

// Endpoint para probar la conexión a la base de datos
app.get('/db-test', async (req, res) => {
   try {
      const result = await db.query('SELECT NOW()');
      res.json({
         message: 'Conexión exitosa',
         time: result.rows[0].now
      });
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al conectar con la base de datos' });
   }
});

// Endpoint para obtener todos los vestidos
app.get('/api/vestidos', async (req, res) => {
   try {
      const query = `
         SELECT p.*, 
               COALESCE(
                  (SELECT json_agg(ia.name ORDER BY ia.orden) 
                  FROM imagen_productos ia 
                  WHERE ia.id_imagen = p.id), 
                  '[]'
               ) as imagenes
         FROM productos p 
         WHERE p.name IS NOT NULL AND p.vestido = '1'
         ORDER BY p.id DESC
      `;
      const result = await db.query(query);
      res.json(result.rows);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los vestidos de la base de datos' });
   }
});

// Endpoint para obtener todos los accesorios
app.get('/api/accesorios', async (req, res) => {
   try {
      const query = `
         SELECT p.*, 
               COALESCE(
                  (SELECT json_agg(ia.name ORDER BY ia.orden) 
                  FROM imagen_productos ia 
                  WHERE ia.id_imagen = p.id), 
                  '[]'
               ) as imagenes
         FROM productos p 
         WHERE p.name IS NOT NULL AND p.vestido = '0'
         ORDER BY p.id ASC
      `;
      const result = await db.query(query);
      res.json(result.rows);
   } catch (error) {
      console.error("Error en DB:", error.message);
      res.status(500).json({ error: 'Error en la base de datos', details: error.message });
   }
});

//Crear PDFs de recibos
app.post('/api/reciboPdf', verificarToken, esAdmin, async (req, res) => {
   const datosVenta = req.body;
   console.log("Los datos que llegan a la API:", datosVenta);

   try {
      // 1. SOLUCIÓN SEGURIDAD: Usamos consultas parametrizadas ($1 o ?) para evitar Inyección SQL
      const query = `SELECT name, precio_renta FROM productos WHERE id = $1`;
      const result = await db.query(query, [datosVenta.productId]);

      // 2. EXTRAER PRODUCTO: Dependiendo de tu librería (pg, mysql2), los datos vienen en lugares distintos.
      // Si usas 'pg' de PostgreSQL es result.rows[0]. Si usas 'mysql2' suele ser result[0].
      const producto = result.rows ? result.rows[0] : result[0];

      // Validamos si el producto realmente existe en la base de datos
      if (!producto) {
         return res.status(404).json({ error: "El producto especificado no existe." });
      }

      // 3. CÁLCULO: Aseguramos que sean números usando parseFloat para evitar errores de texto
      const precioVestido = parseFloat(producto.precio_renta);
      const anticipoEfectivo = parseFloat(datosVenta.anticipoEfectivo || 0); // Asumo que el formulario envía 'anticipo'
      const anticipoTarjeta = parseFloat(datosVenta.anticipoTarjeta || 0); // Asumo que el formulario envía 'anticipo'
      const anticipoTotal = anticipoEfectivo + anticipoTarjeta
      const diferenciaAPagar = precioVestido - anticipoTotal;

      // 4. COMBINAR DATOS: Unimos lo que llegó del formulario con lo que trajimos de la BD
      const datosCompletosPDF = {
         ...datosVenta,                  // Copia todos los campos originales del formulario
         nombreVestido: producto.name,   // Agrega el nombre desde la BD
         precioVestido: precioVestido,   // Agrega el precio desde la BD
         diferenciaAPagar: diferenciaAPagar, // Agrega el cálculo que hicimos
         anticipoTotal: anticipoTotal
      };

      // 5. PASAR DATOS AL PDF: Ahora sí, enviamos el objeto con toda la información junta
      const pdfBuffer = await CrearReciboPDF(datosCompletosPDF);

      // 6. RESPUESTA: Enviamos el archivo al cliente
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="recibo_venta.pdf"');
      res.send(pdfBuffer);

   } catch (error) {
      console.error("Error al generar PDF:", error);
      res.status(500).json({ error: "No se pudo generar el PDF" });
   }
});

// Ruta comodín para servir index.html en todas las rutas no-API
// Esto permite que React Router maneje el routing del cliente
app.get(/^(?!\/api\/).*$/, (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'dist', 'index.html'));
});

app.listen(port, () => {
   console.log(`Example app listening on port ${port}`);
});

// 1. Para que Express encuentre tus fotos subidas por FileZilla
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// 2. El atrapa-todo definitivo que repara el error del asterisco
app.get(/.*/, (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'dist', 'index.html'));
});