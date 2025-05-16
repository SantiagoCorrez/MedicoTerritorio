const pool = require("../models/db");

exports.getAllDoctors = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM doctores");
    res.json(result.rows);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Error al obtener doctores" });
  }
};

exports.getDoctorsByMunicipio = async (req, res) => {
  const { codigo } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM doctores WHERE codigo_municipio = $1",
      [codigo]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener doctores por municipio" });
  }
};

exports.createDoctor = async (req, res) => {
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
    const result = await pool.query(
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
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al crear médico" });
  }
};

exports.updateDoctor = async (req, res) => {
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
    const result = await pool.query(
      `UPDATE doctores SET 
        nombre_medico = $1, especialidad_medico = $2, foto = $3,
        numero_consultas = $4, direccion = $5, puesto_atencion = $6
      WHERE id = $7 RETURNING *`,
      [
        nombre_medico,
        especialidad_medico,
        foto,
        numero_consultas,
        direccion,
        puesto_atencion,
        id,
      ]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar médico" });
  }
};

exports.deleteDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM doctores WHERE id = $1", [id]);
    res.json({ message: "Médico eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar médico" });
  }
};
