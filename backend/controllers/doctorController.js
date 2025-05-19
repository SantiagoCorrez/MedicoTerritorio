// doctor.controller.js  –  ES Module
import pool from '../models/db.js';        // ? conexión a PostgreSQL (ESM)

// -------------------------------------------------------------
// GET /api/doctores
export const getAllDoctors = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM doctores');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener doctores' });
  }
};

// -------------------------------------------------------------
// GET /api/doctores/municipio/:codigo
export const getDoctorsByMunicipio = async (req, res) => {
  const { codigo } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM doctores WHERE codigo_municipio = $1',
      [codigo],
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Error al obtener doctores por municipio' });
  }
};

// -------------------------------------------------------------
// POST /api/doctores
export const createDoctor = async (req, res) => {
  const {
    codigo_municipio,
    nombre_municipio,
    nombre_medico,
    especialidad_medico,
    foto,
    numero_consultas,
    direccion,
    puesto_atencion,
  } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO doctores (
        codigo_municipio, nombre_municipio, nombre_medico, especialidad_medico,
        foto, numero_consultas, direccion, puesto_atencion
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        codigo_municipio,
        nombre_municipio,
        nombre_medico,
        especialidad_medico,
        foto,
        numero_consultas,
        direccion,
        puesto_atencion,
      ],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear médico' });
  }
};

// -------------------------------------------------------------
// PUT /api/doctores/:id
export const updateDoctor = async (req, res) => {
  const { id } = req.params;
  const {
    nombre_medico,
    especialidad_medico,
    foto,
    numero_consultas,
    direccion,
    puesto_atencion,
  } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE doctores SET
        nombre_medico = $1,
        especialidad_medico = $2,
        foto = $3,
        numero_consultas = $4,
        direccion = $5,
        puesto_atencion = $6
      WHERE id = $7
      RETURNING *`,
      [
        nombre_medico,
        especialidad_medico,
        foto,
        numero_consultas,
        direccion,
        puesto_atencion,
        id,
      ],
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar médico' });
  }
};

// -------------------------------------------------------------
// DELETE /api/doctores/:id
export const deleteDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM doctores WHERE id = $1', [id]);
    res.json({ message: 'Médico eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar médico' });
  }
};
