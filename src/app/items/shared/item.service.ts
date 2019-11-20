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

  getItemsList() {
    return this.items;
  }

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

}
