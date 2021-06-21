import { DatabasesQueryParameters } from '@notionhq/client/build/src/api-endpoints'
import { ID } from './Utils'
import { Client as NotionClient } from '@notionhq/client/build/src'
import { Database } from '@notionhq/client/build/src/api-types'
import { generateTypeFiles } from '../typeGenerator'
import { mapTypeToNotion } from './TypeToNotionMappers'


export class NotionDatabase <Item>
  //implements INotionDatabase<Item>
{
  private readonly _client: NotionClient
  private readonly _database: Database

  private _dbName!: string
  private _typesPath!: string
  private _propsPath!: string

  public constructor ({ client, path, database }: INotionDatabaseConstructorProps) {
    this._client = client
    this._database = database
  }

  public async updateTypesAndProps (path: string) {
    const {
      typeName,
      typesPath,
      propsPath
    } = await generateTypeFiles(this._database, path)

    this._dbName = typeName
    this._typesPath = typesPath
    this._propsPath = propsPath
  }

  public async create (input: Item) {
    if (!this._typesGenerated) throw 'Notionable Error: type files was not generated yet'
    const propNames = this._propNames
    const dataToCreate = mapTypeToNotion(propNames, this._database, input)
    return this._client.pages.create(dataToCreate)
  }

  private get _typesGenerated (): boolean {
    return Boolean(this._dbName && this._typesPath && this._propsPath)
  }

  private get _propNames () {
    const propsFile = require(this._propsPath)
    return propsFile[this._dbName + 'Props']
  }
}

export interface INotionDatabase<Item> {
  constructor (props: INotionDatabaseConstructorProps): void

  /** create */
  create (input: Item): Promise<Item>
  bulkCreate (input: Item[]): Promise<Item[]>

  /** read */
  find (query: DatabasesQueryParameters): Promise<Item[]>
  findOne (query: DatabasesQueryParameters): Promise<Item>
  findById (id: ID): Promise<Item>

  /** update */
  updateById (id: ID, input: Partial<Item>): Promise<Item>
  updateOne (query: DatabasesQueryParameters, input: Partial<Item>): Promise<Item>
  bulkUpdate (query: DatabasesQueryParameters, input: Partial<Item>): Promise<Item[]>

  /** delete */
  deleteById (id: ID): Promise<boolean>
  deleteOne (query: DatabasesQueryParameters): Promise<boolean>
  bulkDelete (query: DatabasesQueryParameters): Promise<boolean>
}

interface INotionDatabaseConstructorProps {
  client: NotionClient,
  path: string,
  database: Database
}