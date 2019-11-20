import { Component, Input, OnInit } from '@angular/core';
import { Item } from '../shared/item';
import { ItemService } from '../shared/item.service';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.scss']
})

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