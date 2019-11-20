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

**Observer:** Think of an observer as the Angular component that cares about listening to a data stream. Example: Your `ItemsListComponent` wants to listen to a stream of items so they can be displayed to the user.

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

**src/app/items/shared/item.ts**
```typescript
export class Item {
    id: string;
    title: string;
    body: string;
    timeStamp: number;
    active: true;
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
Public variables for item and items are declared for the Firebase observables. We also declare a variable for the path in the NoSQL database. When we perform one of the get operations, the observable variables will be defined. In most cases, you will call a get method from a component during the `NgInit()` lifecycle hook. I am also declaring a helper function to handle errors, which simply logs the error for debugging.
### item.service.ts
```typescript
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Item } from './item';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  private itemsCollection: AngularFirestoreCollection<Item>; //  list of objects
  private items: Observable<Item[]>; //  list of objects
  item: Observable<Item> = null; //   single object

  constructor(
    public afs: AngularFirestore
  ) {
    this.itemsCollection = this.afs.collection('items');
    this.items = this.itemsCollection.snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Item;
          const id = a.payload.doc.id;
          console.log(data);
          return { id, ...data };
        }))
      );
  }
```
### Getting the Observables from Firebase
After calling one of these methods, the data will be synced up with Firebase. Changes made via the UI will be instantly reflected in the database console, and vice versa.
### item.service.ts -- add this code after the constructor
```typescript
getItemsList() {
    return this.items;
  }
```
### Creating Updating, and Deleting Data
The remaining functions do not have return values. They will update the data from the list observable, held in the `items` variable from the previous section.
### item.service.ts -- add this code after getItemsList()
```typescript
createItem(item: Item): void  {
    const date = new Date().getTime();
    this.itemsCollection.doc(date.toString()).set({
        id: date.toString(),
        active: true,
        title: item.title,
        timeStamp: date,
        body: 'test'
    })
        .catch(error => this.handleError(error));
}

// Update an existing item
updateItem(id: string, value: any): void {
    this.itemsCollection.doc(id).set(value)
    .catch(error => this.handleError(error));
}

// Deletes a single item
deleteItem(id: string): void {
    this.itemsCollection.doc(id).delete()
    .catch(error => this.handleError(error));
}

// Default error handling for all actions
private handleError(error) {
    console.log(error);
}
```
## Step 4: Item List Component - The Parent
The `<app-item-list>` is the parent component that will loop over the `FirebaseListObservable` and handle actions related the entire list, mainly deleting all items from the list.

### user-profile.component.html

```html
<div *ngIf="auth.user$ | async; then authenticated else guest">
    <!-- template will replace this div -->
</div>

<!-- User NOT logged in -->
<ng-template #guest>
    <h3>Hi, GUEST</h3>
    <p>Login to get started...</p>

    <button class="button" (click)="auth.googleSignin()">
  <i class="fa fa-google"></i> Connect Google
</button>

</ng-template>


<!-- User logged in -->
<ng-template #authenticated>
    <div *ngIf="auth.user$ | async as user">
        <h3>Howdy, {{ user.displayName }}</h3>
        <img [src]="user.photoURL">
        <p>UID: {{ user.uid }}</p>
        <button class="button" (click)="auth.signOut()">Logout</button>
        <button class="button" routerLink="/items">View Items</button>
    </div>
</ng-template>
```

### app.routing.module.ts -- modify the routes array
```typescript
const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'user-profile', component: UserProfileComponent, canActivate: [AuthGuard] },
  { path: 'items', component: ItemsListComponent }
];
```

### items-list.component.html
Let’s start in the template. We loop over the items using `*ngFor`, but the important thing to note is the `async` pipe. It will subscribe and unwrap any observable as changes happen in the data stream.

Also, notice we are passing each unwrapped item object to the child component. More on this in the next section.
```html
<div *ngFor="let item of items | async">
    <app-item-detail [item]='item'></app-item-detail>
</div>
<app-item-form></app-item-form>
```
### items-list.component.ts
Now we need to define the items variable when the component is initialized using `NgOnInit`. We also create a function to delete the entire list that can be called on the button’s click event in the template.
```typescript
import { Component, OnInit } from '@angular/core';
import { Item } from '../shared/item';
import { ItemService } from '../shared/item.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-items-list',
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.scss']
})

export class ItemsListComponent implements OnInit {

  public items: Observable<Item[]>;

  constructor(private itemSvc: ItemService) { }

  ngOnInit() {
    console.log(this.items);
    return this.items = this.itemSvc.getItemsList();
  }

}
```

## Step 5: Item Detail Component - Passing Data to a Child Component
### items-detail.component.html
The `<item-detail>` component is rendered for each task returned by the list observable. The `@Input` decorator is used to pass data from a parent to a child via the template - in this case it an `Item` object after being unwrapped by the async pipe. From the template we will display the items attributes, then create a few buttons to trigger actions from the service.
```html
<h5>{{ item.title || 'missing title' }}</h5>
Active: {{ item.active }}<br> Timestamp: {{ item.timeStamp | date: 'medium' }}<br><br>

<span class="button" (click)='updateTimeStamp()'>Update Timestamp</span><br>
<span class="button" *ngIf='item.active' (click)='updateActive(false)'>Mark Complete</span>
<span class="button" *ngIf='!item.active' (click)='updateActive(true)'>Mark Active</span><br>
<span class="button" (click)='deleteItem()'>Delete</span>
```
### items-detail.component.
All functions in this component are scoped to modifying an existing item. Here’s a few examples of how use the service to update items in the database.
```typescript
export class ItemDetailComponent implements OnInit {

  @Input() item: Item;

  constructor(private itemSvc: ItemService) { }

  ngOnInit() {}

  updateTimeStamp() {
    const date = new Date().getTime();
    this.item.timeStamp = date;
    this.itemSvc.updateItem(this.item.id, this.item );
  }

  updateActive(value) {
    this.item.active = value;
    this.itemSvc.updateItem(this.item.id, this.item);
  }

  deleteItem() {
    this.itemSvc.deleteItem(this.item.id);
  }

}
```
## Step 6: Building a Form to Add Data

The item form component is another child of `item-list` that handles adding new tasks to the list. It creates a new instance of the `Item` class and binds its title attribute to the form input using the `ngModel` directive.

### item.form.component.html
There are several different form validation methods in Angular. In this example, I am going to take advantage of the `if-then-else` syntax introduced in Angular. This allows us to use a ng-template for valid forms and another for errors.
```html
<input placeholder="Item Title" class="form-control" [(ngModel)]="item.title" required minlength="2" maxlength="23" #title='ngModel' autofocus>
<div *ngIf="title.dirty">
    <span *ngIf='title.errors; then errors else valid'>template renders here...</span>
</div>

<button class="button btn btn-primary" (click)='createItem()' [disabled]="!title.valid">Create</button>
<ng-template #valid>
    <p class="text-success">looks good!</p>
</ng-template>

<ng-template #errors>
    <p class="text-danger">form contains errors!</p>
</ng-template>
```

### item.form.component.ts
Now we can add the item to the database by using the `createItem` function defined in the service.
```typescript
export class ItemFormComponent implements OnInit {

  item: Item = new Item();

  constructor(private itemSvc: ItemService) { }

  ngOnInit() {
  }

  createItem() {
    this.itemSvc.createItem(this.item);
    this.item = new Item(); // reset item
  }
}
```
That wraps it up. You now have the basic CRUD app with Angular that can be infinitely scaled with Firebase.
