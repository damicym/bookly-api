import supabase from './supabase.js'

// Queries traducidas desde BD.cs -> ahora con Supabase (ajustadas al esquema mostrado)

// Helpers
async function fetchBooksByIds(ids = []) {
	if (!ids || ids.length === 0) return []
	const { data, error } = await supabase
		.from('libros')
		.select('id, nombre, materia, ano, editorial')
		.in('id', ids)
	if (error) throw error
	return data || []
}

async function mapBooksById(ids = []) {
	const books = await fetchBooksByIds(ids)
	const map = new Map()
	for (const b of books) map.set(b.id, b)
	return map
}

// Usuarios
export async function getUserByCredentials(dni, password) {
	const { data, error } = await supabase
		.from('usuarios')
		.select('dni, nombre_comp, ano, especialidad, curso, password, about_me')
		.eq('dni', dni)
		.eq('password', password)
		.maybeSingle()
	if (error) throw error
	return data || null
}

export async function updateabout_me(dni, about_me) {
	const { error } = await supabase
		.from('usuarios')
		.update({ about_me })
		.eq('dni', dni)
	if (error) throw error
	return true
}

export async function createUser(user) {
	const payload = {
		dni: user.DNI ?? user.dni,
		nombre_comp: user.nombreComp ?? user.nombre_comp,
		ano: user.ano,
		especialidad: user.especialidad,
		curso: user.curso,
		password: user.password
	}
	const { error } = await supabase.from('usuarios').insert(payload)
	if (error) throw error
	return true
}

export async function userExists(dni) {
	const { data, error } = await supabase
		.from('usuarios')
		.select('dni')
		.eq('dni', dni)
		.limit(1)
	if (error) throw error
	return (data && data.length) ? true : false
}

export async function getUserByDni(dni) {
	const { data, error } = await supabase
		.from('usuarios')
		.select('dni, nombre_comp, ano, especialidad, curso, password, about_me')
		.eq('dni', dni)
		.maybeSingle()
	if (error) throw error
	return data || null
}

// Libros
export async function listBooks() {
	const { data, error } = await supabase
		.from('libros')
		.select('id, nombre, materia, ano, editorial')
	if (error) throw error
	return data || []
}

export async function getBookById(id) {
	const { data, error } = await supabase
		.from('libros')
		.select('id, nombre, materia, ano, editorial')
		.eq('id', id)
		.maybeSingle()
	if (error) throw error
	return data || null
}

export async function getBookByName(nombre) {
	if (!nombre) return null
	const { data, error } = await supabase
		.from('libros')
		.select('id, nombre, materia, ano, editorial')
		.ilike('nombre', nombre)
		.limit(1)
	if (error) throw error
	return data || null
}

// Publicaciones (tabla: publicaciones)
export async function createPublication(publication, dniVendedor) {
	let idLibro = publication.idLibro || publication.id_libro || null

	if (!idLibro && publication.libro && publication.libro.nombre) {
		const { data: existing } = await supabase
			.from('libros')
			.select('id')
			.eq('nombre', publication.libro.nombre)
			.limit(1)
			.maybeSingle()
		if (existing && existing.id) idLibro = existing.id
		else {
			const insertLibro = {
				nombre: publication.libro.nombre,
				materia: publication.libro.materia || null,
				ano: publication.libro.ano || null,
				editorial: publication.libro.editorial || null
			}
			const { data: newLibro, error: errLibro } = await supabase
				.from('libros')
				.insert(insertLibro)
				.select('id')
				.maybeSingle()
			if (errLibro) throw errLibro
			idLibro = newLibro.id
		}
	}

	const insertPub = {
		id_vendedor: dniVendedor,
		precio: publication.precio,
		id_libro: idLibro,
		status: publication.status ?? 1,
		estado_libro: publication.estadoLibro || publication.estado_libro || 'Sin especificar',
		fecha: publication.fecha || new Date().toISOString(),
		descripcion: publication.descripcion || null,
		imagen: publication.imagen || null
	}

	const { data, error } = await supabase
		.from('publicaciones')
		.insert(insertPub)
		.select()
		.maybeSingle()
	if (error) throw error
	return data || null
}

