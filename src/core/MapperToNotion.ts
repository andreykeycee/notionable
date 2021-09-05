import { Database, NumberPropertyValue, PagesCreateParameters, PropertyValue, RichTextPropertyValue, TitlePropertyValue } from './NotionClient'
import { MapperToNotion, NotionDatabaseSettings } from './Entities'

const mapItemToNotionPage = <ItemType extends { [key: string]: any }> (
  database: Database,
  properties: NotionDatabaseSettings['properties'],
  input: ItemType
): PagesCreateParameters => {
  return {
    parent: { database_id: database.id },
    properties: Object.entries(properties).reduce(
      (properties, [typeName, propName]) => {
        return {
          ...properties,
          [propName]: getNotionProperty({
            propName,
            database,
            inputValue: input[typeName]
          })
        }
      }, {}
    )
  }
}

interface GetNotionPropertyArgs {
  propName: string,
  database: Database,
  inputValue: any
}

const getNotionProperty = ({
 propName,
 database,
 inputValue
}: GetNotionPropertyArgs): PropertyValue => {
  const propertySettings = database.properties[propName]

  switch (propertySettings.type) {
    case 'title':
      return getNotionTitleValue(inputValue)

    case 'rich_text':
      return getNotionRichTextValue(inputValue)

    case 'number':
      return getNotionNumberProperty(inputValue)

    default:
      return getNotionRichTextValue(inputValue)
  }
}

const getNotionTitleValue = (value: string): TitlePropertyValue => {
  return {
    title: [
      // @ts-ignore
      {
        type: 'text',
        text: {
          content: value
        }
      }
    ]
  }
}


const getNotionRichTextValue = (value: string): RichTextPropertyValue => {
  return {
    rich_text: [
      // @ts-ignore
      {
        text: {
          content: value
        }
      }
    ]
  }
}


const getNotionNumberProperty = (value: number): NumberPropertyValue => {
  // @ts-ignore
  return {
    number: value
  }
}

export default {
  mapItemToNotionPage
} as MapperToNotion