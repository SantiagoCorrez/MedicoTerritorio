import express from 'express';
import {
  getAllDoctors,
  getDoctorsByMunicipio,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', getAllDoctors);
router.get('/municipio/:codigo', getDoctorsByMunicipio);
router.post('/', createDoctor);
router.put('/:id', updateDoctor);
router.delete('/:id', deleteDoctor);

export default router;
