# Notionable
Notionable is a general purpose package to work with Notion API. For now it contains the full CRUD methods set of Notion database that could be fetched from your integration. 
It, also, will generate Typescript types to have a better experience with databases structure.
## Disclaimer
That tool is in the early stage of development, so it may work not as you (and I) expected, but I will (and maybe you will also) maintain and improve work with Notion API.
## How to use
On first you should create an integration that have access to those databases you want to work with [here](https://www.notion.so/my-integrations).
After you will get your integration secret key you can use it to retrieve your workspace.
### Retrieving the workspace
You can easily retrieve your workspace with `fetchWorkspace` method:
```js
import Notionable from 'notionable'

try {
  const myWorkspace = await Notionable.fetchWorkspace({ auth: YOUR_INTEGRATION_KEY }, './your-types-path') 
  // it will also generate all database types that your integration has access to
} catch (e) {
  console.error(e)
}
```
### Retrieving database CRUD interface
You can pass database name to get it quikly, it isn't case sensitive.
```js
const usersDb = myWorkspace.getDatabase('users')
const users = await usersDb.find() 
// -> User[]
```
### Crud interface methods
Create

```ts
const usersDb = await myWorkspace.getDatabase('users')
const newUser: User = {
  name: 'Stan'
}

const savedUser = await usersDb.create(newUser) 
// -> { id: 'd77da116-13ce-11ec-82a8-0242ac130003' , name: 'Stan' }

const moreSavedUsers = await usersDb.bulkCreate([newUser, newUser])
// -> [
//      { id: 'd77da116-13ce-11ec-82a8-0242ac130003' , name: 'Stan' },
//      { id: 'd77da116-13ce-11ec-82a8-0242ac130003' , name: 'Stan' }
//    ]
```

Read
```ts
const stanQuery= {
  filter: { 
    property: 'name',
    text: {
      contains: 'Stan'
    } 
  }
}

const usersNamedStan = await usersDb.find(stanQuery) 
// -> [{ id: 'd77da116-13ce-11ec-82a8-0242ac130003', name: 'Stan' }]

const oneStan = await usersDb.findOne(stanQuery) 
// -> { id: 'd77da116-13ce-11ec-82a8-0242ac130003', name: 'Stan' }

const userById = await usersDb.findById('d77da116-13ce-11ec-82a8-0242ac130003') 
// -> { id: 'd77da116-13ce-11ec-82a8-0242ac130003', name: 'Stan' }
```

Update
```ts
const newStan: User[] = {
  name: 'Stanly'
}

const stanly = await userDb.updateById('d77da116-13ce-11ec-82a8-0242ac130003', newStan)
// -> { id: 'd77da116-13ce-11ec-82a8-0242ac130003', name: Stanly }

const allTheStanlies = await userDb.updateOne(stanQuery, newStan)
// -> { id: 1, name: Stanly }

const allTheStanlies = await userDb.bulkUpdate(stanQuery, newStan)
// -> [
//      { id: 'd77da116-13ce-11ec-82a8-0242ac130003' , name: 'Stanly' },
//      { id: 'd77da116-13ce-11ec-82a8-0242ac130003' , name: 'Stanly' }
//    ]
```
Delete
```ts
const stanWasDeleted = await userDb.deleteById('d77da116-13ce-11ec-82a8-0242ac130003')
// -> true

const stanWasDeleted = await userDb.deleteOne(stanQuery)
// -> true

const stansWasDeleted = await userDb.bulkDelete(stanQuery)
// -> true
```
