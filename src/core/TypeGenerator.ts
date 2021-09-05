import path from 'path'
import { access, rm, writeFile } from 'fs/promises'
import { camelCase, upperFirst } from 'lodash'
import { TypeGenerator } from './Entities'
import { Database, Property } from './NotionClient'
import { RichText } from '@notionhq/client/build/src/api-types'

const generateTypeFiles = async (
  notionDB: Database,
  targetPath: string
): Promise<{ typeName: string }> => {
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

const generateTypeName = (db: Database): string => {
  const dbTitle = getDatabaseTitle(db.title)
  const typeName = upperFirst(camelCase(dbTitle.trim()))

  return typeName.endsWith('s')
    ? typeName.slice(0, -1)
    : typeName
}

const getDatabaseTitle = (title: RichText[]): string => {
  return title.find(title => title.type === 'text')?.plain_text ?? 'unknown'
}

export default {
  generateTypeFiles,
  getPropertiesMap,
} as TypeGenerator