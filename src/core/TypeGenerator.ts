import path from 'path'
import { access, rm, writeFile } from 'fs/promises'
import { camelCase, upperFirst } from 'lodash'
import { TypeGenerator } from './Entities'
import { Database, Property } from './NotionClient'
import { RichText } from '@notionhq/client/build/src/api-types'
import { getDbTitle } from './Helper'

const generateTypeFiles = async (
  notionDB: Database,
  targetPath: string
): Promise<{ typeName: string }> => {
  console.log(notionDB)
  const fileName = generateTypeName(notionDB)
  const typesFileName = fileName + '.type.ts'

  const typesPath = path.join(targetPath, typesFileName)

  if (await typeFileExists(typesPath)) {
    await rm(typesPath)
  }

  await writeFile(
    typesPath, generateTypeFromNotionDatabase(notionDB),
    // @ts-expect-error
    (e: string) => e && console.error('Error on type file write: ' + e)
  )

  return {
    typeName: fileName
  }
}

const getPropertiesMap = (db: Database) => {
  return Object.keys(db.properties).reduce(
    (keys, key) => {
      return {
        ...keys,
        [camelCase(key)]: key
      }
    }, {}
  )
}

const generateTypeFromNotionDatabase = (notionDB: Database): string => {
  const { properties } = notionDB

  return `export type ${generateTypeName(notionDB)}Type = {${Object.entries(properties)
      .map(getEntryType)
      .reduce((types, type) => {
        const separator = '\n\t'
        return `${types}${separator}${type}`
      }, '\n\tid: string')
  }\n}`.trim()
}


const getEntryType = ([key, property]: [string, Property]): string => {
  let propertyType

  switch (property.type) {
    case 'title':
    case 'rich_text':
    case 'email':
    case 'select':
    case 'url':
    case 'phone_number':
    case 'created_by':
    case 'last_edited_by':
      propertyType = 'string'
      break

    case 'checkbox':
      propertyType = 'boolean'
      break

    case 'created_time':
    case 'last_edited_time':
      propertyType = 'Date'
      break

    case 'date':
      propertyType = '{ start: Date, end?: Date }'
      break

    case 'number':
      propertyType = 'number'
      break

    case 'relation':
    case 'multi_select':
    case 'people':
      propertyType = 'string[]'
      break

    case 'files':
      propertyType = '{ name: string, url: string | undefined }[]'
      break

    case 'formula':
      propertyType = 'string | boolean | number | { start?: Date, end?: Date } | null | undefined'
      break

    case 'rollup':
      propertyType = 'any[] | number | { start?: Date | undefined, end?: Date | undefined } | null | undefined'
      break

    default:
      propertyType = 'string'
  }

  const propertyKey = getPropertyKey(key, property.id)

  return `${propertyKey}: ${propertyType}`
}

const typeFileExists = async (path: string): Promise<boolean> => {
  try {
    await access(path)
    return true
  } catch (e) {
    return false
  }
}

const generateTypeName = (db: Database): string => {
  const dbTitle = getDbTitle(db)
  const typeName = upperFirst(camelCase(dbTitle.trim()))

  return typeName.endsWith('s')
    ? typeName.slice(0, -1)
    : typeName
}

const getPropertyKey = (key: string, id: string) => {
  const parsed = camelCase(key.replace(/[^\x00-\x7F]/g, ''))
  return parsed
    ? parsed.match(/^\d/)
      ? `'${parsed}'`
      : parsed
    : `'${id}'`
}


export default {
  generateTypeFiles,
  getPropertiesMap,
} as TypeGenerator