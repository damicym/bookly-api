import * as queries from '../db/queries.js'

export async function createPublication(publication, dniVendedor) {
  return await queries.createPublication(publication, dniVendedor)
}

export async function updatePublicationFull(idPublicacion, libroFields, precio, estadoLibro, descripcion, imagen) {
  return await queries.updatePublicationFull(idPublicacion, libroFields, precio, estadoLibro, descripcion, imagen)
}

export async function updatePublicationByBookId(idLibro, precio, estadoLibro, descripcion) {
  return await queries.updatePublicationByBookId(idLibro, precio, estadoLibro, descripcion)
}

export async function deletePublication(idPublicacion) {
  return await queries.deletePublication(idPublicacion)
}

export async function deleteBookAndPublications(id) {
  return await queries.deleteBookAndPublications(id)
}

export async function getPublicationsOfUser(dni) {
  return await queries.listPublicationsByUser(dni)
}

export async function getPublicationById(id) {
  return await queries.getPublicationCompleteById(id)
}

export async function getFeed(limit = -1) {
  return await queries.listPublicationsForFeed(limit)
}

export async function getRecommendations(ano, especialidad) {
  return await queries.getRecommendations(ano, especialidad)
}

export async function getRecommendationsByYear(ano) {
  return await queries.getRecommendationsByYear(ano)
}
