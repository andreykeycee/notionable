import { Database, RichText } from '@notionhq/client/build/src/api-types'
import { camelCase, upperFirst } from 'lodash'

export type ID = string

export const compareText = (text1: string, text2: string): boolean => {
  return text1.trim().toLowerCase() === text2.trim().toLowerCase()
}

export const generateTypeName = (db: Database): string => {
  const dbTitle = getDatabaseTitle(db.title)
  const typeName = upperFirst(camelCase(dbTitle.trim()))

  return typeName.endsWith('s')
    ? typeName.slice(0, -1)
    : typeName
}

const getDatabaseTitle = (title: RichText[]): string => {
  return title.find(title => title.type === 'text')?.plain_text ?? 'unknown'
}