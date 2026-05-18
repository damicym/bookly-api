import * as queries from '../db/queries.js'

export async function getAllBooks() {
  return await queries.listBooks()
}

export async function getBookById(id) {
  return await queries.getBookById(id)
}

export async function getBookByName(nombre) {
  return await queries.getBookByName(nombre)
}

export async function filterBooks(ano, materia) {
  return await queries.filterBooks(ano, materia)
}

export async function searchBookNames(text) {
  return await queries.searchBookNames(text)
}

export async function getBooksByUser(dni) {
  return await queries.listBooksByUser(dni)
}
