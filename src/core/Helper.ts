import { FindQuery } from './Entities'
import { Database, DatabasesQueryParameters } from './NotionClient'
import { lowerCase } from 'lodash'

export const applyQuery = (
  databaseId: string,
  query: FindQuery = {}
): DatabasesQueryParameters => {
  return {
    database_id: databaseId,
    ...query
  }
}

export const getDbTitle = (database: Database): string => {
  const title = database.title.find(title => title.type === 'text')

  if (title) {
    return lowerCase(title.plain_text.trim())
  } else {
    throw new Error('Unsupported title in database: ' + database.title)
  }
}