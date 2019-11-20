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
