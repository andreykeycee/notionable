import { INotionDatabase, INotionWorkspace, NotionDatabasesMap, WorkspaceOptions } from './Entities'
import { NotionClient } from './NotionClient'
import { NotionDatabase } from './NotionDatabase'

export class NotionWorkspace implements INotionWorkspace {
  private readonly _client: NotionClient
  private readonly _settingsMap: NotionDatabasesMap

  constructor ({ client, settingsMap }: WorkspaceOptions) {
    this._client = client
    this._settingsMap = settingsMap
  }

  getDatabase <ItemType extends { id: string }> (dbName: string) {
    const dbSettings = this._settingsMap[dbName]

    if (!dbSettings) {
      throw new Error(dbName + ' doesn\'t exist in the workspace')
    }

    return new NotionDatabase<ItemType>({
      client: this._client,
      dbSettings
    })
  }
}