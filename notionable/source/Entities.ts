import {
  Database,
  DatabasesQueryParameters,
  NotionClient,
  Page,
  PagesCreateParameters
} from './NotionClient'

export interface NotionableOptions {
  auth: string
}

export interface INotionable {
  fetchWorkspace (
    params: NotionableOptions,
    typesPath: string
  ): Promise<INotionWorkspace | undefined>
}

export interface WorkspaceOptions {
  client: NotionClient,
  settingsMap: NotionDatabasesMap
}

export interface INotionWorkspace {
  //new (options: WorkspaceOptions): void

  getDatabase <ItemType extends { id: string }> (
    dbName: string
  ): INotionDatabase<ItemType>
}

export interface DatabaseOptions {
  client: NotionClient,
  dbSettings: NotionDatabaseSettings
}

export interface INotionDatabase<Item extends { id: string }> {
  //new (options: DatabaseOptions): void

  /** create */
  create (input: Omit<Item, 'id'>): Promise<Item | undefined>
  bulkCreate (input: Omit<Item, 'id'>[]): Promise<Item[] | undefined>

  /** read */
  find (query?: FindQuery): Promise<Item[] | undefined>
  findOne (query?: FindQuery): Promise<Item | undefined>
  findById (id: string): Promise<Item | undefined>

  /** update */
  updateById (id: string, input: Partial<Item>): Promise<Item | undefined>
  updateOne (input: Partial<Item>, query?: FindQuery): Promise<Item | undefined>
  bulkUpdate (input: Partial<Item>, query?: FindQuery): Promise<Item[] | undefined>

  /** delete */
  deleteById (id: string): Promise<boolean | undefined>
  deleteOne (query?: FindQuery): Promise<boolean | undefined>
  bulkDelete (query?: FindQuery): Promise<boolean | undefined>
}

export interface TypeGenerator {
  generateTypeFiles (database: Database, path: string): Promise<{ typeName: string }>
  getPropertiesMap (database: Database): { [key: string]: string }
}

export interface MapperToNotion {
  mapItemToNotionPage <ItemType> (
    database: Database,
    properties: NotionDatabaseSettings['properties'],
    input: ItemType
  ): PagesCreateParameters
}

export interface MapperFromNotion {
  mapNotionPageToItem <ItemType> (
    page: Page,
    properties: NotionDatabaseSettings['properties']
  ): ItemType
}


export type NotionDatabasesMap = {
  [dbName: string]: NotionDatabaseSettings
}

export type NotionDatabaseSettings = {
  id: string,
  properties: {
    [typeName: string]: string
  }
}

export type FindQuery = Omit<DatabasesQueryParameters, 'database_id'>

