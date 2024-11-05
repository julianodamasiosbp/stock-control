import { ConfirmationService, MessageService } from 'primeng/api';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CategoriesService } from 'src/app/services/categories/categories.service';
import { Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { GetCategoriesResponses } from 'src/app/models/interfaces/categories/GetCategoriesResponse';
import { DeleteCategoryAction } from 'src/app/models/interfaces/categories/event/DeleteCategoryAction';
import { EditCategoryAction } from 'src/app/models/interfaces/categories/event/EditCategoryAction';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';
import { CategoryFormComponent } from '../../components/category-form/category-form.component';

@Component({
  selector: 'app-categories-home',
  templateUrl: './categories-home.component.html',
  styleUrls: []
})
export class CategoriesHomeComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();
  public categoriesDatas: Array<GetCategoriesResponses> = [];
  private ref!: DynamicDialogRef;

  constructor(private categoriesService: CategoriesService,
    private dialogService: DialogService,
    private MessageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getAllCategories();
  }

  getAllCategories() {
    this.categoriesService.getAllCategories().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if(response.length > 0) {
        this.categoriesDatas = response;
        }
      },
      error: (error) => {
        console.error(error);
        this.MessageService.add({severity:'error', summary:'Erro', detail:'Erro ao buscar categorias', life: 3000});
        this.router.navigate(['/dashboard']);
      }
    })
  }

  handleDeleteCategoryAction(event: DeleteCategoryAction) {
    if(event) {
      this.confirmationService.confirm({
        message: `Confirma a exclusão da categoria: ${event.categoryName}?`,
        header: 'Confirmação de exclusão',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sim',
        rejectLabel: 'Não',
        accept: () => this.deleteCategory(event?.category_id),
      })
    }
  }

  deleteCategory(category_id: any) {
    if(category_id) {
      this.categoriesService.deleteCategory({category_id}).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.getAllCategories();
          this.MessageService.add({severity:'success', summary:'Sucesso', detail:'Categoria removida com sucesso', life: 3000});
        },
        error: (error) => {
          console.error(error);
          this.getAllCategories();
          this.MessageService.add({severity:'error', summary:'Erro', detail:'Erro ao deletar categoria', life: 3000});

        }
      })
    }
  }

  handleCategoryAction(event: EventAction) {
    if(event) {
      this.ref = this.dialogService.open(CategoryFormComponent, {
        header: event?.action,
        width: '70%',
        contentStyle: { overflow: 'auto'},
        baseZIndex: 10000,
        maximizable: true,
        data: {
          event: event
        }
      })

      this.ref.onClose.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.getAllCategories()
      })
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