export async function updatePublicationFull(idPublicacion, libroFields, precio, estadoLibro, descripcion, imagen) {
	const { data: pub } = await supabase
		.from('publicaciones')
		.select('id_libro')
		.eq('id', idPublicacion)
		.maybeSingle()
	if (!pub) throw new Error('Publicación no encontrada')

	const idLibro = pub.id_libro
	if (libroFields) {
		const { error: errL } = await supabase
			.from('libros')
			.update({
				nombre: libroFields.nombre,
				materia: libroFields.materia,
				ano: libroFields.ano,
				editorial: libroFields.editorial
			})
			.eq('id', idLibro)
		if (errL) throw errL
	}

	const { error } = await supabase
		.from('publicaciones')
		.update({ precio, estado_libro: estadoLibro, descripcion, imagen })
		.eq('id', idPublicacion)
	if (error) throw error
	return true
}

export async function deleteBookAndPublications(id) {
	const { error: errP } = await supabase.from('publicaciones').delete().eq('id_libro', id)
	if (errP) throw errP
	const { error: errL } = await supabase.from('libros').delete().eq('id', id)
	if (errL) throw errL
	return true
}

export async function listBooksByUser(dni) {
	const { data: pubs, error } = await supabase
		.from('publicaciones')
		.select('id_libro')
		.eq('id_vendedor', dni)
	if (error) throw error
	const ids = [...new Set((pubs || []).map(p => p.id_libro))].filter(Boolean)
	return await fetchBooksByIds(ids)
}

export async function listPublicationsByUser(dni) {
	const { data: pubs, error } = await supabase
		.from('publicaciones')
		.select('*')
		.eq('id_vendedor', dni)
		.order('fecha', { ascending: false })
	if (error) throw error
	const ids = [...new Set((pubs || []).map(p => p.id_libro))].filter(Boolean)
	const booksMap = await mapBooksById(ids)
	return (pubs || []).map(p => ({ ...p, libro: booksMap.get(p.id_libro) || null }))
}

export async function filterBooks(ano, materia) {
	let query = supabase.from('libros').select('id, nombre, materia, ano, editorial')
	if (ano) query = query.eq('ano', ano)
	if (materia) query = query.ilike('materia', materia)
	const { data, error } = await query
	if (error) throw error
	return data || []
}

export async function searchBookNames(text) {
	if (!text) return []
	const { data, error } = await supabase
		.from('libros')
		.select('nombre')
		.ilike('nombre', `%${text}%`)
		.order('nombre')
	if (error) throw error
	return (data || []).map(d => d.nombre)
}

export async function listPublicationsForFeed(limit = -1) {
	let query = supabase.from('publicaciones').select('*').eq('status', 1).order('fecha', { ascending: false })
	if (limit > 0) query = query.limit(limit)
	const { data: pubs, error } = await query
	if (error) throw error
	const ids = [...new Set((pubs || []).map(p => p.id_libro))].filter(Boolean)
	const booksMap = await mapBooksById(ids)
	return (pubs || []).map(p => ({ ...p, libro: booksMap.get(p.id_libro) || null }))
}

export async function getRecommendations(ano, especialidad) {
	let query = supabase.from('publicaciones').select('*').eq('status', 1).order('fecha', { ascending: false })
	const { data: pubs, error } = await query
	if (error) throw error
	const ids = [...new Set((pubs || []).map(p => p.id_libro))].filter(Boolean)
	const books = await fetchBooksByIds(ids)
	const booksMap = new Map(books.map(b => [b.id, b]))
	const filtered = (pubs || []).filter(p => {
		const b = booksMap.get(p.id_libro)
		if (!b) return false
		if (b.ano != ano) return false
		if (!especialidad) return true
		return (b.materia || '').toLowerCase().includes((especialidad || '').toLowerCase())
	})
	return filtered.map(p => ({ ...p, libro: booksMap.get(p.id_libro) }))
}

