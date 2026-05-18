import * as queries from '../db/queries.js'

export async function addToWishlist(dni, idPublicacion) {
  return await queries.addToWishlist(dni, idPublicacion)
}

export async function removeFromWishlist(dni, idPublicacion) {
  return await queries.removeFromWishlist(dni, idPublicacion)
}

export async function getWishlistIds(dni) {
  return await queries.listWishlistIdsForUser(dni)
}

export async function getFavoritePublications(dni) {
  return await queries.listFavoritePublicationsByUser(dni)
}
