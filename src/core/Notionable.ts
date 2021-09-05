import {
  INotionable,
  NotionableOptions, NotionDatabaseSettings,
  NotionDatabasesMap
} from './Entities'
import TypeGenerator from './TypeGenerator'
import { NotionWorkspace } from './NotionWorkspace'
import { Database, NotionClient } from './NotionClient'
import { lowerCase } from 'lodash'

export const Notionable: INotionable = {

  async fetchWorkspace (params: NotionableOptions, path: string) {
    const client = new NotionClient(params)
    try {
      const dbList = await client.databases.list()
      const settingsMap: NotionDatabasesMap = {}

      for (const db of dbList.results) {
        await TypeGenerator.generateTypeFiles(db, path)
        const dbTitle = getDbTitle(db)

        settingsMap[dbTitle] = {
          id: db.id,
          properties: TypeGenerator.getPropertiesMap(db)
        }
      }

      return new NotionWorkspace({ client, settingsMap })
    } catch (e) {
      console.error('Error on fetching Notion workspace: ', e)
    }
  }
}

const getDbTitle = (database: Database): string => {
  const title = database.title.find(title => title.type === 'text')

  if (title) {
    return lowerCase(title.plain_text.trim())
  } else {
    throw new Error('Unsupported title in database: ' + database.title)
  }
}