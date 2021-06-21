import { Database, Property } from '@notionhq/client/build/src/api-types'
import { camelCase, upperFirst } from 'lodash'
import { access, rm, writeFile } from 'fs/promises'
import { generateTypeName } from './Notionable/Utils'
import path from 'path'

interface IDBTypeInfo {
  typeName: string
  typesPath: string
  propsPath: string
}

export const generateTypeFiles = async (
  notionDB: Database,
  targetPath: string
): Promise<IDBTypeInfo> => {
  const fileName = generateTypeName(notionDB)
  const propsFileName = fileName + '.props.ts'
  const typesFileName = fileName + '.type.ts'

  const typesPath = path.join(targetPath, typesFileName)
  const propsPath = path.join(targetPath, propsFileName)
  console.log(typesPath)

  if (await typeFileExists(propsPath)) {
    await rm(propsPath)
  }

  await writeFile(
    propsPath, generatePropertiesFromType(notionDB),
    // @ts-expect-error
    (e: string) => e && console.error('Error on props file write: ' + e)
  )

  if (await typeFileExists(typesPath)) {
    await rm(typesPath)
  }

  await writeFile(
    typesPath, generateTypeFromNotionDatabase(notionDB),
    // @ts-expect-error
    (e: string) => e && console.error('Error on type file write: ' + e)
  )

  return {
    typeName: fileName,
    typesPath,
    propsPath
  }
}


const generatePropertiesFromType = (notionDB: Database): string => {
  const { properties } = notionDB

  return `export const ${generateTypeName(notionDB)}Props = {${
    Object.keys(properties).reduce((props, key) => {
      const separator = '\n\t'
      return `${props}${separator}${camelCase(key)}: '${key}',`
    }, '')
  }\n}`.trim()
}


export const generateTypeFromNotionDatabase = (notionDB: Database): string => {
  const { properties } = notionDB

  return `export type ${generateTypeName(notionDB)}Type = {${
    Object.entries(properties)
      .map(getEntryType)
      .reduce((types, type) => {
        const separator = '\n\t'
        return `${types}${separator}${type}`
      }, '')
  }\n}`.trim()
}


const getEntryType = ([key, property]: [string, Property]): string => {
  let propertyType

  switch (property.type) {
    case 'title':
    case 'rich_text':
    case 'email':
      propertyType = 'string'
      break

    case 'checkbox':
      propertyType = 'boolean'
      break

    case 'created_by':
    case 'created_time':
    case 'last_edited_time':
    case 'date':
      propertyType = 'Date'
      break

    case 'number':
      propertyType = 'number'
      break

    default:
      propertyType = 'string'
  }

  return `${camelCase(key)}: ${propertyType}`
}


const typeFileExists = async (path: string): Promise<boolean> => {
  try {
    await access(path)
    return true
  } catch (e) {
    return false
  }
}

