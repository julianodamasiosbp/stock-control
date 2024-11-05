import { Component, EventEmitter, Input, Output } from '@angular/core';
import { categoryEvent } from 'src/app/models/enums/categories/CategoryEvent';
import { DeleteCategoryAction } from 'src/app/models/interfaces/categories/event/DeleteCategoryAction';
import { EditCategoryAction } from 'src/app/models/interfaces/categories/event/EditCategoryAction';
import { GetCategoriesResponses } from 'src/app/models/interfaces/categories/GetCategoriesResponse';

@Component({
  selector: 'app-categories-table',
  templateUrl: './categories-table.component.html',
  styleUrls: []
})
export class CategoriesTableComponent {
  @Input() categories: Array<GetCategoriesResponses> = [];
  @Output() categoryEvent = new EventEmitter<EditCategoryAction>();
  @Output() deleteCategoryEvent = new EventEmitter<DeleteCategoryAction>();
  public categoriesSelected!: GetCategoriesResponses;
  public addCategoryAction = categoryEvent.ADD_CATEGORY;
  public EditCategoryAction = categoryEvent.EDIT_CATEGORY;

  handleDeleteCategoryEvent(category_id: string, categoryName: string): void {
    if(category_id !== '' && categoryName !== '') {
      this.deleteCategoryEvent.emit({
        category_id,
        categoryName
      });
    }
  }

  handleCategoryEvent(action: string, id?: string, categoryName?: string): void {
    if(action && action !== '') {
      this.categoryEvent.emit({action, id, categoryName})
    }
  }
}
