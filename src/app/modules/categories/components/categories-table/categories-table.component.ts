import { Component, Input } from '@angular/core';
import { GetCategoriesResponses } from 'src/app/models/interfaces/categories/GetCategoriesResponse';

@Component({
  selector: 'app-categories-table',
  templateUrl: './categories-table.component.html',
  styleUrls: []
})
export class CategoriesTableComponent {
  @Input() categories: Array<GetCategoriesResponses> = [];
  public categoriesSelected!: GetCategoriesResponses;
}
