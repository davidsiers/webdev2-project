# Reactive CRUD App With Angular and Firebase
We’re going to be building a basic list of items that you do CRUD to - create, read, update, delete. The feature itself is nothing special, it’s really just a skeleton that demonstrates how to do the most common operations with Angular and Firebase. The realtime database from Firebase uses NoSQL, so think of CRUD in the following terms.

### SQL vs. NoSQL
The term CRUD doesn’t really work for Firebase NoSQL, but here’s a general translation for our app.

* create => push
* read => list or object
* update => update or set
* delete => remove

### Thinking Reactively
Angular apps work with asynchronous data streams using RxJS reactive extensions for JavaScript. A data stream can be anything, but in this context we are talking about objects from the firebase Firestore NoSQL database.

Checkout the RxJS manual for comprehensive explanation of reactive extensions. Here are a few important concepts for this lesson.

**Observer:** Think of an observer as the Angular component that cares about listening to a data stream. Example: Your ItemsListComponent wants to listen to a stream of items so they can be displayed to the user.

**Observable:** Think of an observable as a promise to handle multiple future values.

**Subscription:** Observables can be subscribed to, which will provide a snapshot of the stream. In this tutorial it would be a JavaScript object of an item from the database.

The observable pattern allows the frontend UI (Angular) to asynchronously stay up-to-date with the database (Firebase). When we get items from Firebase, we are getting an observable, not a regular JavaScript object. So how do you extract data from an Observable? That’s what this lesson is all about.

## Step 1: Generate the Files
```sh
ng g service items/shared/item
ng g class items/shared/item
ng g component items/items-list
ng g component items/item-detail
ng g component items/item-form
```

## Step 2: Define the Item Class
It’s generally good practice to define data objects in their own TypeScript class.

**item.ts**
```typescript
export class Item {
  $key: string;
  title: string;
  body: string;
  timeStamp: number;
  active: boolean = true;
}
```

## Step 3: Building the Service
This is where all the CRUD magic happens. The service will perform 6 basic operations. AngularFire gives us a simple API to perform these operations with minimal code.

1. Get a list of items
2. Get a single item
3. Create a new item
4. Update an existing item
5. Delete a single item
6. Delete an entire list of items

### Declaring Variables and Helper Functions
Public variables for item and items are declared for the Firebase observables. We also declare a variable for the path in the NoSQL database. When we perform one of the get operations, the observable variables will be defined In most cases, you will call a get method from a component during the NgInit() lifecycle hook. I am also declaring a helper function to handle errors, which simply logs the error for debugging.
```typescript
import { Injectable } from '@angular/core';
import { FirebaseListObservable, FirebaseObjectObservable, AngularFireDatabase } from 'angularfire2/database';
import { Item } from './item';

@Injectable()
export class ItemService {

  private basePath: string = '/items';

  items: FirebaseListObservable<Item[]> = null; //  list of objects
  item: FirebaseObjectObservable<Item> = null; //   single object

  constructor(private db: AngularFireDatabase) { }
}
```

