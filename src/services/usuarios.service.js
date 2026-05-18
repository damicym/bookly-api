import * as queries from '../db/queries.js'

export async function login(dni, password) {
  return await queries.getUserByCredentials(dni, password)
}

export async function register(user) {
  const exists = await queries.userExists(user.dni)
  if (exists) throw new Error('El usuario ya existe')
  return await queries.createUser(user)
}

export async function getUserByDni(dni) {
  return await queries.getUserByDni(dni)
}

export async function updateAboutMe(dni, aboutMe) {
  return await queries.updateAboutMe(dni, aboutMe)
}
