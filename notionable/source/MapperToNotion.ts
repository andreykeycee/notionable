import { Database, NumberPropertyValue, PagesCreateParameters, PropertyValue, RichTextPropertyValue, TitlePropertyValue } from './NotionClient'
import { MapperToNotion, NotionDatabaseSettings } from './Entities'
import {
  CheckboxPropertyValue,
  DatePropertyValue, EmailPropertySchema, EmailPropertyValue, MultiSelectPropertyValue,
  PhoneNumberPropertyValue, SelectPropertyValue,
  URLPropertyValue
} from '@notionhq/client/build/src/api-types'

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

    case 'date':
      return getNotionDateProperty(inputValue)

    case 'phone_number':
      return getNotionPhoneNumberProperty(inputValue)

    case 'url':
      return getNotionUrlProperty(inputValue)

    case 'checkbox':
      return getNotionCheckboxProperty(inputValue)

    case 'multi_select':
      return getNotionMultiSelectProperty(inputValue)

    case 'select':
      return getNotionSelectProperty(inputValue)

    case 'email':
      return getNotionEmailProperty(inputValue)

    default:
      throw new Error('You\'re trying to set unsupported or readonly value')
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


const getNotionDateProperty = (
  value: { start?: Date, end?: Date }
): DatePropertyValue => {
  const start = value.start?.toDateString() ?? ''
  const end = value.start?.toDateString()

  // @ts-ignore
  return {
    date: { start, end }
  }
}


const getNotionPhoneNumberProperty = (value: string): PhoneNumberPropertyValue => {
  // @ts-ignore
  return {
    phone_number: value
  }
}


const getNotionUrlProperty = (value: string): URLPropertyValue => {
  // @ts-ignore
  return {
    url: value
  }
}


const getNotionCheckboxProperty = (value: boolean): CheckboxPropertyValue => {
  // @ts-ignore
  return {
    checkbox: value
  }
}


const getNotionMultiSelectProperty = (value: string[]): MultiSelectPropertyValue => {
  // @ts-ignore
  return {
    multi_select: value.map(v => ({
      name: v
    }))
  }
}


const getNotionSelectProperty = (value: string): SelectPropertyValue => {
  // @ts-ignore
  return {
    select: {
      name: value
    }
  }
}


const getNotionEmailProperty = (value: string): EmailPropertyValue => {
  // @ts-ignore
  return {
    email: value
  }
}

export default {
  mapItemToNotionPage
} as MapperToNotion