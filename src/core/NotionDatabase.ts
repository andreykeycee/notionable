import {
  DatabaseOptions,
  INotionDatabase,
  NotionDatabaseSettings
} from './Entities'
import {
  Database,
  DatabasesQueryParameters,
  NotionClient,
  Page,
  PagesUpdateParameters
} from './NotionClient'
import MapperToNotion from './MapperToNotion'
import MapperFromNotion from './MapperFromNotion'

export class NotionDatabase <
  ItemType extends { id: string }
> implements INotionDatabase<ItemType> {

  private readonly _client: NotionClient
  private readonly _dbSettings: NotionDatabaseSettings

  constructor ({ client, dbSettings }: DatabaseOptions) {
    this._client = client
    this._dbSettings = dbSettings
  }

  async create (input: Omit<ItemType, 'id'>) {
    const { properties } = this._dbSettings

    try {
      const database = await this._getNotionDatabase() as Database
      const itemToCreate = MapperToNotion.mapItemToNotionPage(database, properties, input)
      const createdPage = await this._client.pages.create(itemToCreate) as unknown as Page

      return MapperFromNotion.mapNotionPageToItem<ItemType>(createdPage, properties)
    } catch (e) {
      console.error('Error on create: ' + e)
    }
  }

  async bulkCreate (input: Omit<ItemType, 'id'>[]) {
    try {
      const createdItems: ItemType[] = []

      for (const item of input) {
        const createdItem = await this.create(item)
        createdItems.push(createdItem as ItemType)
      }

      return createdItems
    } catch (e) {
      console.error('Error on bulk create: ' + e)
    }
  }

  async find (query: DatabasesQueryParameters) {
    try {
      const response = await this._client.databases.query(query)

      return response.results.map(result => {
        return MapperFromNotion.mapNotionPageToItem(result, this._dbSettings.properties)
      }) as ItemType[]
    } catch (e) {
      console.error('Error on find: ' + e)
    }
  }

  async findOne (query: DatabasesQueryParameters) {
    try {
      const allResults = await this.find(query)
      return allResults?.[0]
    } catch (e) {
      console.error('Error on findOne: ' + e)
    }
  }

  async findById (id: string) {
    try {
      const page = await this._client.pages.retrieve({ page_id: id })
      return page && MapperFromNotion.mapNotionPageToItem<ItemType>(
        page, this._dbSettings.properties
      )
    } catch (e) {
      console.error('Error on findById: ' + e)
    }
  }

  async updateById (id: string, input: Partial<ItemType>) {
    try {
      const { properties } = this._dbSettings

      const database = await this._getNotionDatabase() as Database
      const dataToUpdate = MapperToNotion.mapItemToNotionPage(database, properties, input)

      const updatedPage = await this._client.pages.update({
        page_id: id,
        properties: dataToUpdate as unknown as PagesUpdateParameters['properties'],
        archived: false
      })

      return MapperFromNotion.mapNotionPageToItem<ItemType>(updatedPage, properties)
    } catch (e) {
      console.error('Error on updateById: ' + e)
    }
  }

  async updateOne (query: DatabasesQueryParameters, input: Partial<ItemType>) {
    try {
      const targetPage = await this.findOne(query)

      if (targetPage) {
        return this.updateById(targetPage.id, input)
      }
    } catch (e) {
      console.error('Error on updateOne: ' + e)
    }
  }

  async bulkUpdate (query: DatabasesQueryParameters, input: Partial<ItemType>) {
    try {
      const findResults = await this.find(query)
      if (findResults) {
        const updatedItems: ItemType[] = []

        for (const result of findResults) {
          const updated = await this.updateById(result.id, input)
          updatedItems.push(updated as ItemType)
        }

        return updatedItems
      }
    } catch (e) {
      console.error('Error on bulkUpdate: ' + e)
    }
  }

  async deleteById (id: string) {
    try {
      return !!(await this._client.pages.update({
        page_id: id,
        properties: {},
        archived: true
      }))
    } catch (e) {
      console.error('Error on deleteById: ' + e)
    }
  }

  async deleteOne (query: DatabasesQueryParameters) {
    try {
      const targetPage = await this.findOne(query)

      if (targetPage) {
        return this.deleteById(targetPage.id)
      }
    } catch (e) {
      console.error('Error on deleteOne: ' + e)
    }
  }

  async bulkDelete (query: DatabasesQueryParameters) {
    try {
      const targetPages = await this.find(query)

      if (targetPages) {
        for (const { id } of targetPages) {
          await this.deleteById(id)
        }
      }

      return true
    } catch (e) {
      console.error('Error on bulkDelete: ' + e)
    }
  }

  private async _getNotionDatabase (): Promise<Database | undefined> {
    try {
      return await this._client.databases.retrieve({
        database_id: this._dbSettings.id
      })
    } catch (e) {
      throw new Error('Error on database fetching: ' + e)
    }
  }
}