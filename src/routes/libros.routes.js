import { Router } from 'express'
import * as librosCtrl from '../controllers/libros.controller.js'

const router = Router()

// GET /api/libros
router.get('/', librosCtrl.getAllBooks)

// GET /api/libros/search?ano=1&materia=x&nombre=x
router.get('/search', librosCtrl.searchBooks)

// GET /api/libros/:id
router.get('/:id', librosCtrl.getBook)

// GET /api/libros/usuario/:dni
router.get('/usuario/:dni', librosCtrl.getUserBooks)

export default router
