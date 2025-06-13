// doctor.controller.js  �  ES Module
import pool from '../models/db.js';        // ? conexi�n a PostgreSQL (ESM)

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
    general_medico,
    especialidad_medico,
    numero_consultas,
    numero_consultas_especialidad,
    direccion,
    puesto_atencion,
  } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO doctores (
        codigo_municipio, nombre_municipio, general_medico, especialidad_medico,
        numero_consultas, numero_consultas_especialidad, direccion, puesto_atencion
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        codigo_municipio,
        nombre_municipio,
        general_medico,
        especialidad_medico,
        numero_consultas,
        numero_consultas_especialidad,
        direccion,
        puesto_atencion,
      ],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear m�dico' });
  }
};

// -------------------------------------------------------------
// PUT /api/doctores/:id
export const updateDoctor = async (req, res) => {
  const { id } = req.params;
  const {
    general_medico,
    especialidad_medico,
    numero_consultas_especialidad,
    numero_consultas,
    direccion,
    puesto_atencion,
  } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE doctores SET
        general_medico = $1,
        especialidad_medico = $2,
        numero_consultas_especialidad = $3,
        numero_consultas = $4,
        direccion = $5,
        puesto_atencion = $6
      WHERE id = $7
      RETURNING *`,
      [
        general_medico,
        especialidad_medico,
        numero_consultas_especialidad,
        numero_consultas,
        direccion,
        puesto_atencion,
        id,
      ],
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar m�dico' });
  }
};

// -------------------------------------------------------------
// DELETE /api/doctores/:id
export const deleteDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM doctores WHERE id = $1', [id]);
    res.json({ message: 'M�dico eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar m�dico' });
  }
};