export async function getRecommendationsByYear(ano) {
	const { data: pubs, error } = await supabase
		.from('publicaciones')
		.select('*')
		.order('fecha', { ascending: false })
	if (error) throw error
	const ids = [...new Set((pubs || []).map(p => p.id_libro))].filter(Boolean)
	const booksMap = await mapBooksById(ids)
	const filtered = (pubs || []).filter(p => {
		const b = booksMap.get(p.id_libro)
		return b && b.ano == ano
	})
	return filtered.map(p => ({ ...p, libro: booksMap.get(p.id_libro) }))
}

export async function listPublicationsCompleteByUser(dni) {
	return await listPublicationsByUser(dni)
}

export async function getPublicationCompleteById(id) {
	const { data: pub, error } = await supabase
		.from('publicaciones')
		.select('*')
		.eq('id', id)
		.maybeSingle()
	if (error) throw error
	if (!pub) return null
	const book = await getBookById(pub.id_libro)
	return { ...pub, libro: book }
}

export async function deletePublication(idPublicacion) {
	const { error } = await supabase.from('publicaciones').delete().eq('id', idPublicacion)
	if (error) throw error
	return true
}

// Deseados
export async function addToWishlist(dni, idPublicacion) {
	const { data: exists, error: err1 } = await supabase
		.from('deseados')
		.select('dni_usuario')
		.eq('dni_usuario', dni)
		.eq('id_publicacion', idPublicacion)
		.limit(1)
	if (err1) throw err1
	if (exists && exists.length) return true
	const { error } = await supabase.from('deseados').insert({ dni_usuario: dni, id_publicacion: idPublicacion })
	if (error) throw error
	return true
}

export async function removeFromWishlist(dni, idPublicacion) {
	const { error } = await supabase
		.from('deseados')
		.delete()
		.eq('dni_usuario', dni)
		.eq('id_publicacion', idPublicacion)
	if (error) throw error
	return true
}

export async function listWishlistIdsForUser(dni) {
	if (!dni) return []
	const { data, error } = await supabase
		.from('deseados')
		.select('id_publicacion')
		.eq('dni_usuario', dni)
	if (error) throw error
	return (data || []).map(d => d.id_publicacion)
}

export async function listFavoritePublicationsByUser(dni) {
	const ids = await listWishlistIdsForUser(dni)
	if (!ids || ids.length === 0) return []
	const { data: pubs, error } = await supabase.from('publicaciones').select('*').in('id', ids).order('fecha', { ascending: false })
	if (error) throw error
	const bookIds = [...new Set((pubs || []).map(p => p.id_libro))].filter(Boolean)
	const booksMap = await mapBooksById(bookIds)
	return (pubs || []).map(p => ({ ...p, libro: booksMap.get(p.id_libro) || null }))
}

// Actualizar imágenes: helper para actualizar por nombre de libro
export async function updatePublicationImageByBookName(nombreLibro, imagenBytes) {
	const { data: libro, error: e1 } = await supabase.from('libros').select('id').eq('nombre', nombreLibro).limit(1).maybeSingle()
	if (e1) throw e1
	if (!libro) return 0
	const { error } = await supabase.from('publicaciones').update({ imagen: imagenBytes }).eq('id_libro', libro.id)
	if (error) throw error
	return 1
}

export default {
	// usuarios
	getUserByCredentials,
	updateabout_me,
	createUser,
	userExists,
	getUserByDni,
	// libros
	listBooks,
	getBookById,
	getBookByName,
	// publicaciones
	createPublication,
	updatePublicationFull,
	updatePublicationByBookId,
	deleteBookAndPublications,
	listBooksByUser,
	listPublicationsByUser,
	filterBooks,
	searchBookNames,
	listPublicationsForFeed,
	getRecommendations,
	getRecommendationsByYear,
	listPublicationsCompleteByUser,
	getPublicationCompleteById,
	deletePublication,
	// deseados
	addToWishlist,
	removeFromWishlist,
	listWishlistIdsForUser,
	listFavoritePublicationsByUser,
	// images
	updatePublicationImageByBookName
}

