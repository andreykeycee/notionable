import { PagesCreateParameters } from '@notionhq/client/build/src/api-endpoints'
import {
  Database, NumberPropertyValue,
  PropertyValue,
  RichTextPropertyValue,
  TitlePropertyValue
} from '@notionhq/client/build/src/api-types'
import { text } from 'express'

export const mapTypeToNotion = (
  props: PropsObject,
  database: Database,
  inputObject: { [key: string]: any }
): PagesCreateParameters => {
  return {
    parent: { database_id: database.id },
    properties: Object.entries(props).reduce(
      (properties, [typeName, propName]) => {
        return {
          ...properties,
          [propName]: getNotionProperty({
            propName,
            database,
            inputValue: inputObject[typeName]
          })
        }
      }, {}
    )
  }
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

type GetNotionPropertyArgs = {
  propName: string
  database: Database
  inputValue: any
}

type PropsObject = { [typeName: string]: string }