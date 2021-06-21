import { INotionDatabase, NotionDatabase } from './NotionDatabase'
import { Client as NotionClient } from '@notionhq/client'
import { compareText } from './Utils'

export class Notionable implements INotionable {
  private readonly _client: NotionClient
  private readonly _path: string

  public constructor ({ apiKey, typesGenPath }: INotionableConstructorProps) {
    this._client = new NotionClient({ auth: apiKey })
    this._path = typesGenPath
  }

  // @ts-expect-error
  public async getDatabase <T = object> (dbName: string) {
    // @ts-expect-error
    const dbsList = await this._client.databases.list()

    const targetDb = dbsList.results.find(result => {
      const title = result.title.find(title => title.type === 'text')
      return title && compareText(title.plain_text, dbName)
    })

    if (targetDb) {
      const db = new NotionDatabase<T>({
        client: this._client,
        path: this._path,
        database: targetDb
      })
      await db.updateTypesAndProps(this._path)
      return db
    } else {
      throw new Error('Database with that name wasn\'t found')
    }
  }
}

interface INotionableConstructorProps {
  apiKey: string
  typesGenPath: string
}

interface INotionable {
  getDatabase <Item = object> (dbName: string): Promise<INotionDatabase<Item>>
}